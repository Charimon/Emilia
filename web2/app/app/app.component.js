System.register(['angular2/core', '../parseManager/ParseManager'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, ParseManager_1;
    var AppComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (ParseManager_1_1) {
                ParseManager_1 = ParseManager_1_1;
            }],
        execute: function() {
            AppComponent = (function () {
                function AppComponent(ParseManager) {
                    var _this = this;
                    this.ParseManager = ParseManager;
                    this.participant = {};
                    this.participants = [];
                    var userId = window.location.pathname.split('/')[1];
                    var participant = ParseManager.getParticipant(userId);
                    participant.then(function (p) {
                        _this.participant = p;
                    });
                    participant.then(function (p) {
                        return ParseManager.getParticipantsInConvo(p.get('conversation').id);
                    }).then(function (people) {
                        _this.participants = people;
                    });
                }
                AppComponent = __decorate([
                    core_1.Component({
                        selector: 'my-app',
                        bindings: [ParseManager_1.ParseManager],
                        template: "\n      <h1>Group Trip: Michael, Andrew, 5 others. {{participant.objectId}}</h1>\n      <div class=\"section\">faces</div>\n      <div class=\"section\">\n        <h2>WHEN</h2>\n      </div>\n      <div class=\"section\">\n        <h2>WHERE</h2>\n      </div>\n      <div class=\"section\">\n        <h2>FLY</h2>\n      </div>\n    "
                    }), 
                    __metadata('design:paramtypes', [ParseManager_1.ParseManager])
                ], AppComponent);
                return AppComponent;
            })();
            exports_1("AppComponent", AppComponent);
        }
    }
});
//# sourceMappingURL=app.component.js.map