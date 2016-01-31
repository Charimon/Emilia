'use strict';

export default class HomeController {
  constructor($stateParams, api, $timeout) {
    this.$stateParams = $stateParams;
    this.api = api;
    this.$timeout = $timeout;
    
    this.locations = api.getDummyLocations();
    this.dates = {};
    this.place = null;
    this.hotel = null;
    this.flights = null;
    this.names = null;
    this.people = [];
    
    this.updateSelf();
  }
  
  updateSelf() {
    if(this.$stateParams.participantId != null ) {
      this.api.getParticipantsInConvo(this.$stateParams.participantId).then((participants) => {
        var names = participants.map((p) => p.get('fbData').firstName ).sort().join(", ");
        this.$timeout(() => {
          this.people = participants;
          this.names = names;
        })
      });
      
      this.api.getParticipant(this.$stateParams.participantId).then((participant) => {
        var convo = participant.get('conversation');
        this.dates = {
          start:convo.get('startDate'),
          end: convo.get('endDate')
        }
        this.place = convo.get('selectedPlace')
      })
    }
  }
}

HomeController.$inject = ['$stateParams', 'api', '$timeout'];