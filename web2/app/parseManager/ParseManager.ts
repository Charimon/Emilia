import {config} from '../config/config';

Parse.initialize(config.parse.applicationId, config.parse.jsKey);

var Participant = Parse.Object.extend("Participant");
var Conversation = Parse.Object.extend("Conversation");

export class ParseManager{
    constructor(){
    }
    getParticipant(id) {
      var query = new Parse.Query(Participant);
      query.equalTo("objectId", id);
      return query.first();
    }
    getParticipantsInConvo(convoId) {
      var conversation = new Conversation()
      conversation.id = convoId; 
      
      var query = new Parse.Query(Participant);
      query.equalTo("conversation", conversation);
      return query.find();
    }
}