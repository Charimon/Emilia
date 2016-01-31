import {Component} from 'angular2/core';
import {ParseManager} from '../parseManager/ParseManager';
import {Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig} from 'angular2/router';
import {User} from '../user/user.component';

@Component({
    selector: 'my-app',
    bindings: [ParseManager],
    template: `
      <h1>Group Trip: Michael, Andrew, 5 others. {{participant.objectId}}</h1>
      <div class="section">faces</div>
      <div class="section">
        <h2>WHEN</h2>
      </div>
      <div class="section">
        <h2>WHERE</h2>
      </div>
      <div class="section">
        <h2>FLY</h2>
      </div>
    `
})
export class AppComponent {
  participant: any = {};
  participants = [];
  constructor(public ParseManager: ParseManager) {
    var userId = window.location.pathname.split('/')[1];
    
    var participant = ParseManager.getParticipant(userId);
    participant.then((p) => {
      this.participant = p;
    });
    participant.then((p:any) => {
      return ParseManager.getParticipantsInConvo(p.get('conversation').id);
    }).then((people: [any]) => {
      this.participants = people;
    });
  }
}