var Parse = require('parse/node');
var Promise = require('promise');

var login = require("facebook-chat-api");

function BotBrain(api, conf) {
  this.name = "emilia";
  this.nicknames = ["em", "emi"]
  this.api = api;
  this.conf = conf;
  
  Parse.initialize(conf.parse.applicationId, conf.parse.jsKey);
}

BotBrain.fbLogin = function(email, password) {
  return new Promise(function(resolve, reject){
    login({email: email, password: password}, function callback (err, api) {
      if(err) { reject(err); }
      else { resolve(api); }
    });
  });
}

var _botBrainPromise = null;
BotBrain.start = function(conf) {
  if(_botBrainPromise != null) return _botBrainPromise;
  
  _botBrainPromise = BotBrain.fbLogin(conf.user.email, conf.user.password).then(function(api){
    api.setOptions({listenEvents: true});
    var botBrain = new BotBrain(api, conf);
    return botBrain;
  });
  return _botBrainPromise;
}

var _b = BotBrain.prototype;

_b.listen = function() {
  var _this = this;
  return new Promise(function(resolve, reject){
    // var stopListening =
    _this.api.listen(function(err, event) {
      if(err) { reject({error:err, bot:_this}); }
      else { resolve({event:event, bot:_this}); }
    });
  });
}

_b.joinThread = function(event) {
  var _this = this;
  var participants = this.participantIds(event.participantIDs)
  var ThreadObject = Parse.Object.extend("ThreadObject");
  
  var query = new Parse.Query(ThreadObject);
  query.equalTo("theadId", event.threadID);
  query.first().then(function(thread){
    if(thread == null) {
      var threadObject = new ThreadObject();
      threadObject.save({theadId: event.threadID, participants: participants});
      _this.greetInitialParticipants(participants, event.threadID);
      return threadObject;
    } else { return thread; }
  }).then(function(thread){
    console.log("joined or already in thread")
  })
}

_b.participantIds = function(participants) {
  if(this.api.getCurrentUserID() == null) return [];
  var _participants = participants.slice();
  var index = _participants.indexOf(this.api.getCurrentUserID())
  if(index > -1) { _participants.splice(index, 1); }
  return _participants;
}

_b.isForMe = function(message) {
  var _message = message.toLowerCase();
  if(_message.startsWith("@" + this.name)) { return true; }
  for(var i=0; i<this.nicknames.length; i++) {
    if(_message.startsWith("@" + this.nicknames[i])) { return true; }
  }
  return false;
}

_b.greetInitialParticipants = function(ids, threadId) {
  var _this = this;
  for(var i=0; i<ids.length; i++) {
    _this.greetParticipant(ids[i]);
  }
  
  _this.api.sendMessage("Hey guys! Where would you like to go?", threadId);
}

_b.greetParticipant = function(id) {
  var _this = this;
  
  var ParticipantObject = Parse.Object.extend("ParticipantObject");
  var participantObject = new ParticipantObject();
  participantObject.save({fbId: id, status: "CONTACTED" });
  
  _this.api.sendMessage("Hey, please open this link to do things: http://www.google.com", id);
}

_b.respond = function(event) {
  this.api.markAsRead(event.threadID, function(err) { if(err) console.log(err); });
  // console.log(bot.isForMe(event.body));
}

_b.whittyError = function(event) {
  var _this = this;
  _this.api.sendMessage("I don't know who you are, but I have a certain set of skills... blah blah blah", event.threadID);
}

_b.isAllowed = function(event) {
  var participants = this.participantIds(event.participantIDs);
  for(var i = 0; i < participants.length; i++ ) {
    if(this.conf.users.indexOf(parseInt(participants[i])) < 0) {
      return false;
    }
  }
  return true;
}

module.exports = BotBrain;