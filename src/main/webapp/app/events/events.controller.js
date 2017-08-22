/* global MLSearchController */
(function () {
	'use strict';

	angular.module('app.events',['ml.highcharts'])
		.controller('EventsCtrl', EventsCtrl)
		.filter('strReplace', function () {
		return function (input, from, to) {
			input = input || '';
			from = from || '';
			to = to || '';
			return input.replace(new RegExp(from, 'g'), to);
		};
	});

	EventsCtrl.$inject = ['$scope', '$location', 'userService', 'MLSearchFactory','HighchartsHelper','$http', '$window'];

	// inherit from MLSearchController
	var superCtrl = MLSearchController.prototype;
	EventsCtrl.prototype = Object.create(superCtrl);

	function EventsCtrl($scope, $location, userService, searchFactory,HighchartsHelper, $http, $window) {
		var ctrl = this;
		ctrl.isCustomer = true
		ctrl.qtext ='';


		var transactionsData = searchFactory.newContext({
			queryOptions: 'transactions',
			pageLength: 12
		});
		superCtrl.constructor.call(ctrl, $scope, $location, transactionsData);
		ctrl.init();

		ctrl.myFacets = {};
		ctrl.response ={};
		$scope.login = function (key) {
			$location.path('/' + key.substring(key.indexOf('-') + 1));
		};
		var model = {
			showAlert: "none",
			defaultSymbol: 'tsla',
			symbol: '',
			qtext: '',
			features: [],
			hideMap: false,
			transactions: {
				search: {},
				isSearching: false,
				page: 1,
				results: [],
				facets:{}
			},
			merchants: {
				search: {},
				isSearching: false,
				page: 1,
				results: []
			},
			mapOptions: {
				zoom: 3,
				center: {
					lat: 40.0,
					lon: -73.00
				},
				baseMap: {
					name: 'Esri Maps',
					source: {
						type: 'EsriBaseMaps',
						layer: 'NatGeo_World_Map'
					}
				}
			}
		};
		function transactionConstraint(){
			return {
				'collection-query': {
					'uri': ['wire-transfer']
				}
			}
		}

		function merchantsConstraint(){
			return {
				'collection-query': {
					'uri': [ 'merchants']
				}
			}
		}
		ctrl.getCollectionConstraint = function(){
			return {
				'collection-query': {
					'uri': [ 'customers', 'call-center' , 'admin-documents']
				}
			}
		}

		function search(){
			//searchMerchants()
			searchTransactions()
		}

		/*
		function searchMerchants() {
			model.merchants.isSearching = true;
			ctrl.userName = userService.currentUser().name
			merchantsData.additionalQueries.push(merchantsConstraint());
			merchantsData
				.setText(model.qtext)
				.setPage(model.merchants.page)
				.search()
				.then(updateMerchantResults);
		}
		function updateMerchantResults(data) {
			model.merchants.isSearching = false;
			model.merchants.search = data;
			model.merchants.page = merchantsData.getPage();
			model.merchants.results = data.results;
			model.tree.data[model.tree.indexes.MERCHANT_DATA].count = model.merchants.search.total;
			buildFeatures(data);
		}
		*/

		function buildFeatures(data) {
			if (data && data.results && data.results.length > 0) {
				var tmp = [];
				for (var i=0; i < data.results.length; i++) {
					if (data.results[i].metadata['Lat']) {
						var name = data.results[i].metadata['Company_Name'].values[0];
						tmp.push({
							type: 'Feature',
							properties: {
								id: name,
								name: name,
								uri: data.results[i].uri
								// uri: name
							},
							geometry: {
								type: 'Point',
								coordinates: [
									data.results[i].metadata['Long'].values[0],
									data.results[i].metadata['Lat'].values[0]
								]
							}
						});
					}

					// Set center of map to first item
					if (0 === i) {
						model.mapOptions.center.lat = data.results[i].metadata['Lat'].values[0];
						model.mapOptions.center.lon = data.results[i].metadata['Long'].values[0];
					}
				}

				model.features = tmp;
			}
			else {
				model.features = [];
			}
		}

		function searchTransactions() {
			model.transactions.isSearching = true;
			ctrl.userName = userService.currentUser().name
			ctrl.qtext = ctrl.model.qtext;
			transactionsData.additionalQueries.push(transactionConstraint());
			superCtrl.search.call(ctrl);
		}
		function updateTransactionResults(data) {

			model.transactions.isSearching = false;
			model.transactions.search = data;
			ctrl.response.facets = data.facets
			model.transactions.page = transactionsData.getPage();
			model.transactions.results = data.results;
		}

		$scope.filterCreditor = function(val){
			if(model.qtext.length < 1){
				model.qtext = "'"+val+"'"
			}else{
				model.qtext = model.qtext + " AND '"+val+"'"
			}
			search()
		}

		$scope.clear = function(){
			clear()
		}
		ctrl.clear = function(){
			clear()
		}
		function clear(){
			model.qtext = ''
			search()
		}

		$scope.range = function(n) {
			return new Array(n);
		};
		$scope.$watch(userService.currentUser, function(newValue) {
			ctrl.currentUser = newValue;
		});

		ctrl.mapSingleClick = function(featureUri) {
			if (featureUri) {
				$window.open('/detail' + featureUri, '_self');
			}
		}

		angular.extend(ctrl, {
			model:model,
			searchTransactions:searchTransactions,
			//searchMerchants:searchMerchants,
			search:search,
			clear:clear
		});

		search();
	}
}());
