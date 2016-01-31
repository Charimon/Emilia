'use strict'

var Parse = require('parse/node');
var Promise = require('promise');
const assert = require('assert');
var Conversation = require('./conversation.js')
var City = require('./city.js')

class Participant extends Parse.Object {
  
  static createNew(userID, conversation) {    
    var obj = new Participant();
    var userIDStr = ""+userID
    obj.set("userID", userIDStr);
    obj.set("conversation", conversation);
    obj.set("sentLink", false);
    
    // hardcoding home
    var homeCity;
    switch(userIDStr) {
      case "2203693":
        homeCity = City.getSeattle()
        break;
      case "1238280239":
        homeCity = City.getDC()
        break;
      case "1238280290":
        homeCity = City.getSanFrancisco()
        break;
      default:
        homeCity = City.getSeattle()
    }
    obj.set("homeCity", homeCity);
    
    return obj;
  }
  
  get dashboardUrl() {
    return "http://localhost:8080/" + this.id
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