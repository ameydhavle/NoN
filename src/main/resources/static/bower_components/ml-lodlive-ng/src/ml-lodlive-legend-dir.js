(function () {

  'use strict';

  angular.module('ml.lodlive')
    .directive('mlLodliveLegend', [function () {
      return {
        restrict: 'E',
        controller: 'MLLodliveLegendCtrl',
        replace: true,
        scope: {
          profile: '=',
          zooming: '='
        },
        templateUrl: '/ml-lodlive-ng/ml-lodlive-legend-dir.html'
      };
    }])
    .controller('MLLodliveLegendCtrl', ['$scope', function ($scope) {
      var model = {
        profile: $scope.profile,
        showLegend: false,
        items: [
          {
            icon: 'fa fa-list',
            title: 'Document Information'
          },
          {
            icon: 'fa fa-cog',
            title: 'Tools'
          },
          {
            icon: 'fa fa-arrows-alt',
            title: 'Expand All'
          },
          {
            icon: 'fa fa-info-circle',
            title: 'More Information'
          },
          {
            icon: 'fa fa-dot-circle-o',
            title: 'Make Root Node'
          },
          {
            icon: 'fa fa-external-link',
            title: 'Open In Another Page'
          },
          {
            icon: 'fa fa-trash-o',
            title: 'Remove the Node'
          },
          {
            icon: 'fa fa-certificate',
            title: 'Group of Related Items'
          },
          {
            icon: 'fa fa-circle',
            title: 'Related Item'
          }
        ],
        relationships: []
      };

      function initRelationships() {
        // The MarkLogic Lodlive profile is in global scope.
        if (model.profile.UI && model.profile.UI.relationships) {
          var rels = model.profile.UI.relationships;

          for (var p in rels) {
            if (rels.hasOwnProperty(p)) {
              var title = rels[p].title || p;
              console.log(title)
              if (title.indexOf('#') > -1) {
                title = title.substring(title.lastIndexOf('#') + 1);
              }
              else if (title.indexOf('/') > -1) {
                title = title.substring(title.lastIndexOf('/') + 1);
              }

              model.relationships.push({
                icon: 'fa fa-circle',
                title: title,
                style: 'color: ' + rels[p].color
              });
            }
          }
        }
      }

      initRelationships();

      var zoom = 1.0;

      angular.extend($scope, {
        model: model,
        zoomReset: function() {
          zoom = 1.0;
          var graph = $('.lodlive-graph-context')[0];
          graph.style.transform = 'scale('+zoom+')';
        },
        zoomIn: function() {
          zoom = zoom + 0.1;
          var graph = $('.lodlive-graph-context')[0];
          graph.style.transform = 'scale('+zoom+')';
        },
        zoomOut: function() {
          zoom = zoom - 0.1;
          var graph = $('.lodlive-graph-context')[0];
          graph.style.transform = 'scale('+zoom+')';
        }
      });
    }]);

}());
