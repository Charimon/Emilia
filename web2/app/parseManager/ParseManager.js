System.register(['../config/config'], function(exports_1) {
    var config_1;
    var Participant, Conversation, ParseManager;
    return {
        setters:[
            function (config_1_1) {
                config_1 = config_1_1;
            }],
        execute: function() {
            Parse.initialize(config_1.config.parse.applicationId, config_1.config.parse.jsKey);
            Participant = Parse.Object.extend("Participant");
            Conversation = Parse.Object.extend("Conversation");
            ParseManager = (function () {
                function ParseManager() {
                }
                ParseManager.prototype.getParticipant = function (id) {
                    var query = new Parse.Query(Participant);
                    query.equalTo("objectId", id);
                    return query.first();
                };
                ParseManager.prototype.getParticipantsInConvo = function (convoId) {
                    var conversation = new Conversation();
                    conversation.id = convoId;
                    var query = new Parse.Query(Participant);
                    query.equalTo("conversation", conversation);
                    return query.find();
                };
                return ParseManager;
            })();
            exports_1("ParseManager", ParseManager);
        }
    }
});
//# sourceMappingURL=ParseManager.js.map