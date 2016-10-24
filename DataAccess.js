var sharedEvents = require("./EventEmitter.js");
var fs = require('fs');
var jsonfile = require('jsonfile');
var file = './ScrapeData.json';
var MongoClient = require('mongodb').MongoClient;
var MongoConnectionString = 'mongodb://crawler:crawler1!@ds023452.mlab.com:23452/crawlerdata'; 
var carsInDatabase;
var newCars; 



/*
MongoClient.connect(MongoConnectionString, function (error, db) {
  if(error){
    console.log("Following error occurred "+ error);
  }else{
    mongoDB = db;
    sharedEvents.emit("mongoReady");

  }
})

sharedEvents.on("mongoReady", getCarIDsAndPricesFromDatabase);

function getCarIDsAndPricesFromDatabase(){
  var cars = mongoDB.collection('cars');
  cars.find({},{lastPriceInEUR: 1}).toArray(function (error, result) {
    if (error){
      console.log(error);
    }else{
      carsInDatabase = result;
      console.log("Autoja kannassa: "+ carsInDatabase.length);
    }
  })
}
*/
data.data = carsInDatabase;

data.load = function loadCarsFromDatabase () {
    carsInDatabase = jsonfile.readFileSync(file);
    console.log("database file read");
    sharedEvents.emit('databaseReady', "tekstiä");
}



data.insertOrUpdateCar = function insertOrUpdateCar(CarObject){
    var i = carsInDatabase.length;
    var carIsNew = true;
    while(i--){
      //Jos auto löytyy, 
      if (carsInDatabase[i].URL == CarObject.URL) {

        carIsNew = false;
      }
    }
    //Jos autoa ei löydy, haetaan sen tiedot autosivulta, lisätään se listalle          
    if (carIsNew){
        getCarDetails(CarObject);
        newCars.push(CarObject);
    }
}

