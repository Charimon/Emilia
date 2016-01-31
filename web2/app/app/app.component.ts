import {Component} from 'angular2/core';
import {ParseManager} from '../parseManager/ParseManager';

@Component({
    selector: 'my-app',
    bindings: [ParseManager],
    template: '<h1>My First App</h1>'
})
export class AppComponent {
  constructor(public ParseManager: ParseManager) {
    ParseManager.test();
  }
}
