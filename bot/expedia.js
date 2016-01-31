'use strict'

var fs = require('fs');
var airports = require('airports');
var lunr = require('lunr');
var http = require('request-promise-json');
var DateFormat = require('dateformat');
var City = require('./city.js')

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

class API {
  static getCities() {
    return City.getMostPopularCities();
  }
  
  static getFlights(from, to, departure) {
    var departureStr = DateFormat(departure, "yyyy-mm-dd")
    return http.get(`http://terminal2.expedia.com/x/mflights/search?departureDate=${departureStr}&departureAirport=${from}&arrivalAirport=${to}&apikey=${expedia_key}`).then((res) => {
      return res;
    });
  }
  
  static getBestFlight(from, to, departure) {
    return API.getFlights(from, to, departure).then((res) => {
      var sortedOffers = res.offers.sort((a, b) => {
        return parseFloat(a.totalFare) - parseFloat(b.totalFare); 
      });
      return sortedOffers[0];
    });
  }
  
  static getBestFlightCity(fromCity, toCity, departure) {
    return API.getBestFlight(fromCity.airport, toCity.airport, departure)
  }
  
  static getHotels(lat, lng, radiusKM, from, to) {
    var fromStr = DateFormat(from, "yyyy-mm-dd")
    var toStr = DateFormat(to, "yyyy-mm-dd")
    return http.get(`http://terminal2.expedia.com/x/hotels?location=${lat},${lng}&radius=${radiusKM}km&dates=${fromStr},${toStr}&apikey=${expedia_key}`).then((res) => {
      return res;
    });
  }
  
  static getHotelSpread(lat, lng, radiusKM, from, to) {
    var sortHotelsByPrice = (a,b) => {
      if(a.Price == null || a.Price.TotalRate == null || a.Price.TotalRate.Value == null) return -1;
      if(b.Price == null || b.Price.TotalRate == null || b.Price.TotalRate.Value == null) return -1;
      return parseFloat(a.Price.TotalRate.Value) - parseFloat(b.Price.TotalRate.Value);
    }
    
    return API.getHotels(lat, lng, radiusKM, from, to).then((res) => {
      var hotels = res.HotelInfoList.HotelInfo;
      var topHotels = hotels.filter((h) => parseFloat(h.StarRating) > 4.7).sort(sortHotelsByPrice);
      var midHotels = hotels.filter((h) => (parseFloat(h.StarRating) > 4 && parseFloat(h.StarRating) <= 4.7)).sort(sortHotelsByPrice);
      var lowHotels = hotels.filter((h) => (parseFloat(h.StarRating) > 3.5 && parseFloat(h.StarRating) <= 4)).sort(sortHotelsByPrice);
      
      if(topHotels.length + midHotels.length + lowHotels.length <= 3) {
        return topHotels.concat(midHotels).concat(lowHotels).sort(sortHotelsByPrice);
      } else {
        var outputHotels = [];
        while(outputHotels.length < 3) {
          if(topHotels.length > 0) { outputHotels.push(topHotels.shift()) }
          if(midHotels.length > 0) { outputHotels.push(midHotels.shift()) }
          if(lowHotels.length > 0) { outputHotels.push(lowHotels.shift()) }
        }
      
        return outputHotels.sort(sortHotelsByPrice);
      } 
    });
  }
  
  static getHotelSpreadCity(city, radiusKM, fromDate, toDate) {
    return API.getHotelSpread(city.lat, city.lng, radiusKM, fromDate, toDate);
  }
}

module.exports = API;