(function () {
  'use strict';

  angular.module('app.root',['app.uploader'])
    .controller('RootCtrl', RootCtrl);

  RootCtrl.$inject = ['messageBoardService','$location', '$scope'];

  function RootCtrl(messageBoardService, $location, $scope) {
    var ctrl = this;
    $scope.url = $location.url()
    console.log($location.url());
    angular.extend(ctrl, {
      messageBoardService: messageBoardService,
      currentYear: new Date().getUTCFullYear()
    });
  }
}());
