(function () {
  'use strict';

  angular.module('app')
    .run(['loginService', function(loginService) {
      loginService.protectedRoutes(['root.search', 'root.create', 'root.profile']);
    }])
    .config(Config);

  Config.$inject = ['$stateProvider', '$urlMatcherFactoryProvider',
    '$urlRouterProvider', '$locationProvider'
  ];

  function Config(
    $stateProvider,
    $urlMatcherFactoryProvider,
    $urlRouterProvider,
    $locationProvider) {

    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);

    function valToFromString(val) {
      return val !== null ? val.toString() : val;
    }

    function regexpMatches(val) { // jshint validthis:true
      return this.pattern.test(val);
    }

    $urlMatcherFactoryProvider.type('path', {
      encode: valToFromString,
      decode: valToFromString,
      is: regexpMatches,
      pattern: /.+/
    });

    $stateProvider
      .state('root.cooc', {
        url: '/ext/cooc.xqy',
        abstract: true,
        resolve: {
          stuff: function() {
            alert("j")
          }
        }
      })
      .state('root', {
        url: '',
        // abstract: true,
        templateUrl: 'app/root/root.html',
        controller: 'RootCtrl',
        controllerAs: 'ctrl',
        resolve: {
          user: function(userService) {
            return userService.getUser();
          }
        }
      })
      .state('root.landing', {
        url: '/config',
        templateUrl: 'app/home/home.html',
        controller: 'HomeCtrl',
        controllerAs: 'ctrl',
        resolve: {
          stuff: function() {
            return null;
          }
        }
      })
      .state('root.operationalize', {
        url: '/operationalize',
        templateUrl: 'app/operationalize/operationalize.html',
        controller: 'OperationalizeCtrl',
        controllerAs: 'ctrl'
      })
      .state('root.harmonize', {
        url: '/harmonize',
        templateUrl: 'app/harmonize/harmonize.html',
        controller: 'HarmonizeCtrl',
        controllerAs: 'ctrl'
      })
      .state('root.harmonizeNetworks', {
        url: '/harmonizeNetworks',
        templateUrl: 'app/harmonizeNetworks/harmonize-networks.html',
        controller: 'HarmonizeNetworksCtrl',
        controllerAs: 'ctrl'
      })
      .state('root.settings', {
        url: '/settings',
        templateUrl: 'app/settings/settings.html',
        controller: 'SettingsCtrl',
        controllerAs: 'ctrl'
      })
      .state('root.events', {
        url: '/events',
        templateUrl: 'app/events/events.html',
        controller: 'EventsCtrl',
        controllerAs: 'ctrl'
      })
      .state('root.build', {
        url: '/build',
        templateUrl: 'app/build/build.html',
        controller: 'BuildCtrl',
        controllerAs: 'ctrl'
      })
      .state('root.land', {
        url: '/',
        templateUrl: 'app/landing/landing.html',
        controller: 'LandingCtrl',
        controllerAs: 'ctrl'
      })
      .state('root.data', {
        url: '/data',
        templateUrl: 'app/landing/home.html',
        controller: 'LandingCtrl',
        controllerAs: 'ctrl'
      })
      .state('root.search', {
        url: '/search',
        templateUrl: 'app/search/search.html',
        controller: 'SearchCtrl',
        controllerAs: 'ctrl'
      })
      .state('root.idl', {
        url: '/idl',
        templateUrl: 'app/IDL/idl.html',
        controller: 'IdlCtrl',
        controllerAs: 'ctrl'
      })
      .state('root.edl', {
        url: '/edl',
        templateUrl: 'app/EDL/edl.html',
        controller: 'EdlCtrl',
        controllerAs: 'ctrl'
      })
      .state('root.home', {
        url: '/home',
        templateUrl: 'app/home/home.html',
        controller: 'HomeCtrl',
        controllerAs: 'ctrl',
        resolve: {
          stuff: function() {
            return null;
          }
        }
      })
      .state('root.view', {
        url: '/detail{uri:path}',
        params: {
          uri: {
            value: null
          }
        },
        templateUrl: 'app/detail/detail.html',
        controller: 'DetailCtrl',
        controllerAs: 'ctrl',
        resolve: {
          doc: function(MLRest, $stateParams) {
            var uri = $stateParams.uri;
            return MLRest.getDocument(uri, { format: 'json' }).then(function(response) {
              return response;
            });
          }

        }
      })
      .state('root.profile', {
        url: '/profile',
        templateUrl: 'app/user/profile.html',
        controller: 'ProfileCtrl',
        controllerAs: 'ctrl'
      })
      .state('root.login', {
        url: '/login?state&params',
        templateUrl: 'app/login/login-full.html',
        controller: 'LoginFullCtrl',
        controllerAs: 'ctrl'
      })
      .state('root.upload', {
        url: '/upload',
        templateUrl: 'app/upload/upload.html',
        controller: 'uploaderCtrl',
        controllerAs: 'ctrl'
      })
      .state('root.migrate', {
        url: '/migrate',
        templateUrl: 'app/migrate/migrate.html',
        controller: 'MigratorCtrl',
        controllerAs: 'ctrl'
      });
  }
}());
