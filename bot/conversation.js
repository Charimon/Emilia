'use strict'

var Parse = require('parse/node');
var Promise = require('promise');
var ConvState = require('./conversationState.js')

class Conversation extends Parse.Object {
  
  static createNew(botId, convEvent) {
    var obj = new Conversation()
    
    var threadIDStr = ""+(convEvent.threadID)
    obj.set('threadID', threadIDStr)
    obj.set('state', ConvState.newTrip)
       
    return obj
  }
  
  constructor() {
    super("Conversation")
  }
   
  get threadID() {
    return this.get("threadID");
  }
  
  get state() {
    return this.get("state");
  }
  
  static findByThreadID(threadID) {
    var q = new Parse.Query(Conversation);
    q.equalTo("threadID", threadID);
    return q.find();
  }
  
}

Parse.Object.registerSubclass('Conversation', Conversation);



module.exports = Conversation;