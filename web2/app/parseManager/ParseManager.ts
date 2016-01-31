import {config} from '../config/config';

Parse.initialize(config.parse.applicationId, config.parse.jsKey);

export class ParseManager{
    constructor(){
    }
    test() {
      var Participant = Parse.Object.extend("Participant");
      var query = new Parse.Query(Participant);
      query.first().then((p) => {
        debugger;
      });
      
      
      console.log("HERE");
    }
}