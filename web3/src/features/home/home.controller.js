'use strict';

export default class HomeController {
  constructor($stateParams, api, $timeout, $state) {
    this.$stateParams = $stateParams;
    this.api = api;
    this.$timeout = $timeout;
    this.$state = $state;
    
    this.locations = api.getDummyLocations();
    this.dates = {};
    this.place = null;
    this.hotel = null;
    this.flights = null;
    this.names = null;
    this.people = [];
    this.showBookButton = false;
    this.flightFrom = null;
    this.flightTo = null;
    
    this.hotelPrice = null;
    this.flightPrice = null;
    this.doneMap = {}
    
    this.poll();
  }
  
  updateSelf() {
    if(this.$stateParams.participantId != null ) {
      this.api.getParticipantsInConvo(this.$stateParams.participantId).then((participants) => {
        var names = participants.map((p) => p.get('fbData').firstName ).sort().join(", ");
        if(this.people == null || this.people.length != participants.length) {
          this.doneMap = {};
            for(var p of participants) {
              this.doneMap[p.id] = p.get('done');
            }
          this.$timeout(() => {
            this.people = participants;
            this.names = names;
          })
        } else {
          var pIds = participants.map((p) => p.id);
          var peopleIds = this.people.map((p) => p.id);
          if(pIds.sort().join() != peopleIds.sort().join()) {
            this.doneMap = {};
            for(var p of participants) {
              this.doneMap[p.id] = p.get('done');
            }
            this.$timeout(() => {
              this.people = participants;
              this.names = names;
            });
          } else {
            var shouldResetUsers = false;
            for(var p of participants) {
              console.log(`${p.id} ${this.doneMap[p.id]} vs ${p.get('done')}`)
              if(this.doneMap[p.id] != p.get('done')) {
                shouldResetUsers = true;
                this.doneMap[p.id] = p.get('done')
              }
            }
            if(shouldResetUsers) {
              this.$timeout(() => {
                this.people = participants;
                this.names = names;
              });
            }
          }
        }
      });
      
      this.api.getParticipant(this.$stateParams.participantId).then((participant) => {
        var convo = participant.get('conversation');
        this.dates = {
          start:convo.get('startDate'),
          end: convo.get('endDate')
        }
        this.place = convo.get('selectedPlace');
        
        this.flightFrom = participant.get('homeCity');
        this.flightTo = participant.get('flightDest');
        this.flightPrice = participant.get('flight').totalFare;
        
        this.hotelPrice = convo.get('hotel').totalPrice;
      })
    }
  }
  
  isDone(participant) {
    if(participant == null) return;
    return participant.get('done');
  }
  
  get totalPrice() {
    return (parseFloat(this.flightPrice) || 0) + (parseFloat(this.hotelPrice) || 0) 
  }
  
  poll() {
    this.updateSelf()
    this.$timeout(this.poll.bind(this), 2000);
  }
  
  book() {
    this.$state.go('booking');
  }

}

HomeController.$inject = ['$stateParams', 'api', '$timeout', '$state'];