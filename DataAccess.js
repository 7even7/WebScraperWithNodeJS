var fs = require('fs');
var jsonfile = require('jsonfile');
var file = './ScrapeData.json';

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