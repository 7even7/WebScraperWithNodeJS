const sharedEvents = require("./EventEmitter.js");
const request = require('request');
const cheerio = require('cheerio');
const cheerioTableparser = require('cheerio-tableparser');
const MongoClient = require('mongodb').MongoClient;
var MongoConnectionString = 'mongodb://crawler:crawler1!@ds023452.mlab.com:23452/crawlerdata'; 
var seedUrl = 'http://www.nettiauto.com/vaihtoautot?id_vehicle_type=1&id_car_type=4&yfrom=2015&show_search=1&mileageTo=155000';
var timeOfScraping = new Date().toJSON()
var carsInDatabase;
var scrapedCars=[];
var pagesToScrape = [];
var pagesLeft;
var carsCollection;
var dbOperationsLeft=0;
var mongo;
var newCarsCount=0;
var updatedCarsCount=0;


// Logic
sharedEvents.on("pageParsed", ()=>{
  //console.log("triggeri laukesi " + pagesLeft)
  pagesLeft--;
  if(pagesLeft==0){
    console.log("Updating Database");
    updateDatabase();  
    
  }
})
sharedEvents.on("pageArrayReady", ()=>{
  for(page of pagesToScrape){
    //console.log("Page " + page + " out of " +pagesToScrape.length +" is being handled")
    ParseListPage(page);    
  }
  console.log("PageArray käsitelty");
    
})
sharedEvents.on('databaseReady', createPageArray);


MongoClient.connect(MongoConnectionString, function (error, db) {
  if(error){
    console.log("Following error occurred "+ error);
  }else{
    mongo=db;
    carsCollection = db.collection('cars');
    loadCarDataFromDatabase();
    
  }
})
function closeDBifDone(){
  dbOperationsLeft--;
  if(dbOperationsLeft==0){
    console.log('Total cars in Database: '+carsInDatabase.length + ' New cars found : '+newCarsCount+'Car prices updated: '+updatedCarsCount);
    console.log("All done, exiting");
    mongo.close();
  }
}
function updateDatabase(){
  for(car of scrapedCars){
    //Update database if a car with same _id is not found.
    if(carsInDatabase.some((carInDB)=> carInDB._id == car._id && carInDB.priceHistory[0][0]==car.price)){;
      //      Placeholder
      
    }else if(carsInDatabase.some((carInDB)=> carInDB._id ==car._id)){
      var updatedCar = carsInDatabase.find((e)=>{return e._id == car._id})
      updatedCar.priceHistory.unshift([car.price, timeOfScraping]);
      updatedCarsCount+=1;
      dbOperationsLeft++;
      carsCollection.updateOne({_id:car._id},updatedCar,{upsert:true},(err,result)=>{
        if (err){
          console.log(err);
        }else{
          closeDBifDone();
        }
      })
    
    }else{
        
      car.priceHistory.unshift([car.price, timeOfScraping]);
      //console.log('Inserting MongoDB with new car: '+ car._id+ ' and price '+car.priceHistory[0][0]);
      newCarsCount+=1;
      dbOperationsLeft++;
      carsCollection.insertOne(car, (err, result)=>{
        if (err){
          console.log(err);
        }else{
          closeDBifDone();
        }
      })
    };
  }
    
 
}

function loadCarDataFromDatabase(){
  carsCollection.find({}).toArray(function (error, result) {
    if (error){
      console.log(error);
    }else{
      carsInDatabase = result;
      console.log("Cars in database: "+ result.length);
      sharedEvents.emit('databaseReady');
    }
  })
}

// Declarations
function Car(URL){
  this.URL=URL;
  this._id=URL;
  this.siteID;
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
  this.price=null;
  this.priceHistory = [];
  this.location="";
  this.seller="";

}


function createPageArray(){
  var Url = seedUrl;
  console.log("Creating a list of list pages")
  request(Url, (error, response, html)=>{
    if (error) {
    console.log("Following error occurred "+ error);
    }else{
      var $ = cheerio.load(html);
      if($('.navigation_link').length==0){
        pagesToScrape.push(Url);
        lastPage=1;
      }else{
        var lastPage = $('a.pageNavigation.dot_block').text()
        for(i=1;i<=lastPage;i++){
          pagesToScrape.push(Url+"&page="+i);
        }
      }
      pagesLeft=lastPage;
      console.log("array valmis " + pagesLeft +" sivua käsiteltävänä"); 
      sharedEvents.emit("pageArrayReady");     
    }
  })
}


function ParseListPage(url){
    //console.log('ParselistPage alkaa');
    var options = {
      uri: url,
      encoding: 'binary'
    }
    request(options, (error, response, html)=>{ 
      if (error) {
        console.log("Following error occurred "+ error);
      }else{
        
        var $ = cheerio.load(html);
        $('div.data_box').each(function(i, listItem){
          var a = $(this);
          // Scrape URL and price from car list.
          var listItemRoot = listItem.parent.parent;
          var URL=$('.childVifUrl.tricky_link', listItemRoot).attr('href');
          // Create a scrapedCar Object with URL
          var scrapedCar = new Car(URL)
          scrapedCar._id=URL.split('/')[URL.split('/').length-1];
          // update car-object with rest of the data
          var price = $('.main_price',this).text().replace(/\D/g,'')
          scrapedCar.price = price; 
          scrapedCar.engine=$('.eng_size', this).text().replace(/[^0-9\.]+/g,""); 
          // Make and model need to be parsed from the same string
          var makeModel = $('.make_model_link', this).text().split(' ');
          scrapedCar.make=makeModel[0];
          scrapedCar.model=makeModel[1];
          // Seller info
          scrapedCar.location=$('.list_seller_info',this).children('b').text();
          scrapedCar.seller=$('.list_seller_info',this).children('span').text()
          
          // Details parsed from List items. Sometimes one of the info pieces is missing and therefore this works only if all 4 are present.
          var otherInfo = $(this).find('li')
          if (otherInfo.length==4){
            scrapedCar.buildYear=otherInfo[0].children[0].data;
            scrapedCar.milage=otherInfo[1].children[0].data.replace(/\D/g,'');
            scrapedCar.fuelType=otherInfo[2].children[0].data;
            scrapedCar.transmission=otherInfo[3].children[0].data;
          }
          
          
          // Hand the car over to processing
          scrapedCars.push(scrapedCar);
        })
      // console.log('list page '+url+ ' parsed' )
      sharedEvents.emit("pageParsed");
      } 
    })
}
