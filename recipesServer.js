const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '.env') }) 

const express = require("express");
const http = require('http');
const ejs = require("ejs");
const fs = require('fs');
const app = express();  /* app is a request handler function */
const bodyParser = require("body-parser")
const readline = require('readline');

const { MongoClient, ServerApiVersion } = require('mongodb');

class MongoRepo {
  #dbClient;
  #mdb_coll;
  #mdb_db;

  constructor() {
    const username = process.env.MONGO_DB_USERNAME;
    const password = process.env.MONGO_DB_PASSWORD;
    const dbName = process.env.MONGO_DB_NAME;
    const collectionName = process.env.MONGO_COLLECTION;

    if (!username || !password || !dbName || !collectionName) {
      throw new Error("MongoDB configuration is missing in environment variables");
    }

    const uri = `mongodb+srv://${username}:${password}@cluster0.ujon1ig.mongodb.net/${dbName}?retryWrites=true&w=majority`;
    this.#dbClient = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
    this.#mdb_db = dbName;
    this.#mdb_coll = collectionName;
  }

  getClient() {
    return this.#dbClient;
  }

  getDB() {
    return this.#mdb_db;
  }

  getCollection() {
    return this.#mdb_coll;
  }
}


const mongoRepo = new MongoRepo();
const dbClient = mongoRepo.getClient();

async function addRecipe(recipe){
  try {
    await dbClient.connect();
    const result = await dbClient.db(mongoRepo.getDB()).collection(mongoRepo.getCollection()).insertOne(recipe);
  } catch (e) {
    console.error(e);
  } finally {
    await dbClient.close();
  }
}

async function getRecipeByName(name){
  let filter = {name:name};
  try {
    await dbClient.connect();
    const result = await dbClient.db(mongoRepo.getDB()).collection(mongoRepo.getCollection()).findOne(filter);
    if(result) {
      return result;
    }else {
      console.log(`No recipe found with that name :( ${name}`);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await dbClient.close();
  }
}

async function getRecipe(name) {
  const result = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`);
  const data = await result.json();
  let ingredients = "";
  if (data.meals == null) {
    let noneFound = {
        mealName: `"${name}" not found! Try searching "penne" :)`,
        ingredientList: "Ingredients Not Found",
        instructions: "Instructions Not Found",
      };
    return noneFound;
  }
  for(let i  = 0; i < 20; i++){
    let ingr = "strIngredient" + (i + 1);
    let meas = "strMeasure" + (i + 1);
    if ((data.meals[0][ingr] != "" && data.meals[0][ingr] != null) && (data.meals[0][meas] != " " && data.meals[0][meas] != null)) {
        ingredients = ingredients + data.meals[0][ingr] + " - " + data.meals[0][meas] + "; ";
    }
  }
  let person = {
    mealName: data.meals[0].strMeal,
    ingredientList: ingredients,
    instructions: data.meals[0].strInstructions,
  };
  //console.log(person.mealName + "1");
  //console.log(person.ingredientList + "1");
  //console.log(person.instructions);
  return person;

}

class recipesServer {
  #server;
  constructor() {
    this.app = express();
    this.#server = http.createServer(this.app);
    this.app.set('views', __dirname + '/templates');
    this.app.set('view engine', 'ejs');
  }

  startServer() {
    process.stdin.setEncoding("utf8");
    const prompt = "Stop to shutdown the server: ";
    process.stdout.write(prompt);
    process.stdin.on("readable", function () {
        let dataInput = process.stdin.read();
        if (dataInput !== null) {
          let command = dataInput.trim();
          if (command === "stop") {
            process.stdout.write("Shutting down the server\n");
            process.exit(0);
          } else {
            console.log(`Invalid command: ${command}`);
          }
        }
      });
      this.#server.listen(3000, () => {
        console.log("Web server started and running at http://localhost:3000");
        process.stdout.write(prompt);
      });
      this.defineEndpoints();
  }

  defineEndpoints() {
    const app = this.app;
    app.use(bodyParser.urlencoded({extended:false}));
    app.set("views", path.resolve(__dirname, "templates"));
    app.set("view engine", "ejs");
  
    app.get("/", (request, response) => {
        response.render("index");
    });

    app.post("/processRecipe" , (request, response) => {
      const {name} = request.body;
      const ingr =  request.body.ingr;
      const instr =  request.body.instr;
      let recipe = {name: name, ingr: ingr, instr: instr};
      addRecipe(recipe);
      response.render('acceptRecipe.ejs', {name, ingr, instr});
    });

    app.get('/addRecipe', (request, response) => {
      response.render('addRecipe.ejs');
    });

    app.post("/acceptRecipe", (request, response) => {
        const {name} = request.body;
        const ingr = request.body.ingr;
        const instr = request.body.instr;
  
        response.render("acceptRecipe", {name, ingr, instr});
    });
  
    app.get("/searchPrivateRecipe", (request, response) => {
        response.render("searchPrivateRecipe");
    });

    app.post("/processSearchPriv", (request, response) => {
      const { name } = request.body;
      getRecipeByName(name).then(recipe =>  {
        if(recipe) {
          response.render('acceptSearchPrivateRecipe.ejs', {name: recipe.name, ingr: recipe.ingr, instr: recipe.instr});
        } else {
          response.render('acceptSearchPrivateRecipe.ejs', {name:'NONE', ingr:'NONE', instr: 'NONE'});
        }
      });
    });
     
  
    app.get("/searchPublicRecipe", (request, response) => {
        response.render("searchPublicRecipe");
    });
  
    app.post("/showPublicRecipe", async (request, response) => {
        const {name} = request.body;
        let person = await getRecipe(name);
        response.render("showPublicRecipe", person);
    });
  }  
}
const recipeServer = new recipesServer();
recipeServer.startServer();