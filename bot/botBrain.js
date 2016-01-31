'use strict'

var Parse = require('parse/node');
var Promise = require('promise');
var UUID = require('node-uuid');
var Conversation = require('./conversation.js')
var Participant = require('./participant.js')

var login = require("facebook-chat-api");
var API = require("./expedia")
var Chrono = require('chrono-node')
var DateFormat = require('dateformat');
var DateMath = require('date-math');
var Weekend = require('./weekend.js');
var Hotel = require('./hotel.js');

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
          console.error(`===ERROR: ${err}`);
          return;
        } else {
          console.log("BotBrain - received event: %j", event) 
        }
        
        var botId = this.api.getCurrentUserID();
        
        switch(event.type) {
          case 'message': this.handleEventAsMessage(botId, event)
          case 'event': this.handleEventAsEvent(botId, event)
        }
        
        
      });
    });
  }
  
  handleEventAsEvent(botId, event) {
    
    if(event.logMessageType == "log:subscribe") {
      // handle addition of a new uesr
      
      var addedParticipantIds = event.logMessageData.added_participants.map ( (fbStr) => { return fbStr.split(":")[1] })
      console.log("added participants: %j", addedParticipantIds)
      
      if(addedParticipantIds.length == 1 && addedParticipantIds[0] == botId) {
        this.api.sendMessage("Hey gang! Sounds like you want to take a trip. Where are you off to? If you need my help, type ‘@e’", event.threadID);
        return;
      }
      
      var threadID = event.threadID;
      var participants = this.participantsForConvo[threadID]
      if(participants) {
        var conversationId = participants[0].get("conversation").id
        var stubConversation = new Conversation()
        stubConversation.id = conversationId
        
        var newParticipants = addedParticipantIds.map( (participantId) => {
          return Participant.createNew(participantId, stubConversation);
        });
        console.log("BotBrain - created %d Participant objects for the invited users %j", newParticipants.length, addedParticipantIds)
        Parse.Object.saveAll(newParticipants).then( (savedParticipants) => {
          
          Participant.findByConversationId(conversationId).then( (refetchedParticipants) => {
            console.log("BotBrain - Updating participants for thread %s with %j", threadID, refetchedParticipants)
            this.participantsForConvo[threadID] = refetchedParticipants
            this.sendPersonalLinks(refetchedParticipants)
          })
          
          
        })
        
        
      } else {
        console.error("Added partiticipant to thread %s but could not find the thread in the cache", threadID)
      }
      
    } 
    
    
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

  handleMessage(event, participants) {
    console.log("BotBrain - handleMessage");
    this.sendPersonalLinks(participants);
    
    
    if(this.shouldRespondToEvent(event, participants)) {
      var conversation = participants[0].get('conversation');
      var strippedMessage = event.body.substring(2).trim();
      
      if(!conversation.get('sentWelcome')) {
        
        // go out and get everybody's name
        var participantIds = participants.map ( (p) => {return p.get("userID")})
        this.api.getUserInfo(participantIds, (err, foundFBData) => {
          if(err) return console.error(err);
          console.log("got people's data")
          console.log("responce: %j", foundFBData)
          
          participants.forEach( (p) => {
            let fbID = p.get("userID")
            let userFBData = foundFBData[fbID]
            if(userFBData) {
              p.set("fbData", userFBData)
              p.save()
            }  
          })
          
        });
        
        var message = "Yep yep, I’m right here. Just ‘@e’ any time you want to address me. Here are options for places you might want to go. I'm going to send all of you some more info in a separate chat to help you decide. Just click the link";
        message += "\n\n";
        message += API.getCities().map((c, i) => {
          return `\n[${i+1}]     ${c.name} (${c.price})`;
        }).join(" ");
        message += "\n\rSelect a number or type ‘m’ for more."
        
        this.api.sendMessage(message, event.threadID);
        conversation.set('sentWelcome', true);
        conversation.set('sentPlaces', true);
        conversation.save();
        return 
      } 
        
      console.log("BotBrain - choosing place")
      if(conversation.get('sentPlaces') && !conversation.get('selectedPlace')) {
        var firstChar = parseInt(strippedMessage.substring(0,1));
        if(!isNaN(firstChar) && firstChar > 0 && firstChar <= API.getCities().length) {
          var selectedCity = API.getCities()[firstChar-1]
          this.api.sendMessage(`Sweet!`, event.threadID);
          conversation.set('selectedPlace', selectedCity)
          conversation.save();
          
          setTimeout( () => {
            
            var weekends = Weekend.nextGoodWeeknds()   
            
            var message = `Here are some next good weekends to go to ${conversation.get('selectedPlace').name}`
            message += "\n\n"; 
            message += weekends.map( (w, i) => { 
              return `\n[${i+1}]    ${w.pretty}`;
            } ).join(" ");
            message += "\n\rOr just type in your own range."
            
            this.api.sendMessage(message, event.threadID);
          }, 500)
          
        } else {
          this.whittyResponse(event);
        }
        
        return
      } 
      
      console.log("BotBrain - choosing date range")
      if(!(conversation.get('startDate') && conversation.get('endDate')) ){
        // parse the date range
        
        console.log(`BotBrain - parsing '${event.body}' for date ranges`)
        
        let body = event.body
        
        var weekends = Weekend.nextGoodWeeknds()   
        var strippedMessage = event.body.substring(2).trim();
        var firstChar = parseInt(strippedMessage.substring(0,1));
        if(!isNaN(firstChar) && firstChar > 0 && firstChar <= weekends.length) {
          var picked = weekends[firstChar - 1]
          var startDate = picked.start
          var endDate = picked.end
          
          this.setTripDates(event, conversation, startDate, endDate)
          return 
        }
        
        var parseResults = Chrono.parse(event.body)
        if(parseResults.length <= 0) {
          this.api.sendMessage(`Sorry, I could not quite understand your date range`, event.threadID);
          return
        }
        
        var firstResult = parseResults[0]
        var start = firstResult.start
        var end = firstResult.end
        if(!start || !end) {
          this.api.sendMessage(`Sorry, I could not quite understand your date range`, event.threadID);
          return
        }
        
        var startDate = start.date()
        var endDate = end.date()
        this.setTripDates(event, conversation, startDate, endDate)
        return
      }
      
      if(!(conversation.get('hotel')) ) {
        
        var strippedMessage = event.body.substring(2).trim();
        var firstChar = parseInt(strippedMessage.substring(0,1));
        if(!isNaN(firstChar) && firstChar > 0 && firstChar <= API.getCities().length) {
          var hotel = conversation.get('hotelOptions')[firstChar - 1]

          conversation.set('hotel', hotel)
          conversation.save();
                    
          this.api.sendMessage(`Sweet, you will be staying at ${hotel.name}`, event.threadID);
         
          setTimeout( () => {
            // var message = "Thanks for letting me help you plan your trips. You can finish booking your individual flights on the trip page: http://emilia.expedia.com/"
            
            var message = "Thanks for letting me help you plan your trips. You can finish booking your individual flights on the trip pages:\n\n"
            
            message += participants.map ( (p) => {
              return `${p.get("fbData").firstName}: ${p.dashboardUrl}\n`
            }).join("")
            
            this.api.sendMessage(message, event.threadID);
            
            this.getFligts(participants)
          }, 500)
                    
        } else {
          this.whittyResponseHotel(event);
        }
       
        return 
      }

    }
  }
  
  setTripDates(event, conversation, startDate, endDate) {
    conversation.set('startDate', startDate)
    conversation.set('endDate', endDate)
    conversation.save()
    
    this.api.sendMessage(`From ${DateFormat(startDate, "mmmm dS")} to ${DateFormat(endDate, "mmmm dS")} it is`, event.threadID);
  
    this.sendHotelSuggestions(event, conversation)
  }
  
  sendHotelSuggestions(event, conversation) {    
    console.log("in hotel fn")
    
    var city = conversation.get('selectedPlace')
    var from = conversation.get('startDate')
    var to = conversation.get('endDate')
    
    console.log("Looking for hotels in %j from %s to %s", city, from, to)
        
    this.api.sendMessage(`Looking for some hotels around ${conversation.get('selectedPlace').name}...`, event.threadID);
        
    API.getHotelSpreadCity(city, 10, from, to).then ( (hotels) => {
      console.log("Hotel %j", hotels)
      
      var message = "I think you will like these:";
      message += "\n\n";

      var parsedHotels = hotels.map( (h) => {return new Hotel(h)} )
      message += parsedHotels.map( (h, i) => {
        return `\n[${i+1}]     ${h.prettyLine()}`;
      }).join(" ");
      message += "\n\rSelect a number or type ‘m’ for more."
            
      this.api.sendMessage(message, event.threadID);
      
      // record the hotel ids that we displayed
      console.log("Displayed %j hodels to choose", parsedHotels)
      conversation.set('hotelOptions', parsedHotels)
      conversation.save()
      
    }, (error) => {
      // The save failed.  Error is an instance of Parse.Error.
      console.error(error);
    });
    

  }
  
  getFligts(participants) {
    
    participants.forEach( (p) => {
      var conversation = p.get("conversation")
      var startDate = conversation.get("startDate")
      var endDate = conversation.get("endDate")
      
      var destinationCity = conversation.get("selectedPlace")
      var destAirport = destinationCity.airport
      
      var homeCity = p.get("homeCity")
      var homeAirport = homeCity.airport
      
      var name = p.get("fbData").firstName
      
      API.getBestFlight(homeAirport, destAirport, startDate).then( (flight) => {
       
        console.log("found flight for %s: %j", name, flight)
        p.set("flight", flight) 
        p.set("flightDest", destinationCity)
        p.save()
      
        // get reverse flight
        API.getBestFlight(destAirport, homeAirport, endDate).then( (flightHome) => {
        
          console.log("found flight for %s: %j", name, flightHome)
          p.set("reverseFlight", flightHome) 
          p.save()
          
        }, (error) => {
          // The save failed.  Error is an instance of Parse.Error.
          console.error(error);
        }); 
        
      }, (error) => {
        // The save failed.  Error is an instance of Parse.Error.
        console.error(error);
      });
      
    })
    
  }
  
  whittyResponse(event) {
    var strippedMessage = event.body.substring(2).trim();
    var responses = ["You wanna go where, mate?!"];
    var randomN = Math.floor((Math.random() * responses.length));
    this.api.sendMessage(responses[randomN], event.threadID);
  }
  
  whittyResponseHotel(event) {
    var strippedMessage = event.body.substring(2).trim();
    var responses = ["You wanna to stay where, mate?!"];
    var randomN = Math.floor((Math.random() * responses.length));
    this.api.sendMessage(responses[randomN], event.threadID);
  }
  
  shouldRespondToEvent(event, participants) {
    if(!event.body.startsWith('@e')) return false;
    return true;
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
        
        this.api.sendMessage("Hey, your friend invited you to plane a trip with Expedia, here is your personalized dashboard for this trip: " + participant.dashboardUrl, userID)
      
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