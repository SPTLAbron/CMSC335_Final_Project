const path = require("path");
const express = require("express");
const ejs = require("ejs");
const app = express();  /* app is a request handler function */
const bodyParser = require("body-parser")

app.use(bodyParser.urlencoded({extended:false}));
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

app.get("/", (request, response) => {
    response.render("index");
});

app.get("/addRecipe", (request, response) => {
    response.render("addRecipe");
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

app.get("/searchPublicRecipe", (request, response) => {
    response.render("searchPublicRecipe");
});

app.post("/showPublicRecipe", async (request, response) => {
    const {name} = request.body;
    let person = await getRecipe(name);
    response.render("showPublicRecipe", person);
});

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

app.listen(5000);

process.stdin.setEncoding("utf8");

console.log("Web server started and running at http://localhost:5000");

const prompt = "Stop to shutdown the server: ";
process.stdout.write(prompt);
process.stdin.on("readable", function () {
    let dataInput = process.stdin.read();
    if (dataInput !== null) {
      let command = dataInput.trim();
      if (command === "stop") {
        process.stdout.write("Shutting down the server\n");
        process.exit(0);
      }
    }
  });