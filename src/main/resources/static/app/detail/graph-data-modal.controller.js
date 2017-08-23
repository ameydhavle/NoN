(function () {
  'use strict';
  angular.module('app.detail')
  .controller('GraphDataModalCtrl', GraphDataModalCtrl)

  GraphDataModalCtrl.$inject = ['$uibModalInstance', 'dataLinksService', 'nodeUri'];
  function GraphDataModalCtrl($uibModalInstance, dataLinksService, nodeUri) {
  	var ctrl = this;

    ctrl.nodeUri = null;
    if (nodeUri) {
    	ctrl.nodeUri = nodeUri;
    }
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
    }

    ctrl.graphSearch = dataLinksService.search;
    ctrl.graphExpand = dataLinksService.expand;

	  ctrl.modalCancel = function () {
	    $uibModalInstance.dismiss('cancel');
	  };
  }
}());
