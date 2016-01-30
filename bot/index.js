var login = require("facebook-chat-api");
var fs = require('fs');
var conf = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

var user = conf.user;

login({email: user.email, password: user.password}, function callback (err, api) {
  if(err) return console.error(err);

  var botId = api.getCurrentUserID();

  api.setOptions({listenEvents: true});
  
  var stopListening = api.listen(function(err, event) {
    if(err) return console.error(err);
 
    switch(event.type) {
      case "message":
        if(event.body === '/stop') {
          api.sendMessage("Goodbye...", event.threadID);
          return stopListening();
        }
        api.markAsRead(event.threadID, function(err) {
          if(err) console.log(err);
        });
        
        var botIdIndex = event.participantIDs.indexOf(botId);
        var participantIDs = event.participantIDs;
        if(botIdIndex > -1) {
          participantIDs.splice(botIdIndex, 1);
        }
        
        if(participantIDs.length >= 2) {
          for(var i=0; i<participantIDs.length; i++) {
            sendIndividualMessage(api, participantIDs[i]);
          }
        }
        
        api.sendMessage("TEST BOT: " + event.body, event.threadID);
        break;
      case "event":
        console.log(event);
        break;
    }
  });
});

sendIndividualMessage = function(api, id) {
  var msg = {body: "Hey! http://www.google.com"}
  api.sendMessage(msg, id);
}