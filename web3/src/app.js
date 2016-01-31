import angular from 'angular';
import uirouter from 'angular-ui-router';

import home from './features/home/index';
import booking from './features/booking/index';

import routing from './app.config';

angular.module('app', [uirouter, home, booking]).config(routing);
