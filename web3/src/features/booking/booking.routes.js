routes.$inject = ['$stateProvider'];

export default function routes($stateProvider) {
  $stateProvider
    .state('booking', {
      url: '/booking/:participantId',
      template: require('./booking.html'),
      controller: 'BookingController',
      controllerAs: 'booking'
    });
}