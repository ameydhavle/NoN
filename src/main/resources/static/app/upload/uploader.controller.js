(function () {

  'use strict';

  angular.module('app.uploader')
    .controller('uploaderCtrl', UploaderCtrl);

  UploaderCtrl.$inject = ['$http', 'MLRest','$window', 'userService', '$scope','mlUploadService'];
  function UploaderCtrl($http,mlRest, $window, userService, $scope, mlUploadService) {
    $scope.showDiv = true
  	var ctrl = this;
    ctrl.userName = userService.currentUser().name
    ctrl.feedURL =''
    //mlUploadService.sendFile()
  	ctrl.mlcp = {
      output_permissions: 'rest-reader,read,rest-writer,update',
      output_uri_suffix: '.xml',
      output_uri_prefix: '/data/',
      generate_uri: true

  	};
    ctrl.binary = {
      output_permissions: 'rest-reader,read,rest-writer,update',
      output_collections:  'binary',
      document_type:'binary',
      output_uri_prefix: '/binary/'
    };
    angular.extend(ctrl, {
      inputs: {
        jdbcDriver: 'com.mysql.jdbc.Driver',
        jdbcUrl: 'jdbc:mysql://rdbms-dev.demo.marklogic.com:3306/ingestion',
        jdbcUsername: 'ingest',
        jdbcPassword: 'inGest12()',
        sql: 'select * from member; ',
        rootLocalName: 'root'
      },
      migrateSQL: migrateSQL,
      loadCustomer: loadCustomer,
      loadCCTranscripts:loadCCTranscripts,
      loadZipcodes:loadZipcodes,
      ingestRSSFeed:ingestRSSFeed,
      ingestMSNBC:ingestMSNBC,
      ingestCNN:ingestCNN,
      ingestBBC:ingestBBC
    });
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
//show selected tab / active
      if( $(e.target).attr('href') === "#binary"){
        $scope.showDiv = false;
        $("#mlcp-options").hide()
      }

    });

    function loadCustomer(){
      console.log("loading sample customer file")
      $scope.uploadCust="true"
      var settingsGET = {
        method:'PUT'
      };
      mlRest.extension('/loadSampleData',settingsGET).then(function(response)  {
        $scope.uploadCust=false
      })
    }

    function loadZipcodes(){
      $scope.uploadZipcode="true"
      console.log("loading zipcodes")
      var settingsGET = {
        method:'PUT'
      };
      mlRest.extension('/loadZipCodes',settingsGET).then(function(response)  {
        console.log("called transcripts");
        $scope.uploadZipcode=false
      })
    }

    function ingestMSNBC(){
      ctrl.feedURL = "http://www.cnbc.com/id/15837362/device/rss/rss.html"

    }

    function ingestBBC(){
      ctrl.feedURL = "http://feeds.bbci.co.uk/news/world/rss.xml?edition=uk"
    }

    function ingestCNN(){
      ctrl.feedURL = "http://rss.cnn.com/rss/cnn_latest.rss"
    }
    function ingestRSSFeed(){
      console.log("loading Feeds")
      var settingsGET = {
        method:'PUT'
      };
      mlRest.extension('/ingestRSSFeed?rs:url='+ctrl.feedURL,settingsGET).then(function(response)  {
        console.log("called transcripts");
        $scope.uploadZipcode=false
      })
    }

    function loadCCTranscripts(){
      console.log("loading call-center sample data")
      $scope.uploadEvents="true"
      console.log("loading transcripts")
      var settingsGET = {
        method:'PUT'
      };
      mlRest.extension('/loadCallCenterData',settingsGET).then(function(response)  {
        console.log("called transcripts");
        $scope.uploadEvents=false
      })
    }


    function migrateSQL(){
      ctrl.receipt = null;
      $http(
        {
          method: 'PUT',
          url: '/v1/migrate',
          data: ctrl.inputs,
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(function(response) {
          ctrl.receipt = 'The data was successfully migrated.';
          $window.scrollTo(0, 0);
        });
    }
  }

})();
