(function () {
  'use strict';
  angular.module('app.detail')
  .controller('MapModalCtrl', MapModalCtrl)
  .filter('strReplace', function () {
    return function (input, from, to) {
      input = input || '';
      from = from || '';
      to = to || '';
      return input.replace(new RegExp(from, 'g'), to);
    };
  });

  MapModalCtrl.$inject = ['$uibModalInstance', 'mapLinksService', 'features'];
  function MapModalCtrl($uibModalInstance, mapLinksService, features) {
  	var osmBasemap = {
      name: 'OpenStreetMap',
      source: {
        type: 'OSM'
      }
    };
    var topoBaseMap = {
      name: 'Esri Maps',
      source: {
        type: 'EsriBaseMaps',
        layer: 'World_Topo_Map'
        // layer: 'World_Terrain_Base'
      }
    };
    var defaultBaseMap2 = {
      source: {
        type: 'ImageWMS',
        url: '/geoserver/tm_world/wms',
        params: {
          LAYERS: 'tm_world:TM_WORLD_BORDERS-0.3'
        }
      }
    };

    var ctrl = this;
    ctrl.showMap = false;
    ctrl.mapFeatures = [];
    if (features) {
    	ctrl.mapFeatures = features;
    }
    ctrl.mapItemSelected = null;
    ctrl.mapOptions = {
      zoom: 6,
      baseMap: topoBaseMap
    };

    ctrl.graphSearch = mapLinksService.search;
    ctrl.graphExpand = mapLinksService.expand;

    $uibModalInstance.rendered.then(function(){
    	ctrl.showMap = true;
    });

	  ctrl.modalCancel = function () {
	    $uibModalInstance.dismiss('cancel');
	  };

    ctrl.mapClicked = function(data) {
    	if (data) {
    		if (data.get('metadata')) {
	    		ctrl.mapItemSelected = data.get('metadata');
	    	}
    	}
    }
  }
}());
