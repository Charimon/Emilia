import './fonts.css';
import './home.sass';

import angular from 'angular';
import uirouter from 'angular-ui-router';

import routing from './home.routes';
import HomeController from './home.controller';
import API from '../services/api.service';

export default angular.module('app.home', [uirouter, API])
  .config(routing)
  .controller('HomeController', HomeController)
  .name;