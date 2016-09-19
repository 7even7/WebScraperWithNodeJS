var sharedEvents = require("./EventEmitter.js");
var request = require('request');
var cheerio = require('cheerio');
var cheerioTableparser = require('cheerio-tableparser');
var seedUrl = 'http://www.nettiauto.com/mercedes-benz/c?id_vehicle_type=1&id_car_type=4&yfrom=2015';
var timeOfScraping = new Date().toJSON()
var newCars;
var file = './ScrapeData.json';
var carsInDatabase;
var fs = require('fs');
var jsonfile = require('jsonfile');
var pagesToScrape = [];
var pagesLeft;

// Logic
sharedEvents.on("pageParsed", ()=>{
  console.log("triggeri laukesi " + pagesLeft)
  pagesLeft--;
  if(pagesLeft==0){
    writeToFile(carsInDatabase);
    console.log("write to file kutsuttu");
  }
})

sharedEvents.on("pageArrayReady", ()=>{
  for(page of pagesToScrape){
    console.log("Page " + page + " out of " +pagesToScrape.length +" is being handled")
    getListOfCars(page);    
  }
  console.log("valmis");
    
})
sharedEvents.on('databaseReady', doStuff);
loadCarsFromDatabase();


function doStuff(){
  console.log("Starting to Do stuff")
//  getListOfCars(url);
  createPageArray(seedUrl);
  
}



// Declarations
function Car(URL){
  this.URL=URL;
  this.ID=null;
  this.make=null;
  this.model=null;
  this.buildYear=null;
  this.plateNumber=null;
  this.drive=null;
  this.transmission=null;
  this.engine=null;
  this.fuelType=null;
  this.milage=null;
  this.firstDate=timeOfScraping;
  this.lastDate=null;
  this.firstPriceInEUR=null;
  this.lastPriceInEUR=null;
}

function loadCarsFromDatabase () {
    carsInDatabase = jsonfile.readFileSync(file);
    console.log("database file read");
    sharedEvents.emit('databaseReady');
}

function writeToFile(object){
  jsonfile.writeFile(file,object, function(err) {
      if(err){
        console.log(err);
      }else{
        console.log("Car entries in database: "+object.length);
        console.log("Writing File is Done");
      }
  })
}

function insertOrUpdateCar(CarObject){
    var i = carsInDatabase.length;  
    var carIsNew = true;
    while(i--){
      //Jos auto löytyy, 
      if (carsInDatabase[i].URL == CarObject.URL) {
        //päivitetään autolle tarkistusaika
        carsInDatabase[i].lastDate=timeOfScraping;
        carIsNew = false;
        continue;
      }
    }
    //Jos autoa ei löydy, haetaan sen tiedot autosivulta, lisätään se tietokantaan          
    if (carIsNew){
        //carsInDatabase.push(CarObject);
        console.log("new car found "+CarObject.URL);
        getCarDetails(CarObject);
    }
    console.log(CarObject.URL + " " + carsInDatabase.length);
}

function getCarDetails(carObject){
  pagesLeft++;
  var cartobeUpdated = carObject;
  request(cartobeUpdated.URL, function(error, response, html){
    if (error) {
      console.log("Following error occurred "+ error);
  }else{
    var $ = cheerio.load(html);
    cheerioTableparser($);
    var dataTable = $(".data_table").parsetable(false,false,true)
    
    if(dataTable[0][1]=="Rek.nro"){
      cartobeUpdated.plateNumber = dataTable[1][1];
    }
    if(dataTable[0][2]=="Vetotapa"){
      cartobeUpdated.drive = dataTable[1][2];
    }
    carsInDatabase.push(cartobeUpdated);
    console.log(carObject.URL)
    console.log(carObject.plateNumber + " updated");
    sharedEvents.emit("pageParsed")
   } 
  });
}

function createPageArray(Url){
  request(Url, (error, response, html)=>{
    if (error) {
    console.log("Following error occurred "+ error);
    }else{
      var $ = cheerio.load(html);
      var lastPage = $('.navigation_link')[0].children.length
      for(i=1;i<=lastPage;i++){
        pagesToScrape.push(Url+"&page="+i);
      }
      pagesLeft=lastPage;
      sharedEvents.emit("pageArrayReady");     
      console.log("array valmis " + pagesLeft); 
    }
  })
}


function getListOfCars(url){
    request(url, parseCarListPage);
    console.log('Getlistofcars alkaa');
}

function parseCarListPage(error, response, html) {
  if (error) {
    console.log("Following error occurred "+ error);
  }else{
    var $ = cheerio.load(html);
    $('div.data_box').each(function(i, listItem){
      var a = $(this);
      // Scrape URL and price from car list.
      var listItemRoot = listItem.parent.parent;
      var URL=$('.childVifUrl.tricky_link', listItemRoot).attr('href');
      // Create a newCar Object with URL
      var newCar = new Car(URL)
      // update car-object with rest of the data
      newCar.firstPriceInEUR = $('.main_price',this).text().replace(/\D/g,'')
      newCar.engine=$('.eng_size', this).text().replace(/[^0-9\.]+/g,""); 
      // Make and model need to be parsed from the same string
      var makeModel = $('.make_model_link', this).text().split(' ');
      newCar.make=makeModel[0];
      newCar.model=makeModel[1];
      
      // Details parsed from List items. Sometimes one of the info pieces is missing and therefore this works only if all 4 are present.
      var otherInfo = $(this).find('li')
      if (otherInfo.length==4){
        newCar.buildYear=otherInfo[0].children[0].data;
        newCar.milage=otherInfo[1].children[0].data.replace(/\D/g,'');
        newCar.fuelType=otherInfo[2].children[0].data;
        newCar.transmission=otherInfo[3].children[0].data;
      }
      
      plateNumber=null;
      drive=null;
      ID=null;
      // Hand the car over to processing
      insertOrUpdateCar(newCar);
      

    });

  console.log('list page parsed' )
  sharedEvents.emit("pageParsed");
  

  }
} 









