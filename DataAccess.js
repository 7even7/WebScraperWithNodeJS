var fs = require('fs');
var jsonfile = require('jsonfile');
var file = './ScrapeData.json';
var MongoClient = require('mongodb').MongoClient;
var MongoConnectionString = 'mongodb://ds023452.mlab.com:23452/crawlerdata'; 

MongoClient.connect(MongoConnectionString, function (error, db) {
  if(error){
    console.log("Following error occurred "+ error);
  }else{
    db.close();
    
    
  }

  
})


var readFromFile = function () {
    return jsonfile.readFileSync(file);
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

module.exports.save = writeToFile;
module.exports.load = readFromFile;