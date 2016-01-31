'use strict'

var Parse = require('parse/node');
var Promise = require('promise');
const assert = require('assert');
var Conversation = require('./conversation.js')

class Participant extends Parse.Object {
  
  static createNew(userID, conversation) {    
    var obj = new Participant();
    obj.set("userID", ""+userID);
    obj.set("conversation", conversation);
    obj.set("sentLink", false);
    
    return obj;
  }
  
  constructor() {
    super("Participant")
  }
    
  static findByConversationId(conversationId) {
    var converstaion = new Conversation()
    converstaion.id = conversationId
    
    var q = new Parse.Query(Participant);
    q.include("conversation")
    q.equalTo("conversation", converstaion);
    return q.find();
  }
    
}

Parse.Object.registerSubclass('Participant', Participant);

module.exports = Participant;