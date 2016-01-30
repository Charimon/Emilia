var https = require('https');
var fs = require('fs');
// var airports = require('airports');
var airports = [
  {
    iata: "SEA",
    lon: "-122.301735",
    iso: "US",
    status: 1,
    name: "Seattle Tacoma International Airport",
    continent: "NA",
    type: "airport",
    lat: "47.44384",
    size: "large"
  },
  {
    iata: "YVR",
    lon: "-123.17919",
    iso: "CA",
    status: 1,
    name: "Vancouver International Airport",
    continent: "NA",
    type: "airport",
    lat: "49.1947",
    size: "large"
  },
  {
    iata: "SFO",
    lon: "-122.38988",
    iso: "US",
    status: 1,
    name: "San Francisco International Airport",
    continent: "NA",
    type: "airport",
    lat: "37.615215",
    size: "large"
  }
]


var options = {} //put the startup options you want here
var lunr = require('lunr');

var conf = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

var expedia_key = conf.expedia_key;

var idx = lunr(function () {
  this.field('name')
})
for (i = 0; i < airports.length; i++) { 
  var airport = airports[i]
  airport.id = i
  console.log("inserting")
  console.log(airport)
  idx.add(airport)
}

var found = idx.search("Vanc")
var foundId = found[0].ref
console.log(foundId)
console.log(airports[foundId])

// console.log(found);
