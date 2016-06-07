var data = require('./DataAccess');
var request = require('request');
var cheerio = require('cheerio');
var url = 'http://www.nettiauto.com/mercedes-benz/cla?id_vehicle_type=1&id_car_type=4';
var cars =  data.load();
var newCars = 0;


Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

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
  this.checkDate=[new Date().toJSON()];
  this.priceInEUR=null;
}

var insertIfNewCar = function (CarObject){
  if (!cars.contains(CarObject)){
    cars.push(CarObject);
    newCars+=1;
  }

}


var getListOfCars = function(url){
    request(url, parseCarListHTML);
}

var parseCarListHTML = function (error, response, html) {
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
      insertIfNewCar(newCar);
    });
    data.save(cars);

  }
} 
console.log("Car entries in database: "+cars.length);
getListOfCars(url);
console.log("New car entries: "+newCars);



