(function () {
  'use strict';

  angular.module('app.harmonize')
    .controller('HarmonizeCtrl', HarmonizeCtrl);

  HarmonizeCtrl.$inject = ['$scope', 'MLRest', '$state', 'userService'];

  function HarmonizeCtrl($scope, mlRest, $state, userService) {
    var ctrl = this;
    $scope.buttonText = "Run Flow for Envelope Pattern"
    $scope.normalizeText = "Run Flow for Normalize Gender"
    $scope.mergeRecText = "Harmonize Customer Data & Transaction"
    $scope.geoText = "Harmonize Geocode & Demographic data"
    $scope.nameText = "Run Flow for Normalize Name"
    $scope.linkText = "Run Flow to discover anamolies & link data"
    $scope.houseText = "Run Flow to discover householding"
    $scope.merchantText = "Run Flow to generate merchant graph"

    $scope.envBtn = 'btn btn-primary btn-md';
    $scope.linkBtn = 'btn btn-primary btn-md';
    $scope.normalizeBtn = 'btn btn-primary btn-md';
    $scope.nameBtn = 'btn btn-primary btn-md';
    $scope.mergeRecBtn = 'btn btn-primary btn-md';
    $scope.geoRecBtn = 'btn btn-primary btn-md';
    $scope.merRecBtn = 'btn btn-primary btn-md';
    $scope.houseBtn = 'btn btn-primary btn-md';

    angular.extend(ctrl, {
      person: {
        isActive: true,
        balance: 0,
        picture: 'http://placehold.it/32x32',
        age: 0,
        eyeColor: null,
        name: null,
        gender: null,
        company: null,
        email: null,
        phone: null,
        address: null,
        about: null,
        registered: null,
        latitude: 0,
        longitude: 0,
        tags: [],
        friends: [],
        greeting: null,
        favoriteFruit: null

      },
      newTag: null,
      currentUser: null,
      editorOptions: {
        plugins : 'advlist autolink link image lists charmap print preview'
      },
      submit: submit,
      addTag: addTag,
      removeTag: removeTag,
      envelopePattern:envelopePattern,
      normalizeGender:normalizeGender,
      mergeRecords:mergeRecords,
      geocodeRecords:geocodeRecords,
      normalizeName:normalizeName,
      linkData:linkData,
      merchantGraph:merchantGraph,
      discoverHouseHolding:discoverHouseHolding
    });


    function envelopePattern(){
      $scope.test="true";
      $scope.loading="true"
      $scope.buttonText = "Updating Records";
      var settingsGET = {
        method:'PUT'
      };
      mlRest.extension('/envelopePattern',settingsGET).then(function(response)  {
        console.log("called extension");
        $scope.loading=false
        $scope.buttonText = "Run Flow for Envelope Pattern"
        $scope.test="false";
        $scope.envBtn = 'btn btn-success btn-md'
      })
    }

    function linkData(){
      $scope.linkName="true"
      $scope.linkText = "Updating Records";
      var settingsGET = {
        method:'PUT'
      };
      mlRest.extension('/createLinkData',settingsGET).then(function(response)  {
        console.log("called extension");
        $scope.linkName=false
        $scope.linkText = "Run Flow to discover anamolies & link data"
        $scope.linkBtn = 'btn btn-success btn-md'
      })
    }

    function normalizeGender(){
      $scope.loadingN="true"
      $scope.normalizeText = "Updating Records";
      var settingsGET = {
        method:'PUT'
      };
      mlRest.extension('/normalizeGender',settingsGET).then(function(response)  {
        console.log("called extension");
        $scope.loadingN=false
        $scope.normalizeText = "Run Flow for Normalize Gender"
        $scope.normalizeBtn = 'btn btn-success btn-md'
      })
    }

    function normalizeName(){
      $scope.loadingName="true"
      $scope.nameText = "Updating Records";
      var settingsGET = {
        method:'PUT'
      };
      mlRest.extension('/normalizeName',settingsGET).then(function(response)  {
        console.log("called extension");
        $scope.loadingName=false
        $scope.nameText = "Run Flow for Normalize Name"
        $scope.nameBtn = 'btn btn-success btn-md'
      })
    }



    function discoverHouseHolding(){
      $scope.houseBtnName="true"
      $scope.normalizeText = "Updating Records";
      var settingsGET = {
        method:'PUT'
      };
      mlRest.extension('/createHouseHolding',settingsGET).then(function(response)  {
        console.log("called extension");
        $scope.houseBtnName=false
        $scope.houseText = "Run Flow to discover householding"
        $scope.houseBtn = 'btn btn-success btn-md'
      })
    }

    function mergeRecords(){
      $scope.mergeRec="true"
      $scope.mergeRecText = "Updating Records";
      var settingsGET = {
        method:'PUT'
      };
      mlRest.extension('/harmonizeTranscripts',settingsGET).then(function(response)  {
        console.log("called transcripts");
        $scope.mergeRec=false
        $scope.mergeRecText = "Harmonize Customer Data & Transactions"
        $scope.mergeRecBtn = 'btn btn-success btn-md'
      })
    }


    function geocodeRecords(){
      $scope.geoRec="true"
      $scope.geoText = "Updating Records";
      var settingsGET = {
        method:'PUT'
      };
      mlRest.extension('/geocodeData',settingsGET).then(function(response)  {
        console.log("called transcripts");
        $scope.geoRec=false
        $scope.geoText = "Harmonize Geocode and Demographic data"
        $scope.geoRecBtn = 'btn btn-success btn-md'
      })
    }

    function merchantGraph(){
      $scope.merRec="true"
      $scope.merchantText = "Updating Records";
      var settingsGET = {
        method:'PUT'
      };
      mlRest.extension('/enrichMerchantGraph',settingsGET).then(function(response)  {
        console.log("called transcripts");
        $scope.merRec=false
        $scope.merchantText = "Run Flow to generate merchant graph"
        $scope.merRecBtn = 'btn btn-success btn-md'
      })
    }


    function submit() {
      mlRest.createDocument(ctrl.person, {
        format: 'json',
        directory: '/content/',
        extension: '.json',
        collection: ['data', 'data/people']
        // TODO: add read/update permissions here like this:
        // 'perm:sample-role': 'read',
        // 'perm:sample-role': 'update'
      }).then(function(response) {
        $state.go('root.view', { uri: response.replace(/(.*\?uri=)/, '') });
      });
    }

    function addTag() {
      if (ctrl.newTag && ctrl.newTag !== '' && ctrl.person.tags.indexOf(ctrl.newTag) < 0) {
        ctrl.person.tags.push(ctrl.newTag);
      }
      ctrl.newTag = null;
    }

    function removeTag(index) {
      ctrl.person.tags.splice(index, 1);
    }

    $scope.$watch(userService.currentUser, function(newValue) {
      ctrl.currentUser = newValue;
    });
  }
}());

/*
(function () {
  'use strict';

  angular.module('app.analyze')
    .controller('AnalyzeCtrl', AnalyzeCtrl);

  AnalyzeCtrl.$inject = ['$scope', 'MLRest', '$state', 'userService'];

  function AnalyzeCtrl($scope, mlRest, $state, userService) {

    var ctrl = this;

    $scope.envelopePattern =  function() {
      console.log("Harmonize " )
      var settingsGET = {
        method:'PUT'
      };
      MLRest.extension('/envelopePattern',settingsGET).then(function(response)  {
        console.log("called extension");
      })
    }
  }
}());
*/