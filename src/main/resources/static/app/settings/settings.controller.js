(function () {
  'use strict';

  angular.module('app.settings')
    .controller('SettingsCtrl', SettingsCtrl);

  SettingsCtrl.$inject = ['$scope', 'MLRest', '$state', 'userService'];

  function SettingsCtrl($scope, mlRest, $state, userService) {
    var ctrl = this;
    $scope.buttonText = "Run Flow for Envelope Pattern"
    $scope.normalizeText = "Run Flow for Normalize Gender"
    $scope.mergeRecText = "Harmonize Customer Data & Call Transcripts"
    $scope.geoText = "Harmonize Geocode and Demographic data"
    $scope.nameText = "Run Flow for Normalize Name"
    var settingsGET = {
      method:'GET'
    };
    mlRest.extension('/alertsLog',settingsGET).then(function(response)  {
      $("#alertLogs").html(response.data)
    })
    mlRest.extension('/alerts',settingsGET).then(function(response)  {
      $("#alerts").html(response.data)
    })
    var model = {
      subject:null,
      predicate:null,
      object:null,
      docURI:null,
      element:null,
      score:null,
      rName:null,
      rDesc:null,
      rValue:null
    };

    $scope.addRule = function() {
      console.log(ctrl.model.rName)
      console.log(ctrl.model.rDesc)
      console.log(ctrl.model.rValue)
      var settings = {
        method:'PUT',
        params: {
          'rs:ruleName' : ctrl.model.rName,
          'rs:ruleDesc' : ctrl.model.rDesc,
          'rs:ruleValue' : ctrl.model.rValue
        }
      };
        mlRest.extension('/alerts', settings).then(function(response)  {
          $scope.showSuccessAlert = true;
          ctrl.model.rName = '';
          ctrl.model.rDesc ='';
          ctrl.model.rValue ='';
        })
        setTimeout(function(){displayRules();}, 700);


    }

    function displayRules(){
      mlRest.extension('/alerts',settingsGET).then(function(response)  {
        $("#alerts").html(response.data)
      })
    }

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
      model:model,
      submit: submit,
      addTag: addTag,
      removeTag: removeTag,
      envelopePattern:envelopePattern,
      normalizeGender:normalizeGender,
      mergeRecords:mergeRecords,
      geocodeRecords:geocodeRecords,
      normalizeName:normalizeName,
      createMapping:createMapping
    });

    function createMapping(){
      console.log(model)
      var settings = {
        method:'PUT',
        params: {
          'rs:subject': model.subject,
          'rs:predicate': model.predicate,
          'rs:object': model.object
        }
      };
      mlRest.extension('/createSemanticTriples', settings).then(function(response)  {
        $scope.showSuccessAlert = true;
        model.subject = '';
        model.object ='';
        model.predicate ='';
      });
    }

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
        $scope.loadingN=false
        $scope.nameText = "Run Flow for Normalize Name"

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
        $scope.mergeRecText = "Harmonize Customer Data & Call Transcripts"

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