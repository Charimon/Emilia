'use strict';

import angular from 'angular';



class API {
  constructor($http) {
    window.Parse.initialize("LlaXi8brupHgMgpAwmPLw4ZbazCFQ3rp0JLsLtcs", "2XZmNrhcjOo5f1RBBKmMKDFSUNpOY62pyLq2ALNa");
    
    this.$http = $http;
    this.users = {}
    this.usersPhotos = {}
  }
  
  getParticipant(participantId) {
    var Participant = window.Parse.Object.extend("Participant");
    
    var query = new window.Parse.Query(Participant);
    query.equalTo("objectId", participantId);
    query.include('conversation');
    return query.first()
  }
  
  getParticipantsInConvo(participantId) {
    var Participant = window.Parse.Object.extend("Participant");
    
    return this.getParticipant(participantId).then( (participant) => {
      var query = new window.Parse.Query(Participant);
      query.equalTo("conversation", participant.get('conversation'));
      return query.find();
    });
  }
  
  getDummyLocations() {
    return [
      {name: "Florence, Italy", duration: "~1 week", img: "italy-img"},
      {name: "San Diego, CA", duration: "weekend", img: "sanDiego-img"},
      {name: "Banff, AB, Canada", duration: "4 days", img: "banff-img"},
      {name: "Puerto Vallarta, Mexico", duration: "4 days", img: "mexico-img"}
    ]
  }
}

API.$inject = ['$http'];

export default angular.module('services.api', []).service('api', API).name;