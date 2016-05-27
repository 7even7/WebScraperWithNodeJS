var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var url = 'http://www.nettiauto.com/mercedes-benz/cla?id_vehicle_type=1&id_car_type=4'

var fetchHTMLfrom = function(url){
    request(url, parseCallbackedHTML);
}


var parseCallbackedHTML = function (error, response, html) {
  if (error) {
    console.log("Following error occurred "+ error);
  }else{
    var $ = cheerio.load(html);
    var list = $(".childVifUrl.tricky_link").map(function(i, obj){return obj.attribs.href}); 
    
    
    
    console.log(typeof list);
  }
} 

fetchHTMLfrom(url);

  /*
  
  Tällä JQueryllä tuli oikea lista linkkejä:
  $(".childVifUrl.tricky_link").each(function(i, obj){console.log(obj.attribs.href)})
  
  
  Linkkejä
  Ohje:
  https://www.smashingmagazine.com/2015/04/web-scraping-with-nodejs/
  
  Ohje2:
  https://scotch.io/tutorials/scraping-the-web-with-node-js
  
  Scraping laajennus scheerioon:
  http://dailyjs.com/2015/02/05/xray/
  
 #ToDo
    
    Phase 1:
    * Haetaan lista autoja
    * 
    
    
    Tarvittavat tiedot:
    ID
    Valmistaja
    Malli
    Vuosimalli
    Rek.Nro
    Vetotapa
    Vaihteisto
    Moottoritilavuus
    Polttoaine
    Mittarilukema
    Päivitetty-date
    
*/