'use strict'

var Parse = require('parse/node');
var Promise = require('promise');
const assert = require('assert');


class Participant extends Parse.Object {
  
  static createNew(userID, conversation) {    
    var obj = new Participant();
    obj.set("userID", ""+userID);
    obj.set("conversation", conversation);
    
    return obj;
  }
  
  constructor() {
    super("Participant")
  }
  
  get userID() {
    this.get("userID");
  }
    
}

Parse.Object.registerSubclass('Participant', Participant);

module.exports = Participant;