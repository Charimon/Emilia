'use strict'


class City {
  constructor(name, lat, lng, airport, price) {
    this.name = name;
    this.lat = lat;
    this.lng = lng;
    this.airport = airport;
    this.price = price;
  }
  
  static getMostPopularCities() {
    return [
      new City("San Diego, CA", 32.720177, -117.167469, "SAN", "$"),
      new City("Whistler, BC, Canada", 50.115604, -122.958129, "YVR", "$$"),
      new City("London, UK", 51.509224, -0.125122, "LHR", "$$$"),
      new City("Puerto Rico, USA", 18.393483, -66.098761, "SJU", "$$")
    ]
  }
  
  static getSeattle() {
    return new City("Seattle, WA", 47.5452308,-122.4261948, "SEA", "$")
  }
  
  static getDC() {
    return new City("Washington D.C.", 38.8477228,-77.0532833, "IAD", "$")
  }
  
  static getSanFrancisco() {
    return new City("San Francisco, CA", 37.757815,-122.5076401, "SFO", "$$$")
  }
}

module.exports = City;