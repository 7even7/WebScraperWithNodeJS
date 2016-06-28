var data = require('./DataAccess');
var request = require('request');
var cheerio = require('cheerio');
var cheerioTableparser = require('cheerio-tableparser');
var url = 'http://www.nettiauto.com/mercedes-benz/cla?id_vehicle_type=1&id_car_type=4';
var url1 = 'http://www.nettiauto.com/mercedes-benz/c?id_vehicle_type=1&id_car_type=4&id_gear_type=3&yfrom=2015'
var url2= 'http://www.nettiauto.com/volkswagen/golf?id_vehicle_type=1&id_car_type=3&id_fuel_type=1&id_gear_type=3&yfrom=2011&yto=2012&show_search=1&engineFrom=1.2&engineTo=1.2&mileageFrom=50000&mileageTo=125000'
var cars =  data.load();
var newCars = 0;
var timeOfScraping = new Date().toJSON()

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
var testiauto = {
	"URL": "http://www.nettiauto.com/mercedes-benz/c/8085672",
	"ID": null,
	"make": "Mercedes-Benz",
	"model": "C",
	"buildYear": "2015",
	"plateNumber": null,
	"drive": null,
	"transmission": "Automaatti",
	"engine": "2.1",
	"fuelType": "Diesel",
	"milage": "99000",
	"firstDate": "2016-06-22T13:40:54.865Z",
	"lastDate": null,
	"firstPriceInEUR": "36900",
	"lastPriceInEUR": null
}

var insertOrUpdateCar = function (CarObject){
    var i = cars.length;
    var carIsNew = true;
    while(i--){
      //Jos auto löytyy, päivitetään sille uusi tarkistusaika
      if (cars[i].URL == CarObject.URL) {
        cars[i].lastDate=timeOfScraping;
        cars[i].lastPriceInEUR=CarObject.firstPriceInEUR;
        carIsNew = false;
      }
    }
    //Jos autoa ei löydy, haetaan sen tiedot autosivulta, lisätään se listalle ja uusien autojen laskuriin +1         
    if (carIsNew){
        getCarDetails(CarObject);
        cars.push(CarObject);
        newCars+=1;
    }
}

var getCarDetails = function(carObject){
  request(carObject.URL, function(error, response, html){
    if (error) {
      console.log("Following error occurred "+ error);
  }else{
    var $ = cheerio.load(html);
    cheerioTableparser($);
    var dataTable = $(".data_table").parsetable(false,false,true)
    
    if(dataTable[0][1]=="Rek.nro"){
      carObject.plateNumber = dataTable[1][1];
    }
    if(dataTable[0][2]=="Vetotapa"){
      carObject.plateNumber = dataTable[1][2];
    }
   } 
  });
}

var getListOfCars = function(url){
    request(url, parseCarListHTML);
}

var parseCarListHTML = function (error, response, html) {
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
      // Push the car object to car list.
      insertOrUpdateCar(newCar);
    });
    data.save(cars);
    console.log("New car entries: "+newCars);

  }
} 
console.log("Car entries in database: "+cars.length);

getListOfCars(url);





