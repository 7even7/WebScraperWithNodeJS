var data = require('./DataAccess');
var request = require('request');
var cheerio = require('cheerio');
var url = 'http://www.nettiauto.com/mercedes-benz/cla?id_vehicle_type=1&id_car_type=4';
var cars =  data.load();

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
  this.checkDate=[Date.now()];
  this.priceInEUR=null;
}

var upsertCar = function(carObject){
  var count = 5;
  for (car in cars){
    if (car.URL == carObject.URL){
      count+=1;
    }
  }
  return count;
   
}


var getListOfCars = function(url){
    request(url, parseResponseHTML);
}


var parseResponseHTML = function (error, response, html) {
  if (error) {
    console.log("Following error occurred "+ error);
  }else{
    var $ = cheerio.load(html);
    var list = $(".main_price").each(function(i, listItem){
      // Scrape URL and price from car list.
      var url = listItem.parent.parent.parent.parent.parent.children[1].attribs.href;
      var price = listItem.children[0].data;
      // Create a newCar Object with URL and Price properties.
      var newCar = new Car(url)
      newCar.priceInEUR = price.replace(/\D/g,''); 
      // Push the car object to car list.
      cars.push(newCar);
    });
    data.save(cars);

  }
} 
//getListOfCars(url);
var testiAuto = new Car("http://www.nettiauto.com/mercedes-benz/cla/7746358");
var autoja = upsertCar(testiAuto);
console.log(autoja);
