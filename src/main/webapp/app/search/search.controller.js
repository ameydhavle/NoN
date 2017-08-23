/* global MLSearchController */
(function () {
  'use strict';

  angular.module('app.search',['ml.highcharts'])
    .controller('SearchCtrl', SearchCtrl);

  SearchCtrl.$inject = ['$scope', '$location', 'userService', 'MLSearchFactory','HighchartsHelper','$http'];


  // inherit from MLSearchController
  var superCtrl = MLSearchController.prototype;
  SearchCtrl.prototype = Object.create(superCtrl);

  function SearchCtrl($scope, $location, userService, searchFactory,HighchartsHelper,$http) {
    var i;
    var ctrl = this;
    ctrl.isCustomer = false;
    ctrl.runMapSearch = false;
    ctrl.userName = userService.currentUser().name
    ctrl.mlSearch = searchFactory.newContext();
    ctrl.myFacets = {};
		ctrl.mapOptions = {
			zoom: 3,
			center: {
				lat: 37.090240,
				lon: -95.712891
			},
			baseMap: {
	      name: 'Esri Maps',
	      source: {
	        type: 'EsriBaseMaps',
	        layer: 'NatGeo_World_Map'
	      }
	    }
    };
    $scope.model = {
      customers: {
        search: {},
        isSearching: false,
        page: 1,
        results: []
      },
      bulk: {
        search: {},
        isSearching: false,
        page: 1,
        results: []
      }

    }

    superCtrl.constructor.call(ctrl, $scope, $location, ctrl.mlSearch);

    ctrl.init();



		ctrl.search = function(qtext) {

			ctrl.mlSearch.setText( qtext ).setPage( this.page );
			ctrl.mlSearch.additionalQueries.push(ctrl.getCollectionConstraint());
			return this._search();
		};


		ctrl.myFacets = ctrl.response.facets

		ctrl.getGeoConstraint = function() {
			return {
				'custom-constraint-query': {
					'constraint-name': 'geo-point',
					'box': [ ctrl.bounds ]
				}
			};
		};

    function collectionConstraint(){
      return {
        'collection-query': {
          'uri': ['companies','feeds',  'documents','customers', 'panama-entities']
        }
      };
    }
    ctrl.getCollectionConstraint = function(){
      return {
        'collection-query': {
          //'uri': [ ctrl.userName + '-customers', ctrl.userName + '-call-center' , ctrl.userName + '-documents']
          'uri': ['companies','feeds', 'data', 'documents','customers', 'panama-entities', 'wire-transfer']
        }
      };
    }


    angular.extend(ctrl, {
    });

      $scope.$watch(userService.currentUser, function(newValue) {
      ctrl.currentUser = newValue;
    });
  }
}());
