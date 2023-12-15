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

app.post("/acceptSearchPrivateRecipe", (request, response) => {
    const {name} = request.body;

    response.render("acceptSearchPrivateRecipe", {name});
})

app.get("/searchPublicRecipe", (request, response) => {
    response.render("searchPublicRecipe");
});

app.listen(9000);

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