'use strict'

const newTrip = "new_trip"
const suggestedDestinations = "suggested_destinations"
const selectedDestination = "selected_destination"

class ConversationState {
  
  static get newTrip() {
    return newTrip; 
  }
  
  static get suggestedDestinations() {
    return suggestedDestinations;
  }
  
  static get selectedDestination() {
    return selectedDestination;
  }
  
}