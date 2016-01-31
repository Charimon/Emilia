import './booking.sass';

import angular from 'angular';
import uirouter from 'angular-ui-router';

import routing from './booking.routes';
import BookingController from './booking.controller';
import API from '../services/api.service';

export default angular.module('app.booking', [uirouter, API])
  .config(routing)
  .controller('BookingController', BookingController)
  .name;