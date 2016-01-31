'use strict'

class Hotel {
  
  constructor(expediaHotel) {
    
    this.hotelId = expediaHotel.HotelID
    this.name = expediaHotel.Name
    // this.location = expediaHotel.Location
    this.starRating = expediaHotel.StarRating
    // this.guestRating = expediaHotel.GuestRating
    this.detailUrl = expediaHotel.DetailsUrl
    // this.thmbUrl = expediaHotel.ThumbnailUrl
    
    if(expediaHotel.Price && expediaHotel.Price.TotalRate) {
      this.totalPrice = expediaHotel.Price.TotalRate.Value
    }

  }
  
  prettyLine() {
    // return `${this.name} (${this.starRating} stars) - $${this.totalPrice}\n${this.detailUrl}\n`
    return `${this.name} (${this.starRating} stars) - $${this.totalPrice}`
  }
  
  
  
}

module.exports = Hotel;