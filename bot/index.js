var Parse = require('parse/node');
var login = require("facebook-chat-api");
var fs = require('fs');
var conf = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

var BotBrain = require("./botBrain.js");

var user = conf.user;

login({email: user.email, password: user.password}, function callback (err, api) {
  if(err) return console.error(err);
  api.setOptions({listenEvents: true});
  
  var bot = new BotBrain(api, conf);
  
  // var stopListening =
  api.listen(function(err, event) {
    if(err) return console.error(err);
    
    switch(event.type) {
      case "message":
        if(bot.isAllowed(event)) {
          bot.joinThread(event);
          bot.respond(event);
        } else {
          bot.whittyError(event);
        }
        break;
      case "event": break;
    }
  });
});