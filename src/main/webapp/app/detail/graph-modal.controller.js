(function () {
  'use strict';
  angular.module('app.detail')
  .controller('GraphModalCtrl', GraphModalCtrl)

  GraphModalCtrl.$inject = ['$scope', '$http', '$uibModalInstance', 'mapLinksService', 'nodeUri'];
  function GraphModalCtrl($scope, $http, $uibModalInstance, mapLinksService, nodeUri) {
  	var ctrl = this;

  	ctrl.selectedNode = null;
    ctrl.nodeUri = null;
    if (nodeUri) {
    	ctrl.nodeUri = nodeUri;
    }
    console.log(ctrl)
    ctrl.graphOptions = {
    	groups: {
        'inNetwork': {
        	image: 'images/org.png',
          color: {
          	background: 'blue'
          }
        },
        'outNetwork': {
        	image: 'images/org.png',
          color: {
          	background: 'red'
          }
        }
      },
    };

    ctrl.nodeClicked = function(data) {
    	if (data && data.nodes && data.nodes.length > 0) {
	    	$http.get('/v1/resources/merchant-summary?rs:subject=' + encodeURIComponent(data.nodes[0]))
		    	.then(function(response) {
		    		if (response && response.data) {
		    			ctrl.selectedNode = response.data;
		    		}
		      });
	    }
	    else {
	    	ctrl.selectedNode = null;
	    }

	    $scope.$apply();
    };

    ctrl.myGraphEvents = {
		  click: ctrl.nodeClicked
		};

    ctrl.graphSearch = mapLinksService.search;
    ctrl.graphExpand = mapLinksService.expand;



	  ctrl.modalCancel = function () {
	    $uibModalInstance.dismiss('cancel');
	  };
  }
}());
