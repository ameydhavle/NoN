(function () {
  'use strict';

  angular.module('app.harmonizeNetworks')
    .controller('HarmonizeNetworksCtrl', HarmonizeNetworksCtrl);

  HarmonizeNetworksCtrl.$inject = ['$scope', 'MLRest', '$state', 'userService'];

  function HarmonizeNetworksCtrl($scope, mlRest, $state, userService) {
    var ctrl = this;
    $scope.buttonText = "Run Flow for Envelope Pattern";
    $scope.geoText = "Harmonize Geocode data";
    $scope.createCentralText = "Create Central Merchant";
    $scope.deleteCentralText = "Delete Central Merchant";

    $scope.envBtn = 'btn btn-primary btn-md';
    $scope.geoRecBtn = 'btn btn-primary btn-md';
    $scope.createCentralBtn = 'btn btn-primary btn-md';
    $scope.deleteCentralBtn = 'btn btn-warning btn-md';

    angular.extend(ctrl, {
      envelopePattern:envelopePattern,
      geocodeRecords:geocodeRecords,
      createCentralMerchant:createCentralMerchant,
      deleteCentralMerchant:deleteCentralMerchant
    });


    function envelopePattern(){
      $scope.test="true";
      $scope.loading="true"
      $scope.buttonText = "Updating Records";
      var settingsGET = {
        method:'PUT'
      };
      mlRest.extension('/envelopePatternMerchants',settingsGET).then(function(response)  {
        $scope.loading=false
        $scope.buttonText = "Run Flow for Envelope Pattern"
        $scope.test="false";
        $scope.envBtn = 'btn btn-success btn-md'
      })
    };

    function geocodeRecords(){
      $scope.geoRec="true"
      $scope.geoText = "Updating Records";
      var settingsGET = {
        method:'PUT'
      };
      mlRest.extension('/geocodeMerchantData',settingsGET).then(function(response)  {
        $scope.geoRec=false
        $scope.geoText = "Harmonize Geocode data"
        $scope.geoRecBtn = 'btn btn-success btn-md'
      })
    };

    function createCentralMerchant(){
      $scope.createCentralRunning="true"
      $scope.createCentralText = "Adding Records";
      var settingsGET = {
        method:'PUT'
      };
      mlRest.extension('/createCentralMerchant',settingsGET).then(function(response)  {
        $scope.createCentralRunning=false
        $scope.createCentralText = "Create Central Merchant"
        $scope.createCentralBtn = 'btn btn-success btn-md'
      })
    };

    function deleteCentralMerchant(){
      $scope.deleteCentralRunning="true"
      $scope.deleteCentralText = "Deleting Records";
      var settingsGET = {
        method:'PUT'
      };
      mlRest.extension('/clearCentralMerchant',settingsGET).then(function(response)  {
        $scope.deleteCentralRunning=false
        $scope.deleteCentralText = "Delete Central Merchant"
        $scope.deleteCentralBtn = 'btn btn-success btn-md'
      })
    };
  }
}());
