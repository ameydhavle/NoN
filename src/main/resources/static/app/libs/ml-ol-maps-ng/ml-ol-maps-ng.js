(function () {
	'use strict';

	angular.module('ml.ol-maps', []);
}());

/* global console */
(function () {

	'use strict';

	angular.module('ml.ol-maps')
	.directive('mlOlDetailMap', MLOlDetailMapDirective)
	.controller('MLOlDetailMapController', MLOlDetailMapController);

	function MLOlDetailMapDirective() {
		return {
			restrict: 'E',
			scope: {
				features: '=',
				baseMap: '=',
				zoom: '=',
				geometry: '=',
				enableLinks: '=',

				// parent callbacks
				parentSingleClick: '&singleClick'
			},
			templateUrl: '/templates/detail-map.html',
			controller: 'MLOlDetailMapController',
			controllerAs: 'ctrl'
		};
	}

	MLOlDetailMapController.$inject = ['$scope', 'mlOlHelper', 'mapLinksService'];
	function MLOlDetailMapController($scope, mlOlHelper, mapLinksService) {
		var ctrl = this;
		ctrl.pointMap = {};
		ctrl.geometries = [];
		ctrl.popupOverlay = null;

		ctrl.hideLinks = false;
		if ($scope.enableLinks !== undefined) {
			ctrl.hideLinks = !$scope.enableLinks;
		}

		$scope.$watch('features', function(data) {
			ctrl.addMapNodes($scope.features);
		});

		$scope.$watch('baseMap', function(data) {
			if ($scope.baseMap) {
				ctrl.mapSettings.baseMap = $scope.baseMap;
			}
		});

		$scope.$on('openlayers.map.singleclick', function(event, data) {
			data.event.map.forEachFeatureAtPixel(data.event.pixel, function (feature, layer) {
				var featureUri = feature.get('uri');
				$scope.$apply(function() {
					if ($scope.parentSingleClick) {
						// $scope.parentSingleClick({ 'featureUri': featureUri });
						$scope.parentSingleClick({ 'feature': feature });
					}
				});
			});
		});

		$scope.$on('openlayers.map.dblclick', function(event, data) {
			data.event.map.forEachFeatureAtPixel(data.event.pixel, function (feature, layer) {
				var featureUri = feature.get('uri');
				$scope.$apply(function() {
					if ($scope.enableLinks) {
						mapLinksService.search(featureUri).then(function(items) {
							ctrl.addLinkedNodes(items);
							ctrl.addLinks(items);
						});
					}
				});
			});
		});

		ctrl.toggleHideLinks = function() {
			ctrl.mapSettings.lineLayer.visible = !ctrl.hideLinks;
		};

		ctrl.addLinkedNodes = function(results) {
			var tmpPoints = [];
			var i = 0;
			for (i = 0; i < results.nodes.length; i++) {
				if (results.nodes[i].location && results.nodes[i].location.latitude) {
					tmpPoints.push({
						type: 'Feature',
						id: results.nodes[i].id,
						properties: {
							name: results.nodes[i].label,
							id: results.nodes[i].id,
							uri: results.nodes[i].id,
							group: results.nodes[i].group,
							metadata: results.nodes[i].metadata
						},
						geometry: {
							type: 'Point',
							coordinates: [
								results.nodes[i].location.longitude,
								results.nodes[i].location.latitude
							]
						}
					});

					ctrl.pointMap[results.nodes[i].id] = results.nodes[i].location;
				}
			}

			ctrl.mapSettings.ptLayer.source.geojson.object.features =
				ctrl.mapSettings.ptLayer.source.geojson.object.features.concat(tmpPoints);
		};

		ctrl.addLinks = function(results) {
			var tmpLines = [];
			var i = 0;
			var to = null;
			var from = null;

			for (i = 0; i < results.edges.length; i++) {
				from = null;
				to = null;

				if (results.edges[i].from && results.edges[i].to) {
					from = ctrl.pointMap[results.edges[i].from];
					to = ctrl.pointMap[results.edges[i].to];

					if (from && to) {
						tmpLines.push({
							type: 'Feature',
							id: results.edges[i].id,
							properties: {
								name: results.edges[i].label,
								strength: 2,
								metadata: results.edges[i].metadata
							},
							geometry: {
								type: 'LineString',
								coordinates: [
									[
										from.longitude,
										from.latitude
									],
									[
										to.longitude,
										to.latitude
									]
								]
							}
						});
					}
				}
			}

			ctrl.mapSettings.lineLayer.source.geojson.object.features =
				ctrl.mapSettings.lineLayer.source.geojson.object.features.concat(tmpLines);
		};

		ctrl.centerMap = function() {
			if (ctrl.mapSettings.ptLayer.source.geojson.object.features.length > 0) {
				var firstFeature = ctrl.mapSettings.ptLayer.source.geojson.object.features[0];
				ctrl.mapSettings.center.lon = firstFeature.geometry.coordinates[0];
				ctrl.mapSettings.center.lat = firstFeature.geometry.coordinates[1];
			}
		};

		ctrl.addMapNodes = function(data) {
			var tmpPoints = [];
			var i = 0;
			var feature = null;
			if (data && Array.isArray(data)) {
				for (i = 0; i < data.length; i++) {
					if (data[i].geometry) {
						feature = data[i];

						if (feature.properties.id !== null) {
							feature.properties.id = 'feature' + 1;
						}

						tmpPoints.push(feature);
					}
				}
			}

			ctrl.mapSettings.ptLayer.source.geojson.object.features = tmpPoints.concat(ctrl.geometries);
			ctrl.centerMap();
		};

		ctrl.addGeometries = function(data) {
			var tmpPoints = [];
			var i = 0;
			if (Array.isArray(data) && data.length > 0) {
				if (Array.isArray(data[0])) {
					for (i = 0; i < data.length; i++) {
						if (Array.isArray(data[i])) {
							tmpPoints.push({
								type: 'Feature',
								id: 'geo' + i,
								properties: {
									id: 'geo' + i
								},
								geometry: {
									type: 'Point',
									coordinates: data[i]
								}
							});
						}
						else {
							console.log('Unrecognized geometry format: ', data,
								'  Expected format is [lng, lat] or [[lng, lat], [lng, lat]]');
						}
					}
				}
				else if (data.length === 2 && !isNaN(data[0]) && !isNaN(data[1])) {
					tmpPoints.push({
						type: 'Feature',
						id: 'geo1',
						properties: {
							id: 'geo1'
						},
						geometry: {
							type: 'Point',
							coordinates: data
						}
					});
				}
				else {
					console.log('Unrecognized geometry format: ', data,
					'  Expected format is [lng, lat] or [[lng, lat], [lng, lat]]');
				}
			}
			else {
				console.log('Unrecognized geometry format: ', data,
					'  Expected format is [lng, lat] or [[lng, lat], [lng, lat]]');
			}

			ctrl.geometries = tmpPoints;

			ctrl.mapSettings.ptLayer.source.geojson.object.features =
				ctrl.mapSettings.ptLayer.source.geojson.object.features.concat(ctrl.geometries);

			ctrl.centerMap();
		};

		ctrl.loadInitialData = function() {
			ctrl.addMapNodes($scope.features);
			if ($scope.geometry) {
				ctrl.addGeometries($scope.geometry);
			}
		};

		ctrl.resetData = function() {
			ctrl.mapSettings.ptLayer.source.geojson.object.features = [];
			ctrl.mapSettings.lineLayer.source.geojson.object.features = [];

			ctrl.addMapNodes($scope.features);
			if ($scope.geometry) {
				ctrl.addGeometries($scope.geometry);
			}
		};

		// Default layer for lines.
		var defaultLineLayer = {
			name: 'lineLayer',
			style: mlOlHelper.createLineStyle,
			source: {
				type: 'GeoJSON',
				geojson: {
					projection: 'EPSG:4326',
					object: {
						type: 'FeatureCollection',
						features: []
					}
				}
			}
		};

		// Define the map settings.
		var tmpMapSettings = mlOlHelper.buildMapSettings();
		tmpMapSettings.ptLayer.style = mlOlHelper.createPointStyle;
		tmpMapSettings.lineLayer = $scope.lineLayer ? $scope.lineLayer : defaultLineLayer;
		tmpMapSettings.center.zoom = $scope.zoom ? $scope.zoom : 4;

		if ($scope.baseMap) {
			tmpMapSettings.baseMap = $scope.baseMap;
		}

		if ($scope.pointLayer) {
			tmpMapSettings.ptLayer = $scope.pointLayer;
		}

		ctrl.mapSettings = tmpMapSettings;
		ctrl.loadInitialData();
	}

}());

(function () {

	'use strict';

	angular.module('ml.ol-maps')
	.provider('mapLinksService', MapLinksService);

	MapLinksService.$inject = [];
	function MapLinksService() {
		var api = '/v1/resources/map-links-merchants';
		this.setApi = function(url) {
			api = url;
		};

		this.$get = function($http) {
			var service = {
				search: search,
				expand: expand,
			};

			function search(id) {
				return $http.get(api+'?rs:subject='+ encodeURIComponent(id)
				)
				.then(
					function(response) {
						return response.data;
					}
				);
			}

			function expand(id) {
				return $http.get(
					api+'?rs:expand=true&rs:subject=' + encodeURIComponent(id)
				)
				.then(
					function (response) {
						return response.data;
					});
			}

			return service;
		};
	}

}());
(function () {

	'use strict';

	angular.module('ml.ol-maps')
	.factory('mlOlHelper', MLOlHelper);

	MLOlHelper.$inject = [];

	function MLOlHelper() {

		// Create the marker color array.
		var markerColors = [
			'#f70010', // red
			'#e8790b', // orange
			'#2433d8', // blue
			'#bb0be8', // purple
			'#17e804'   // lime-green
		];

		var createTextStyle = function(text, fColor, yOffset) {
			var fillColor = '#f70010';
			var yOff = yOffset ? yOffset : 4;
			if (fColor) {
				fillColor = fColor;
			}
			return new ol.style.Text({
				textAlign: 'center',
				textBaseline: 'top',
				font: '12px Arial',
				text: text,
				fill: new ol.style.Fill({color: fillColor}),
				stroke: new ol.style.Stroke({color: 'white', width: 3}),
				offsetX: 0,
				offsetY: yOff,
				rotation: 0
			});
		};

		var createClusterTextStyle = function(text) {
			return new ol.style.Text({
				textAlign: 'center',
				textBaseline: 'middle',
				font: '14px Arial',
				text: text,
				fill: new ol.style.Fill({color: 'black'}),
				offsetX: 0,
				offsetY: 0,
				rotation: 0
			});
		};

		var createLineStyle = function(feature, resolution) {
			var lineWidth = feature.get('strength') ? feature.get('strength') : 3;
			var geometry = feature.getGeometry();
			var styles = [
				new ol.style.Style({
					stroke: new ol.style.Stroke({color: 'black', width: lineWidth}),
					text: createTextStyle(feature.get('name'), 'black')
				})
			];

			geometry.forEachSegment(function(start, end) {
				var dx = end[0] - start[0];
				var dy = end[1] - start[1];
				var rotation = Math.atan2(dy, dx);
				// arrows
				styles.push(new ol.style.Style({
					geometry: new ol.geom.Point(end),
					image: new ol.style.Icon({
						src: 'images/arrow-black.png',
						anchor: [1.5, 0.5],
						rotateWithView: false,
						rotation: -rotation
					})
				}));
			});

			return styles;
		};

		var createPointStyle = function(feature, resolution) {
			var radius = 8;
			var fillColor = 'red';
			if (feature.get('group')) {
				var group = feature.get('group');
				if (group === 'inNetwork') {
					fillColor = '#2433d8';
				}
			}

			return new ol.style.Style({
				image: new ol.style.Circle({
					radius: radius,
					fill: new ol.style.Fill({color: fillColor}),
					stroke: new ol.style.Stroke({color: 'black', width: 1})
				}),
				text: createTextStyle(feature.get('name'), fillColor)
			});
		};

		var createLinkedPointStyle = function(feature, resolution) {
			var radius = 12;
			return new ol.style.Style({
				image: new ol.style.Circle({
					radius: radius,
					fill: new ol.style.Fill({color: 'red'}),
					stroke: new ol.style.Stroke({color: 'black', width: 1})
				}),
				// templatesxt: createTextStyle(feature.get('name'), null, radius)
				text: createTextStyle(feature.get('name'))
			});
		};

		var createClusterPointStyle = function(feature, resolution) {
			var radius = 10;
			var count = 0;
			var countLength = 0;
			var strokeWidth = 2;
			var lineDash = [5];
			var colorIdx = 0;
			if (feature.get('count')) {
				count = feature.get('count');
				countLength = count.toString().length;
				radius = 10 + (countLength > 1 ? (countLength - 1) * 5 : 0);
			}

			if (feature.get('layer')) {
				colorIdx = feature.get('layer') % 5;
			}

			if (count === 1) {
				radius = 5;
				strokeWidth = 1;
				lineDash = [];
			}

			return new ol.style.Style({
				image: new ol.style.Circle({
					radius: radius,
					fill: new ol.style.Fill({color: markerColors[colorIdx]}),
					stroke: new ol.style.Stroke({color: 'black', width: strokeWidth, lineDash: lineDash})
				}),
				text: (count > 1) ? createClusterTextStyle(''+ count) : createTextStyle('')
			});
		};

		var convertExtent = function(data) {
			var extentData = {};
			var mapSize = data.event.map.getSize();
			var extent = data.event.map.getView().calculateExtent(mapSize);
			extent = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');

			extentData.west  = extent[0];
			extentData.south = extent[1];
			extentData.east  = extent[2];
			extentData.north = extent[3];

			// Adjust the west value when wrapping the world.
			while (extentData.west < -180) {
				extentData.west = extentData.west + 360;
			}

			// Adjust the east value when wrapping the world.
			while (extentData.east > 180) {
				extentData.east = extentData.east - 360;
			}

			return extentData;
		};

		var buildMapSettings = function() {
			var settings = {
				center: {
					lat: 0,
					lon: 0,
					zoom: 5
				},
				defaults: {
					interactions: {
						mouseWheelZoom: true,
						doubleClickZoom: false
					},
					controls: {
						zoom: true,
						rotate: false,
						attribution: false
					},
					events: {
						map: ['singleclick', 'dblclick', 'moveend']
					}
				},
				baseMap: {
					name: 'OpenStreetMap',
					source: {
							type: 'OSM'
					}
				},
				mousePosition: {
					projection: 'EPSG:4326',
					coordinateFormat: ol.coordinate.createStringXY(4)
				},
				ptLayer: {
					name: 'ptLayer',
					source: {
						type: 'GeoJSON',
						geojson: {
							projection: 'EPSG:4326',
							object: {
								type: 'FeatureCollection',
								features: []
							}
						}
					}
				}
			};

			return settings;
		};

		return {
			createTextStyle: createTextStyle,
			createPointStyle: createPointStyle,
			createLinkedPointStyle: createLinkedPointStyle,
			createClusterPointStyle: createClusterPointStyle,
			createClusterTextStyle: createClusterTextStyle,
			createLineStyle: createLineStyle,
			convertExtent: convertExtent,
			buildMapSettings: buildMapSettings
		};
	}

}());

(function () {

	'use strict';

	angular.module('ml.ol-maps')
	.directive('mlOlSearchFacetsMap', MLOlSearchFacetsMapDirective)
	.controller('MLOlSearchFacetsMapController', MLOlSearchFacetsMapController);

	function MLOlSearchFacetsMapDirective() {
		return {
			restrict: 'E',
			scope: {
				baseMap: '=',
				zoom: '=',
				facets: '=',
				center: '=',

				// parent callbacks
				parentSingleClick: '&singleClick',
				parentBoundsChanged: '&boundsChanged'
			},
			templateUrl: '/templates/search-map.html',
			controller: 'MLOlSearchFacetsMapController',
			controllerAs: 'ctrl'
		};
	}

	MLOlSearchFacetsMapController.$inject = ['$scope', 'mlOlHelper'];
	function MLOlSearchFacetsMapController($scope, mlOlHelper) {
		var ctrl = this;
		ctrl.pointMap = {};
		ctrl.mapSettings = {};

		$scope.$watch('facets', function(data) {
			ctrl.processFacets($scope.facets);
		});

		$scope.$watch('baseMap', function(data) {
			if ($scope.baseMap) {
				ctrl.mapSettings.baseMap = $scope.baseMap;
			}
		});

		$scope.$on('openlayers.map.singleclick', function(event, data) {
			data.event.map.forEachFeatureAtPixel(data.event.pixel, function (feature, layer) {
				var featureUri = feature.get('uri');
				$scope.$apply(function() {
					if ($scope.parentSingleClick) {
						$scope.parentSingleClick({ 'featureUri': featureUri });
					}
				});
			});
		});

		$scope.$on('openlayers.map.moveend', function(event, data) {
			var extentData = mlOlHelper.convertExtent(data);
			$scope.$apply(function() {
				if ($scope.parentBoundsChanged) {
					$scope.parentBoundsChanged({ 'bounds': extentData});
				}
			});
		});

		ctrl.createMapNode = function(box, index, i) {
			var lng = (box.w + box.e) / 2;
			var lat = (box.s + box.n) / 2;

			return {
				type: 'Feature',
				id: 'feature' + index + i,
				properties: {
					name: '' + box.count,
					id: 'feature' + index + i,
					uri: box.uri,
					count: box.count,
					layer: i
				},
				geometry: {
					type: 'Point',
					coordinates: [lng, lat]
				}
			};
		};

		ctrl.processFacets = function(facets) {
			var facetName, facet, box;
			var tmpPoints = [];
			var i = 0;
			var index = 0;

			// Return if the controller hasn't completed initialization
			if (!ctrl.createMapNode) {
				return;
			}

			// Add the new markers.
			for (facetName in facets) {
				facet = facets[facetName];
				if (facet && facet.boxes) {
					for (index=0; index < facet.boxes.length; index++) {
						box = facet.boxes[index];
						tmpPoints.push( ctrl.createMapNode(box, index, i) );
					}

					++i;
				}
			}

			ctrl.mapSettings.ptLayer.source.geojson.object.features = tmpPoints;
		};

		// Define the map settings.
		var tmpMapSettings = mlOlHelper.buildMapSettings();
		tmpMapSettings.ptLayer.style = mlOlHelper.createClusterPointStyle;

		if ($scope.zoom) {
			tmpMapSettings.center.zoom = $scope.zoom;
		}

		if ($scope.center) {
			tmpMapSettings.center.lat = $scope.center.lat;
			tmpMapSettings.center.lon = $scope.center.lon;
		}

		if ($scope.baseMap) {
			tmpMapSettings.baseMap = $scope.baseMap;
		}

		if ($scope.pointLayer) {
			tmpMapSettings.ptLayer = $scope.pointLayer;
		}

		ctrl.mapSettings = tmpMapSettings;
		ctrl.processFacets($scope.facets);
	}

}());

(function () {

	'use strict';

	angular.module('ml.ol-maps')
	.directive('mlOlSearchFeatureMap', MLOlSearchFeatureMapDirective)
	.controller('MLOlSearchFeatureMapController', MLOlSearchFeatureMapController);

	function MLOlSearchFeatureMapDirective() {
		return {
			restrict: 'E',
			scope: {
				features: '=',
				baseMap: '=',
				zoom: '=',
				center: '=',

				// parent callbacks
				parentSingleClick: '&singleClick',
				parentBoundsChanged: '&boundsChanged'
			},
			templateUrl: '/templates/search-map.html',
			controller: 'MLOlSearchFeatureMapController',
			controllerAs: 'ctrl'
		};
	}

	MLOlSearchFeatureMapController.$inject = ['$scope', 'mlOlHelper'];
	function MLOlSearchFeatureMapController($scope, mlOlHelper) {
		var ctrl = this;
		ctrl.geometries = [];
		ctrl.mapSettings = {};
		ctrl.pointMap = {};

		$scope.$watch('features', function(data) {
			ctrl.addMapNodes($scope.features);
		});

		$scope.$watch('baseMap', function(data) {
			if ($scope.baseMap) {
				ctrl.mapSettings.baseMap = $scope.baseMap;
			}
		});

		$scope.$on('openlayers.map.singleclick', function(event, data) {
			data.event.map.forEachFeatureAtPixel(data.event.pixel, function (feature, layer) {
				var featureUri = feature.get('uri');
				$scope.$apply(function() {
					if ($scope.parentSingleClick) {
						$scope.parentSingleClick({ 'featureUri': featureUri });
					}
				});
			});
		});

		$scope.$on('openlayers.map.moveend', function(event, data) {
			var extentData = mlOlHelper.convertExtent(data);
			$scope.$apply(function() {
				if ($scope.parentBoundsChanged) {
					$scope.parentBoundsChanged({ 'bounds': extentData});
				}
			});
		});

		ctrl.addMapNodes = function(data) {
			var tmpPoints = [];
			var i = 0;
			var feature = null;
			if (data && Array.isArray(data)) {
				for (i = 0; i < data.length; i++) {
					if (data[i].geometry) {
						feature = data[i];

						if (feature.properties.id !== null) {
							feature.properties.id = 'feature' + 1;
						}

						tmpPoints.push(feature);
					}
				}
			}

			ctrl.mapSettings.ptLayer.source.geojson.object.features = tmpPoints.concat(ctrl.geometries);
		};

		// Define the map settings.
		var tmpMapSettings = mlOlHelper.buildMapSettings();
		tmpMapSettings.ptLayer.style = mlOlHelper.createPointStyle;

		if ($scope.zoom) {
			tmpMapSettings.center.zoom = $scope.zoom;
		}

		if ($scope.center) {
			tmpMapSettings.center.lat = $scope.center.lat;
			tmpMapSettings.center.lon = $scope.center.lon;
		}

		if ($scope.baseMap) {
			tmpMapSettings.baseMap = $scope.baseMap;
		}

		if ($scope.pointLayer) {
			tmpMapSettings.ptLayer = $scope.pointLayer;
		}

		ctrl.mapSettings = tmpMapSettings;
		ctrl.addMapNodes($scope.features);
	}

}());
