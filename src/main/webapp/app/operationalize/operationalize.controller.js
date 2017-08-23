/* global MLSearchController */
(function () {
  'use strict';

  angular.module('app.operationalize',['ml.highcharts'])
    .controller('OperationalizeCtrl', OperationalizeCtrl);

  OperationalizeCtrl.$inject = ['$scope', '$location', 'userService', 'MLSearchFactory','HighchartsHelper'];


  // inherit from MLSearchController
  var superCtrl = MLSearchController.prototype;
  OperationalizeCtrl.prototype = Object.create(superCtrl);

  function OperationalizeCtrl($scope, $location, userService, searchFactory,HighchartsHelper) {
    var ctrl = this;

    var mlSearch = searchFactory.newContext();

		ctrl.myFacets = {};

    superCtrl.constructor.call(ctrl, $scope, $location, mlSearch);

    ctrl.init();

    ctrl.updateSearchResults = function (data) {
      superCtrl.updateSearchResults.apply(ctrl, arguments);
		};

    ctrl.setSnippet = function(type) {
      mlSearch.setSnippet(type);
      ctrl.search();
    };

    ctrl.search = function(qtext) {
			if ( arguments.length ) {
				this.qtext = qtext;
			}
			this.mlSearch.setText( this.qtext ).setPage( this.page );
			return this._search();
		};

		ctrl.myFacets = ctrl.response.facets

    function updateCloud(data) {
      if (data && data.facets && data.facets.keyword) {
        console.log("cloud", data)

        var facet = data.facets.keyword;
        ctrl.keywords = [];
        var activeFacets = [];

        // find all selected facet values..
        angular.forEach(ctrl.mlSearch.getActiveFacets(), function(facet, key) {
          angular.forEach(facet.values, function(value, index) {
            activeFacets.push((value.value+'').toLowerCase());
          });
        });

        angular.forEach(facet.facetValues, function(value, index) {
          var q = (ctrl.qtext || '').toLowerCase();
          var val = value.name.toLowerCase();

          // suppress search terms, and selected facet values from the D3 cloud..
          if (q.indexOf(val) < 0 && activeFacets.indexOf(val) < 0) {
            ctrl.keywords.push({name: value.name, score: value.count});
          }
        });
        console.log(ctrl.keywords)
      }
      ctrl.keywords=['test','test','test','test','test','test','test','test','test','test','rrrr','rrrr','rrrr','rrrr','rrrr','rrrr']
    }

  function top10Chart(title, type, xFacet, xLabel, limit) {
    return {
      options: {
        chart: {
          type: type,
          zoomType: 'xy'
        },
        tooltip: {
          style: {
            padding: 10,
            fontWeight: 'bold'
          },
          shared: true,
          crosshairs: true,
          headerFormat: '<b>{series.name}</b><br/>',
          pointFormatter: function() {
            return (this.xCategory || this.x) + ': <b>' + (this.yCategory || this.y) + '</b><br/>';
          }
        },
        legend: {
          enabled: false
        }
      },
      title: {
        text: title
      },
      xAxis: {
        title: {
          text: xLabel
        },
        labels: (type !== 'bar' ? {
          rotation: -45
        } : {})
      },
      // constraint name for x axis
      //xAxisMLConstraint: xFacet,
      // optional constraint name for categorizing x axis values
      xAxisCategoriesMLConstraint: xFacet,
      yAxis: {
        title: {
          text: 'Frequency'
        }
      },
      // constraint name for y axis ($frequency is special value for value/tuple frequency)
      yAxisMLConstraint: '$frequency',
      zAxis: {
        title: {
          text: null
        }
      },
      // limit of returned results
      resultLimit: limit || 10,
      credits: {
        enabled: true
      }
    };
  }

  function cooccurrenceChart(title, type, xFacet, xLabel, yFacet, yLabel, limit) {
    return {
      options: {
        chart: {
          type: type,
          zoomType: 'xy'
        },
        tooltip: {
          style: {
            padding: 10,
            fontWeight: 'bold'
          },
          shared: true,
          crosshairs: true,
          headerFormat: '<b>{point.x}</b><br/>',
          pointFormatter: function() {
            return this.series.yAxis.categories[this.y] + ': <b>' + this.z + '</b><br/>';
          }
        },
        plotOptions: {
          bubble: {
            softThreshold: true
          }
        },
        legend: {
          enabled: true
        }
      },
      title: {
        text: title
      },
      xAxis: {
        startOnTick: false,
        endOnTick: false,
        title: {
          text: xLabel
        },
        labels: {
          rotation: -45
        }
      },
      // constraint name for x axis
      //xAxisMLConstraint: xFacet,
      // optional constraint name for categorizing x axis values
      xAxisCategoriesMLConstraint: xFacet,
      yAxis: {
        startOnTick: false,
        endOnTick: false,
        title: {
          text: yLabel
        }
      },
      // constraint name for y axis ($frequency is special value for value/tuple frequency)
      //yAxisMLConstraint: yFacet,
      seriesNameMLConstraint: yFacet,
      yAxisCategoriesMLConstraint: yFacet,
      zAxis: {
        title: {
          text: 'Frequency'
        }
      },
      zAxisMLConstraint: '$frequency',
      // limit of returned results
      resultLimit: limit || 30,
      credits: {
        enabled: true
      }
    };
  }

    angular.extend(ctrl, {

      ownerChart: top10Chart('State wise distributions', 'column', 'State', 'State'),
      typeChart: top10Chart('City wise distributions', 'pie', 'City', 'City'),
      languageChart: top10Chart('Data collections', 'bar', 'Collection', 'Collection'),
      ownerLanguageChart: cooccurrenceChart('Co-occurences', 'bubble', 'Zip', 'Zip', 'State', 'State'),
      keywords: [],
      noRotate: function(word) {
        return 0;
      },
      cloudEvents: {
        'dblclick': function(tag) {
          // stop propagation
          d3.event.stopPropagation();

          // undo default behavior of browsers to select at dblclick
          var body = document.getElementsByTagName('body')[0];
          window.getSelection().collapse(body,0);

          // custom behavior, for instance search on dblclick
          var qtext = ctrl.mlSearch.getText();
          ctrl.search((qtext ? qtext + ' ' : '') + tag.text.toLowerCase());
        }
      }
    });

		ctrl.toggleMapSearch = function (){
			if(ctrl.runMapSearch) {
				mlSearch.additionalQueries.push(ctrl.getGeoConstraint());
			}
			else {
				mlSearch.additionalQueries.pop(ctrl.getGeoConstraint());
			}
			this._search();
		};

    $scope.$watch('ctrl.response', function(newVal) {
      if (newVal && !angular.equals({}, newVal)) {
        updateCloud(newVal);
      }
    }, true);

    $scope.$watch(userService.currentUser, function(newValue) {
      ctrl.currentUser = newValue;
    });
  }
}());
