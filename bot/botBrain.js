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
    this.participantsForConvo = {};
  }
  
  start(email, password) {
    
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
        if(err) {
          console.err(err)
        } else {
          console.log("BotBrain - received event: %j", event) 
        }
        
        var botId = this.api.getCurrentUserID();
        
        switch(event.type) {
          case 'message': this.handleEventAsMessage(botId, event)
        }
        
        
      });
    });
  }
  
  handleEventAsMessage(botId, event) {
    console.log("BotBrain - processing event as message");
          
    var threadID = event.threadID;
    if(this.participantsForConvo[threadID]) {
      // converastion exists
      console.log("BotBrain - found existing conversation for thread %s", threadID);        
      
      var participants = this.participantsForConvo[threadID];                       
      this.handleMessage(event, participants);
      
    } else {
      console.log("BotBrain - creating new conversation for thread %s", threadID);        
      // new conversation
      
      // werd FB bugs, have to filter out bot ID
      var participantIds = event.participantIDs.filter( (p) => p != botId );
      // create a conversation
      var conversation = Conversation.createNew(botId, event);
      // create the participants
      var participants = participantIds.map( (participantId) => {
        return Participant.createNew(participantId, conversation);
      });
      
      console.log("BotBrain - saving new conversation for thread %s", threadID);
      Parse.Object.saveAll(participants).then( (savedParticipants) => {
        var savedConversation = savedParticipants[0].get("conversation");
      
        // record the participants into the cache
        this.participantsForConvo[threadID] = savedParticipants;
        console.log("BotBrain - recorded conversation %s into cache", threadID);
        
        this.handleMessage(event, savedParticipants);
      }, (error) => {
      // The save failed.  Error is an instance of Parse.Error.
        console.error(error);
      });
      
    }
  }

  handleMessage(message, participants) {
    console.log("BotBrain - handleMessage");
    this.sendPersonalLinks(participants
    
    
  }
  
  sendPersonalLinks(participants) {
      
    console.log("BotBrain - trying to sent personal links to %d participants", participants.length)
    for(var participant of participants) {
      console.log("testing participant " +participant.id)
      
      var didSentLink = participant.get("sentLink")
      console.log("Participant %s sentLink %s", participant.id, didSentLink)
      
      if(!didSentLink) {
        var userID = participant.get("userID")
        var conversationThreadID = participant.get("conversation").get("threadID")
        
        console.log("BotBrain - preparint to sent personal link to " + userID)
        
        participant.set("sentLink", true)
        participant.save()
        this.api.sendMessage("Hey, here is your personalized dashboard for this trip: http://www.google.com/" + conversationThreadID + "/" + userID, userID)
      
        console.log("BotBrain - Sent personal link to " + userID)
      }
      
    }
   
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