var data = require('./DataAccess');
var request = require('request');
var cheerio = require('cheerio');
var url = 'http://www.nettiauto.com/mercedes-benz/cla?id_vehicle_type=1&id_car_type=4';
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

var testiauto= {
	"URL": "http://www.nettiauto.com/mercedes-benz/cla/8079918",
	"ID": null,
	"make": null,
	"model": null,
	"buildYear": null,
	"plateNumber": null,
	"drive": null,
	"transmission": null,
	"engine": null,
	"fuelType": null,
	"milage": null,
	"firstDate": "2016-06-10T11:29:23.538Z",
	"lastDate": null,
	"firstPriceInEUR": "37900",
	"lastPriceInEUR": null
};

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
    //Jos autoa ei löydy, lisätään se listalle ja uusien autojen laskuriin +1         
    if (carIsNew){
        //CarObject.update();
        cars.push(CarObject);
        newCars+=1;
    }
}

var getCarDetails = function(carObject){
  request(carObject.URL, function(error, response, html){
    var $ = cheerio.load(html);


  });
  

}
//getCarDetails(testiauto);

var getListOfCars = function(url){
    request(url, parseCarListHTML);
}

var parseCarListHTML = function (error, response, html) {
  if (error) {
    console.log("Following error occurred "+ error);
  }else{
    var $ = cheerio.load(html);
    $(".main_price").each(function(i, listItem){
      // Scrape URL and price from car list.
      var url = listItem.parent.parent.parent.parent.parent.children[1].attribs.href;
       
      // Create a newCar Object with URL
      var newCar = new Car(url)
      // update car-object with rest of the data
      var price = listItem.children[0].data;
      newCar.firstPriceInEUR = price.replace(/\D/g,'');
      var makeAndModel = listItem.parent.parent.parent.children[1].children[0].data.split(' ');
      newCar.make =  makeAndModel[0];
      newCar.model = makeAndModel[1];
      // Push the car object to car list.
      insertOrUpdateCar(newCar);
    });
    data.save(cars);
    console.log("New car entries: "+newCars);

  }
} 
console.log("Car entries in database: "+cars.length);
getListOfCars(url);




