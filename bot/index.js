var login = require("facebook-chat-api");
var fs = require('fs');
var conf = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

var user = conf.user;

console.log(user.email);

login({email: user.email, password: user.password}, function callback (err, api) {
  if(err) return console.error(err);

  var yourID = 0000000000000;
  console.log("HERE");
  //var msg = {body: "Hey!"};
  //api.sendMessage(msg, yourID);
});
