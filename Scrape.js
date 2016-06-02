var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var jsonfile = require('jsonfile');
var file = './JSON.json';
var url = 'http://www.nettiauto.com/mercedes-benz/cla?id_vehicle_type=1&id_car_type=4';
var cars = [];

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
  this.price=null;

}

var getListOfCars = function(url){
    request(url, parseResponseHTML);
}


var parseResponseHTML = function (error, response, html) {
  if (error) {
    console.log("Following error occurred "+ error);
  }else{
    var $ = cheerio.load(html);
    var list = $(".childVifUrl.tricky_link").map(function(i, obj){return obj.attribs.href}); 
    for (i = 0; i<list.length;i++){
      var newCar = new Car(list[i]);
      newCar.price = list[i];
      
      cars.push(newCar);
    }
    writeToFile(cars);
  }
} 

var writeToFile = function(object){
  jsonfile.writeFile(file,object, function(err) {
      if(err){
        console.log(err);
      }else{
        console.log("Writing File is Done");  
      }
  })

  
}




getListOfCars(url);
