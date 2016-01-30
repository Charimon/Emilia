var https = require('https');
var fs = require('fs');
var airports = require('airports');
var lunr = require('lunr');

var conf = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

var expedia_key = conf.expedia_key;

var idx = lunr(function () {
  this.field('name')
})
for (var i = 0; i < airports.length; i++) { 
  var airport = airports[i]
  airport.id = i
  idx.add(airport)
}

var found = idx.search("Vanc")
var foundId = found[0].ref
console.log(foundId)
console.log(airports[foundId])

// console.log(found);
