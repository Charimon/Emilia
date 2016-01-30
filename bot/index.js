var fs = require('fs');
var conf = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

var user = conf.user

console.log(user.email)
