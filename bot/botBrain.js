'use strict'

var Parse = require('parse/node');
var Promise = require('promise');
var UUID = require('node-uuid');
var Conversation = require('./conversation.js')
var Participant = require('./participant.js')

var login = require("facebook-chat-api");

// function BotBrain(api, conf) {
//   this.name = "emilia";
//   this.nicknames = ["em", "emi"]
//   this.api = api;
//   this.conf = conf;
  
//   Parse.initialize(conf.parse.applicationId, conf.parse.jsKey);
// }

// BotBrain.fbLogin = function(email, password) {
//   return new Promise(function(resolve, reject){
//     login({email: email, password: password}, function callback (err, api) {
//       if(err) { reject(err); }
//       else { resolve(api); }
//     });
//   });
// }

// var _botBrainPromise = null;
// BotBrain.start = function(conf) {
//   if(_botBrainPromise != null) return _botBrainPromise;
  
//   _botBrainPromise = BotBrain.fbLogin(conf.user.email, conf.user.password).then(function(api){
//     api.setOptions({listenEvents: true});
//     var botBrain = new BotBrain(api, conf);
//     return botBrain;
//   });
//   return _botBrainPromise;
// }

class BotBrain {
  
  constructor() {
    this.api = null;
    this.conversations = {};
  }
  
  start(email, password, listen_handler) {
    
    var fbConnection = new Promise(function(resolve, reject){
      login({email: email, password: password}, function callback (err, api) {
        if(err) { reject(err); }
        else { resolve(api); }
      });
    });
    
    fbConnection.then ( (api) => {
      api.setOptions({listenEvents: true});
      return api
    }).then ( (api) => {
      this.api = api

      api.listen( (err, event) => {
        var botId = this.api.getCurrentUserID();
        
        switch(event.type) {
          case 'message':
            var threadID = event.threadID;
            if(this.conversations[threadID]) {
              // converastion exists
              console.log("found existing conversation for %s", threadID)        
              
              var convAndParticipants = this.conversations[threadID];
              console.log("fetched conversation from cache")
              console.log(convAndParticipants)  
              listen_handler(event, convAndParticipants);
              
            } else {
              // new conversation
              
              // werd FB bugs, have to filter out bot ID
              var participantIds = event.participantIDs.filter( (p) => p != botId );
              
              var conversation = Conversation.createNew(botId, event)
              
              var participants = participantIds.map( (participantId) => {
                return Participant.createNew(participantId, conversation);
              });
              
              Parse.Object.saveAll(participants).then( (savedThings) => {
              // The save was successful.
                console.log("BotBrain.start - saved things")
                console.log(savedThings)
              
                var conversation = savedThings[0].get("conversation")
                var participants = savedThings
                var convAndParticipants = { conversation:conversation, participants:participants };
                this.conversations[threadID] = convAndParticipants
              
                console.log("BotBrain.start - saved conversation %s", threadID)      
                console.log("BotBrain.start - recorded conversation into cache")
                console.log(convAndParticipants)          
                
                listen_handler(event, convAndParticipants);
              }, (error) => {
              // The save failed.  Error is an instance of Parse.Error.
                console.error(error)
              });
              
            }
        }
        
        
      });
    });
  }

  
  
  // joinThread() {
  //   var participants = this.participantIds(event.participantIDs)
  //   var ThreadObject = Parse.Object.extend("ThreadObject");
    
  //   var query = new Parse.Query(ThreadObject);
  //   query.equalTo("threadId", event.threadID);
  //   query.first().then( (thread) => {
  //     if(thread == null) {
  //       var threadObject = new ThreadObject();
  //       threadObject.save({threadId: event.threadID, participants: participants});
  //       this.greetInitialParticipants(participants, event.threadID);
  //       return threadObject;
  //     } else { return thread; }
  //   }).then( (thread) => {
  //     console.log("joined or already in thread")
  //   })
  // }
  
  // get participantIds() {
  //   if(this.api.getCurrentUserID() == null) return [];
  //   var _participants = participants.slice();
  //   var index = _participants.indexOf(this.api.getCurrentUserID())
  //   if(index > -1) { _participants.splice(index, 1); }
  //   return _participants;
  // }
  
}

// var _b = BotBrain.prototype;

// _b.participantIds = function(participants) {
//   if(this.api.getCurrentUserID() == null) return [];
//   var _participants = participants.slice();
//   var index = _participants.indexOf(this.api.getCurrentUserID())
//   if(index > -1) { _participants.splice(index, 1); }
//   return _participants;
// }

// _b.isForMe = function(message) {
//   var _message = message.toLowerCase();
//   if(_message.startsWith("@" + this.name)) { return true; }
//   for(var i=0; i<this.nicknames.length; i++) {
//     if(_message.startsWith("@" + this.nicknames[i])) { return true; }
//   }
//   return false;
// }

// _b.greetInitialParticipants = function(ids, threadId) {
//   var _this = this;
//   for(var i=0; i<ids.length; i++) {
//     _this.greetParticipant(ids[i]);
//   }
  
//   _this.api.sendMessage("Hey guys! Where would you like to go?", threadId);
// }

// _b.greetParticipant = function(id) {
//   var _this = this;
  
//   var ParticipantObject = Parse.Object.extend("ParticipantObject");
//   var participantObject = new ParticipantObject();
//   participantObject.save({fbId: id, uuid:UUID.v4(), hasLocation: false, hasBookedFlight: false, hasBookedHotel: false });
//   var uuid = participantObject.get("uuid");
//   _this.api.sendMessage("Hey, please open this link to do things: http://www.google.com/" + uuid, id);
// }

// _b.respond = function(event) {
//   this.api.markAsRead(event.threadID, function(err) { if(err) console.log(err); });
//   // console.log(bot.isForMe(event.body));
// }

// _b.individualRespond = function(event) {
//   this.api.markAsRead(event.threadID, function(err) { if(err) console.log(err); });
//   this.api.sendMessage("BOT: " + event.body, event.threadID);
// }

// _b.whittyError = function(event) {
//   var _this = this;
//   _this.api.sendMessage("I don't know who you are, but I have a certain set of skills... blah blah blah", event.threadID);
// }

// _b.isAllowed = function(event) {
//   var participants = this.participantIds(event.participantIDs);
//   for(var i = 0; i < participants.length; i++ ) {
//     if(this.conf.users.indexOf(parseInt(participants[i])) < 0) {
//       return false;
//     }
//   }
//   return true;
// }

// _b.isIndividualConvo = function(event) {
//   return event.participantIDs.length == 1;
// }

module.exports = BotBrain;