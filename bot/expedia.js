var https = require('https');
var fs = require('fs');
var airports = require('airports');
var lunr = require('lunr');
var rp = require('request-promise');


var conf = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

var expedia_key = conf.expedia_key;

var idx = lunr(function () {
  this.field('name')
})
for (var i = 0; i < airports.length; i++) { 
  var airport = airports[i];
  airport.id = i;
  idx.add(airport);
}

var found = idx.search("Vanc");
var foundId = found[0].ref;
// console.log(foundId);
// console.log(airports[foundId]);

rp('http://terminal2.expedia.com:80/x/mflights/search?departureDate=2016-03-14&departureAirport=SEA&arrivalAirport=YVR&apikey=' + expedia_key).then ( (res) => {
  console.log(res)
}).catch(function (err) {
  // API call failed... 
  console.error(err)
});


//  function (res) {
//   console.log('statusCode: ', res.statusCode);
//   console.log('headers: ', res.headers);
  
//   res.on('data', function (d) {
//     console.log(d);
//   });
  
// }, function (error) {
//   console.error(error)
// });

// console.log(found);
