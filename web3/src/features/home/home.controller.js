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
    
    this.poll();
  }
  
  updateSelf() {
    if(this.$stateParams.participantId != null ) {
      this.api.getParticipantsInConvo(this.$stateParams.participantId).then((participants) => {
        var names = participants.map((p) => p.get('fbData').firstName ).sort().join(", ");
        if(this.people == null || this.people.length != participants.length) {
          this.$timeout(() => {
            this.people = participants;
            this.names = names;
          })
        } else {
          var pIds = participants.map((p) => p.id);
          var peopleIds = this.people.map((p) => p.id);
          if(pIds.sort().join() != peopleIds.sort().join()) {
            this.$timeout(() => {
              this.people = participants;
              this.names = names;
            });
          }
        }
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
  
  poll() {
    this.updateSelf()
    this.$timeout(this.poll.bind(this), 2000);
  }

}

HomeController.$inject = ['$stateParams', 'api', '$timeout'];