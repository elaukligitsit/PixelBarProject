var express = require('express');                     //A Node.js Framework
var app = express();
var bodyParser = require('body-parser');              //A tool to help use parse the data in a post request
app.use(bodyParser.json());                           // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));   // support encoded bodies
require('dotenv').config()
const needle = require('needle');

const CocktailNames = [
  "A True Amaretto Sour",//#AmarettoSour
  "Aperol Spritz",//#AperolSpritz
  "Apple Highball",//#Highball
  "Boulevardier",//#Boulevardier
  "Cosmopolitan",//#Cosmopolitancocktail
  "Dirty Martini",//#DirtyMartini
  "Dry Martini",//#DryMartini
  "Elderflower Caipirinha",//#Caipirinha
  "Espresso Martini",//#Espressomartini
  "French Negroni",//#Negroni
  "Frosé",//#Frosé
  "Gimlet",//#Gimlet
  "Gin and Soda",//#GinSoda
  "Gin Lemon",//#GinLemon
  "Gin Rickey",//#GinRickey
  "Gin Tonic",//#GinTonic
  "Hot Toddy",//#HotToddy
  "Lazy Coconut Paloma",//#Paloma
  "Lemon Drop", //#LemonDrop
  "Manhattan", //#ManhattanCocktail
  "Martini", //#Martini
  "Michelada", //#Michelada
  "Mojito", //#Mojito
  "Old Fashioned", //#OldFashioned
  "Whiskey Sour" //#WhiskeySour
]

const CocktailHashtag= [
  "#AmarettoSour",
  "#AperolSpritz",
  "#Highball",
  "#Boulevardier",
  "#Cosmopolitancocktail",
  "#DirtyMartini",
  "#DryMartini",
  "#Caipirinha",
  "#Espressomartini",
  "#Negroni",
  "#Frosé",
  "#Gimlet",
  "#GinSoda",
  "#GinLemon",
  "#GinRickey",
  "#GinTonic",
  "#HotToddy",
  "#Paloma",
  "#LemonDrop",
  "#ManhattanCocktail",
  "#Martini",
  "#Michelada",
  "#Mojito",
  "#OldFashioned",
  "#WhiskeySour"
]
//docker run -dp 4214:4214 --name pixelbar-v1 -e MONGODB_CONNSTRING=mongodb:// pixelbar-v1
const { MongoClient, ServerApiVersion } = require('mongodb');
// or as an es module:
// import { MongoClient } from 'mongodb'

// Connection URL
//const connString = process.env.MONGODB_CONNSTRING;
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url); //const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Database Name
const dbName = 'pixelbar';

async function checkMDB() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName);
  const collection = db.collection('user');
  //db.user.insert({name: "#Mojito", id: 1503905472822542336, geo: null})
  console.log(await collection.find({}).toArray());

  // the following code examples can be pasted here...

  return 'done.';
}

async function queryMDB() { // ## This will be used to make the chart, not the map becuase it wont pass geo
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName);
  const collection = db.collection('user');
  var totalsArr = []
  for (let i = 0; i < 25; i++) {
    var temp = await collection.find({twhash:CocktailHashtag[i]}).toArray()
    var agg = 0
    for (let j = 0; j < temp.length; j++){
      agg = agg + temp[j].twdata.meta.result_count
    }
    totalsArr.push({twhash:CocktailHashtag[i], twcount:agg, ctname:CocktailNames[i]})
  }
  totalsArr.sort(function(a, b) {
    return parseFloat(b.twcount)- parseFloat(a.twcount);
  });
  return totalsArr //This passes the hash and the count

  //return await collection.find().toArray();
}

async function queryMap(mapCocktail) { // ## This will be used to make the chart, not the map becuase it wont pass geo
  // Use connect method to connect to the server
  console.log("mapCocktail: "+ mapCocktail);
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName);
  const collection = db.collection('user');
  console.log("countryCounts: ");
  const pipeline = [
    { $match: { twhash: `${mapCocktail}` } },
    { $group: { _id: "$twdata.includes.places.country_code", count: { $sum: 1 } } }
  ];

  const pipelineDos = [
    { $group: { _id: "$_id", count: { $sum: 1 } } }
  ];
  const tryDist = [
    "twdata.includes.places.country_code", { twhash: `${mapCocktail}` } 
  ]

  const moreQuests = [
    {
      $match: { twhash: `${mapCocktail}` }
    },
    {
      $group: {
          _id: {$toLower: '$twdata.includes.places.country_code'},
          count: { $sum: 1 }
      }
    },
    { 
      $unwind: "$_id" 
    }
  ]

  var countryCounts = [];
  const aggCursor =  collection.aggregate(pipeline);
  const distincts = await collection.distinct("twdata.includes.places.country_code", { twhash: `${mapCocktail}` });
  console.log(distincts);
  var temp = await collection.find({twhash:`${mapCocktail}`}).limit(1).toArray();
  //console.log({temp});
  var tweetsArr = [];
  for (let i = 0; i < 1; i++) {
    tweetsArr.push(temp[0].twdata.data[0]);
  }


  for (let i = 0; i < distincts.length; i++) {
    countryCounts.push({code:distincts[i], value:0});
  }

  for await (const doc of aggCursor) {
      for (let i = 0; i < distincts.length; i++) {
        if (doc._id)  {
          for (let j = 0; j < doc._id.length; j++) {
            if (doc._id[j] == distincts[i]){
              countryCounts[i].value += 1;
            }
          }
        }
        
      }
  }

  return [countryCounts, tweetsArr]; //This should pass a parsable object with country code and num occurences
}

async function distinct(collection, field, query) {
  const db = client.db(dbName);
  console.log("col,field,q");
  console.log(collection + ", " + field + ", " + query);
  var map = {}
  await db[collection].aggregate([
    { $match: query || {} },
    { $group: { _id: '$' + field, c: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]).forEach(function (g) {
    map[g._id] = g.c
  })
  return map
}

async function populateMDB(hashtag,cocktailName,twid) { // ## Populates the mongodb
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName);
  const collection = db.collection('user');
  //db.user.insert({name: "#Mojito", id: 1503905472822542336, geo: null})
  collection.insertOne({twhash: hashtag, ctname: cocktailName,twdata:twid}, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
  });
  return 'done.';
}

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));//This line is necessary for us to use relative paths and access our resources directory

//route the blank URL to /home
app.get('/', function(req, res) {
  res.redirect("/home");
}); 

app.get('/home', function(req, res) {
	queryMDB().then(function(data){ // Getting the data from mongo
    console.log(data);
    res.render('pages/home',{
      my_title: "Home",
      head: req._parsedOriginalUrl.query,
      tweetData: data //Passing the data to mongo in ejs form
    })
  })
    .catch(function (err) {
      console.log('error', err);
      res.render('pages/home', {
        my_title: 'Home',
        tweetData: ''
      })
    })
});

app.get('/map', function(req, res) {
	queryMap(''.concat('#',req._parsedOriginalUrl.query)).then(function(data){ //right now this just resturns the testing array, working on getting the mongo query working
    console.log("data from qMap");
    console.log(data);




    res.render('pages/map',{
      my_title: "Map",
      head: ''.concat('#',req._parsedOriginalUrl.query),
      popularityData: data[0], //Should be passing arrays of results
      tweets: data[1]
    })
  })
    .catch(function (err) {
      console.log('error', err);
      res.render('pages/map', {
        my_title: 'Map',
        head: '',
        popularityData: '',
        tweets: ''
      })
    })
});


const token = process.env.TWITTER_TOKEN;

const endpointUrl = 'https://api.twitter.com/2/tweets/search/recent?'

async function passedReq(curHash,curName, nxtToken) { //This is the function that gets the tweets by next token
  const params = {
      'query': curHash,
      'next_token': nxtToken,
      'max_results': 100,
      'tweet.fields': 'geo',
      'expansions': 'geo.place_id',
      'place.fields': 'country_code'
  }
  const res = await needle('get', endpointUrl, params, {
      headers: {
          "User-Agent": "v2FullArchiveJS",
          "authorization": `Bearer ${token}`
      }
  })
  console.log(res.body.meta.result_count)

  if (res.body && res.body.meta.hasOwnProperty('next_token')) {//Checks for next token
      console.log("Still works")
      populateMDB(curHash,curName,res.body)//add to mongo
      await passedReq(curHash, curName,res.body.meta.next_token)//Pass next token
      return 1;
    }
  else if(res.body){
      populateMDB(curHash,curName,res.body)//add to mongo
      return 1;
    }
  else {
        throw new Error('Unsuccessful request');
    }
}


async function getRequest(curHash,curName) { //this is the function that gets the tweets by hashtag
    // These are the parameters for the API request
    const params = {
        'query': curHash,
        'tweet.fields': 'geo',
        'max_results': 100,
        'expansions': 'geo.place_id',
        'place.fields': 'country_code'
    }

    const res = await needle('get', endpointUrl, params, {
        headers: {
            "User-Agent": "v2FullArchiveJS",
            "authorization": `Bearer ${token}`
        }
    })
    console.log(res.body.meta.result_count)

    if (res.body && res.body.meta.hasOwnProperty('next_token')) {//Checks for next token
      console.log("WORKING")
      populateMDB(curHash,curName,res.body) //add to mongo
      await passedReq(curHash,curName,res.body.meta.next_token) //Pass next token
      return 1;
    }
    else if(res.body){
      populateMDB(curHash,curName,res.body)//add to mongo
      return 2;
    }
    else {
        throw new Error('Unsuccessful request');
    }
}

async function main(){ 
  /*
  for (let i = 0; i < 25; i++) {//RUN EVERY THURSDAY AT NOON
    getRequest(CocktailHashtag[i],CocktailNames[i])
  }
  const res = await queryMDB()
  */
  return 1;
}

(async () => {

  try {
      console.log("############## START ##################")
      // Make request
      const response = await main();
      console.dir(response, {
          depth: null
      });
      //await checkMDB()

  } catch (e) {
      console.log(e);
      process.exit(-1);
  }
})();

//docker build . -t pixel-bar
//docker run -dp 4214:4214 pixel-bar
const server = app.listen(process.env.PORT || 4214, () => {
    console.log(`Express running → PORT ${server.address().port}`);
  });
module.exports = app.listen(3001);;
console.log('4214 is the magic port');
