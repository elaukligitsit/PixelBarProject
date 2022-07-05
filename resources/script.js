let baseURL = 'https://www.thecocktaildb.com/api/json/v1/1/'; //filter.php?c=Cocktail

let getNames = function() {
    let urlNames = "".concat(baseURL, 'filter.php?c=Cocktail');
    console.log(urlNames);
    fetch(urlNames)
    .then((result)=>{
        return result.json();
    })
    .then((data)=>{
        //SEARCH
        console.log(data);
        const ctNames = new Array(100)
        for(let i=0; i<100;i++){
            ctNames[i] = data.drinks[i].strDrink;
        }
        console.log(ctNames);
    })
    .catch(function(){
        alert("Not a valid response");
    });
}

function makeChart(testLabels,testData){
  var ctx = document.getElementById("myChart");
  var myChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: testLabels,
      datasets: [{
        label: 'Popular Cocktails',
        data: testData,
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(128, 50, 190, 0.2)',
          //'rgba(128, 128, 128, 0.2)'
        ],
        borderColor: [
          'rgba(255,99,132,1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(128, 50, 190, 1)',
          //'rgba(128, 128, 128, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      //cutoutPercentage: 40,
      responsive: false,

    }
  });
  return myChart
}
let search4Cocktail = function(cocktailSearch) {
  let url = "".concat("".concat(baseURL, 'search.php?s='),cocktailSearch);
  console.log(url);
  fetch(url)
  .then((result)=>{
      return result.json();
  })
  .then((data)=>{
      console.log(data);
      var row = document.getElementById('recipeCard');
      var col1 = document.createElement('div');
      col1.className='col-10';
      var img = document.createElement('img');  //img
      img.src = data.drinks[0].strDrinkThumb;
      img.style="width:100px";
      img.style="height:200px";
      col1.appendChild(img);

      var col2 = document.createElement('div');
      col2.className='col-12';
      var h4 = document.createElement('h4');  //drink title
      h4.innerText = data.drinks[0].strDrink;
      h4.className='text-light';
      col2.appendChild(h4);

      var ingtag = document.createElement('strong');  //instructions
      ingtag.className = 'text-light';
      ingtag.innerText = 'Ingredients: \n';
      col2.appendChild(ingtag);
      var ingredients = document.createElement('p')
      ingredients.className = 'text-light';
      if(data.drinks[0].strIngredient1 != null && data.drinks[0].strIngredient1 != ""){
        ingredients.innerText =  data.drinks[0].strIngredient1;
      }
      if(data.drinks[0].strIngredient2 != null && data.drinks[0].strIngredient2 != ""){
        ingredients.innerText += ', ' + data.drinks[0].strIngredient2;
      }
      if(data.drinks[0].strIngredient3 != null && data.drinks[0].strIngredient3 != ""){
        ingredients.innerText += ', ' + data.drinks[0].strIngredient3;
      }
      if(data.drinks[0].strIngredient4 != null && data.drinks[0].strIngredient4 != ""){
        ingredients.innerText += ', ' + data.drinks[0].strIngredient4;
      }
      if(data.drinks[0].strIngredient5 != null && data.drinks[0].strIngredient5 != ""){
        ingredients.innerText += ', ' + data.drinks[0].strIngredient5;
      }
      if(data.drinks[0].strIngredient6 != null && data.drinks[0].strIngredient6 != ""){
        ingredients.innerText += ', ' + data.drinks[0].strIngredient6;
      }
      col2.appendChild(ingredients)

      var instructionsTag = document.createElement('strong');  //instructions
      instructionsTag.className = 'text-light';
      instructionsTag.innerText = 'Instructions: ';
      col2.appendChild(instructionsTag);
      var instructions = document.createElement('p')
      instructions.className = 'text-light';
      instructions.innerText =  data.drinks[0].strInstructions;
      col2.appendChild(instructions);

      row.appendChild(col1);
      row.appendChild(col2);
  })
  .catch(function(err){
      alert(err);
  });
}