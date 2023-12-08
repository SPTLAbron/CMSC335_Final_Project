
/* Returns a promise */
async function getJSONData() {
    let recipe = "penne"
    const result = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${recipe}`
    );
    const json = await result.json();
  
    return json; /* The result will be wrapped in a promise */
  }
  
  async function getRecipe() {
      const data = await getJSONData(); /* remove await and see what is printed */
      let ingredients = "";
      for(let i  = 0; i < 20; i++){
        let ingr = "strIngredient" + (i + 1);
        let meas = "strMeasure" + (i + 1);
        if ((data.meals[0][ingr] != "" && data.meals[0][ingr] != null) && (data.meals[0][meas] != " " && data.meals[0][meas] != null)) {
            ingredients = ingredients + data.meals[0][ingr] + " - " + data.meals[0][meas] + "\n";
        }
      }
      console.log(data.meals[0].strMeal);
      console.log(ingredients)
      console.log(data.meals[0].strInstructions);

  }
  
  getRecipe();