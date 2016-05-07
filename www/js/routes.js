angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  

      .state('tabsController.map', {
    url: '/map',
    views: {
      'tab1': {
        templateUrl: 'templates/map.html',
        controller: 'mapCtrl'
      }
    }
  })

  .state('tabsController.newRoute', {
    url: '/new',
    views: {
      'tab2': {
        templateUrl: 'templates/newRoute.html',
        controller: 'newRouteCtrl'
      }
    }
  })

  .state('tabsController.store', {
    url: '/store',
    views: {
      'tab3': {
        templateUrl: 'templates/store.html',
        controller: 'storeCtrl'
      }
    }
  })

  .state('tabsController', {
    url: '/tabs',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

  .state('profile', {
    url: '/profile',
    templateUrl: 'templates/profile.html',
    controller: 'profileCtrl'
  })

$urlRouterProvider.otherwise('/tabs/map')

  

});