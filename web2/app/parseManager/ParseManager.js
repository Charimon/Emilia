System.register(['../config/config'], function(exports_1) {
    var config_1;
    var ParseManager;
    return {
        setters:[
            function (config_1_1) {
                config_1 = config_1_1;
            }],
        execute: function() {
            Parse.initialize(config_1.config.parse.applicationId, config_1.config.parse.jsKey);
            ParseManager = (function () {
                function ParseManager() {
                }
                ParseManager.prototype.test = function () {
                    var Participant = Parse.Object.extend("Participant");
                    var query = new Parse.Query(Participant);
                    query.first().then(function (p) {
                        debugger;
                    });
                    console.log("HERE");
                };
                return ParseManager;
            })();
            exports_1("ParseManager", ParseManager);
        }
    }
});
//# sourceMappingURL=ParseManager.js.map