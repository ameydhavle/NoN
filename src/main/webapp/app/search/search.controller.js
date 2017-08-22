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
    $(function(){
      $('.panel').lobiPanel({
      });
    });
    $(".row").sortable({
      axis: "x",
      items: ".column"
    });
    $(".container").sortable({
      axis: "y",
      items: ".row",
      placeholder: 'block-placeholder',
      revert: 150,
      start: function(e, ui) {

        var placeholderHeight = ui.item.outerHeight();
        ui.placeholder.height(placeholderHeight + 15);
        $('<div class="block-placeholder-animator" data-height="' + placeholderHeight + '"></div>').insertAfter(ui.placeholder);

      },
      change: function(event, ui) {

        ui.placeholder.stop().height(0).animate({
          height: ui.item.outerHeight() + 15
        }, 300);

        var placeholderAnimatorHeight = parseInt($(".block-placeholder-animator").attr("data-height"));

        $(".block-placeholder-animator").stop().height(placeholderAnimatorHeight + 15).animate({
          height: 0
        }, 300, function() {
          $(this).remove();
          var placeholderHeight = ui.item.outerHeight();
          $('<div class="block-placeholder-animator" data-height="' + placeholderHeight + '"></div>').insertAfter(ui.placeholder);
        });

      },
      stop: function(e, ui) {

        $(".block-placeholder-animator").remove();

      },
    });

// Block Controls
    $(".blocks").sortable({
      connectWith: '.blocks',
      placeholder: 'block-placeholder',
      revert: 150,
      start: function(e, ui) {

        var  placeholderHeight = ui.item.outerHeight();
        ui.placeholder.height(placeholderHeight + 15);
        $('<div class="block-placeholder-animator" data-height="' + placeholderHeight + '"></div>').insertAfter(ui.placeholder);

      },
      change: function(event, ui) {

        ui.placeholder.stop().height(0).animate({
          height: ui.item.outerHeight() + 15
        }, 300);

        var placeholderAnimatorHeight = parseInt($(".block-placeholder-animator").attr("data-height"));

        $(".block-placeholder-animator").stop().height(placeholderAnimatorHeight + 15).animate({
          height: 0
        }, 300, function() {
          $(this).remove();
          var placeholderHeight = ui.item.outerHeight();
          $('<div class="block-placeholder-animator" data-height="' + placeholderHeight + '"></div>').insertAfter(ui.placeholder);
        });

      },
      stop: function(e, ui) {

        $(".block-placeholder-animator").remove();

      },
    });
    $('.block-add').click(function() {
      $(this).closest('.column').find('.blocks').append('<div class="block clearfix"><div class="block-actions pull-right"><div class="remove modifier remove-block"><i class="fa fa-times"></i></div><div class="action modifier copy-block"><i class="fa fa-repeat"></i></div><div class="edit modifier edit-block"><i class="fa fa-pencil"></i></div></div></div>');
    });

// Rows
    $('.row-add').click(function() {
      $('.builder-body').append('<div class="row well sortable"><div class="col-xs-6 column well sortable"></div><div class="col-xs-6 column well sortable"></div></div>');
    });
    $.fn.extend({
      removeclasser: function(re) {
        return this.each(function() {
          var c = this.classList
          for (var i = c.length - 1; i >= 0; i--) {
            var classe = "" + c[i]
            if (classe.match(re)) c.remove(classe)
          }
        })
        return re;
      },
      translatecolumn: function(columns) {
        var grid = [];
        var items = columns.split(',');
        for (i = 0; i < items.length; ++i) {
          if (items[i] == '1') {
            grid.push(12);
          }
          if (items[i] == '2') {
            grid.push(6);
          }
          if (items[i] == '3') {
            grid.push(4);
          }
        }
        return grid;
      }
    });

// Column Controls
    $(".row-toolbar").disableSelection();

    $('.column-option').click(function() {
      var grid = $.fn.translatecolumn($(this).data('split').toString());
      var columns = $(this).closest('.row').find('.column');
      for (i = 0; i < grid.length; ++i) {
        if (columns[i]) {
          $(columns[i]).removeclasser('col-');
          $(columns[i]).addClass('col-xs-' + grid[i]);
        } else {
          // Create column with class
          $(columns[i]).append('<div class="col-xs-6 column well sortable"><div class="blocks">');
        }
        // If less columns than existing then merge
      }
    });

    var i;
    var ctrl = this;
    ctrl.isCustomer = false;
    ctrl.deposits = 0;
    ctrl.ccTransactions = 0;
    ctrl.depositTransactions = 0;
    ctrl.spend = 0
    ctrl.suggestions =[];
    //Fuzzy match on stuff like Rent / Mortgage / Car / Schools etc
    ctrl.paySchool = false;
    ctrl.payMortgage = false;
    ctrl.payRent = false;
    ctrl.payCar = false;
    ctrl.payMaternity = false;
    ctrl.payTravel = false;
    ctrl.tradingAccount = false;
    ctrl.trading =['Broker','Margin','Leverage','Shares','Trading'];
    ctrl.childrens =['School','Tuition','College','DayCare'];
    ctrl.mortgage =['Mortgage','Realtor','Pre-Approval','Refinance']
    ctrl.maternity =['Prenatal','Pregnancy','529','Maternity']
    ctrl.renter=['Rent','rent']
    ctrl.runMapSearch = false;
    ctrl.userName = userService.currentUser().name
    ctrl.mlSearch = searchFactory.newContext();
    ctrl.myFacets = {};
		ctrl.synonymMatches = [];
    ctrl.runHouseHolding = false;
    ctrl.runBulkSearch = false;
    ctrl.houseHold =[];
		ctrl.hideMap = false;
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

    ctrl.suggestAdvanced = function(qtext) {
      return $http.get('/v1/resources/extsuggest', {params: {'rs:qtext': qtext }}).then(
          function(response) {
            var results = response.data.results;
            if (results && results.length) {
              results.unshift(qtext);
            }
            return results;
          }
      );
    };


    function updateBulkSearchResults(data) {

      $scope.model.bulk.results = data.results;
      var tmpArr = []
      for(var i=0;i< $scope.model.bulk.results.length;i++){
        tmpArr.push($scope.model.bulk.results[i].metadata.Search.values.toString())
      }
      bulkSearchResults
        .setText(tmpArr.join(' OR '))
        .setPage($scope.model.bulk.page)
        .search()
        .then(updateBulkSearchResultsData);
    }

    function updateBulkSearchResultsData(data) {

      $scope.model.bulk.isSearching = false;
      $scope.model.bulk.search = data;
      $scope.model.bulk.page = bulkSearchResults.getPage();
      $scope.model.bulk.results = data.results;
      console.log($scope.model.bulk.search)
    }
    ctrl.updateSearchResults = function (data) {
      console.log(data)
      this.searchPending = false;
      if(ctrl.runHouseHolding){
      }
    	this.response = data;
    	this.page = this.mlSearch.getPage();
		};

    ctrl.setSnippet = function(type) {
      ctrl.mlSearch.setSnippet(type);
      //ctrl.search();
    };
    ctrl.bulkSearch = function(qtext){
      console.log($scope.model.bulk.page)
      var bulkSearch = searchFactory.newContext({
        queryOptions: 'bulk'
      });

      bulkSearch

        .search()
        .then(updateBulkSearchResults);

    }

		ctrl.search = function(qtext) {
    	if (ctrl.runSynonyms) {
    		var searchText = qtext ? qtext : ctrl.qtext;
    		ctrl.searchSynonyms(searchText);
    	}
      else if ( arguments.length ) {
      	var tmpQtext ='';
			  $http.get('/v1/resources/createSemanticTriples', {params: {'rs:q': qtext }}).then
        (
          function(response) {
          var queryString = ctrl.qtext + ' ';
            var tmp = [];
          $(response.data).find("same-as").each(function ()
            {

              tmp.push($(this).text())
            })
            if(tmp.length > 0){
              ctrl.qtext = ctrl.qtext + ' OR ' + tmp.join(' OR ')
              console.log(ctrl.qtext)
            }
						/*
            $http.get('/v1/resources/doubleMeta', {params: {'rs:q': ctrl.qtext }}).then(
              function(response) {
                var tmp = response.data.toString();
                ctrl.suggestions = tmp.split(",");
              })
						*/
            ctrl.startSearch( ctrl.qtext );
          }
        )
      }
      else {
        ctrl.startSearch();
      }

		};

		ctrl.searchSynonyms = function(text) {
			var params = { params: {'rs:qtext': text } };
			$http.get('/v1/resources/synonyms', params).then( function(resp) {
      	console.log(resp);
      	var searchText = text;
        if (resp.data && resp.data.matched.length > 0) {
        	ctrl.synonymMatches = resp.data.matched;
        	searchText = resp.data.fullSearchText;
      	}
      	else {
      		ctrl.synonymMatches = [];
      	}
      	ctrl.startSearch(searchText);
      });
		}

		ctrl.startSearch = function(qtext) {
			var searchText = qtext;
			if (!searchText) {
				searchText = ctrl.qtext;
			}

			ctrl.mlSearch.setText( searchText ).setPage( this.page );
      if (ctrl.runMapSearch) {
        ctrl.mlSearch.additionalQueries = [];
        ctrl.mlSearch.additionalQueries.push(ctrl.getGeoConstraint());

      }

      ctrl.mlSearch.additionalQueries.push(ctrl.getCollectionConstraint());

      return this._search();
		};

		ctrl.mapBoundsChanged = function(bounds) {
			ctrl.bounds = bounds;
			if (ctrl.runMapSearch) {
				ctrl.search();
			}
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
      }
    }
    ctrl.getCollectionConstraint = function(){
      return {
        'collection-query': {
          //'uri': [ ctrl.userName + '-customers', ctrl.userName + '-call-center' , ctrl.userName + '-documents']
          'uri': ['companies','feeds',  'documents','customers', 'panama-entities']
        }
      }
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
            headerFormat: '<b>{series.name}</b><br/>',
            pointFormatter: function() {
              return (this.xCategory || this.x) + ': <b>' + (this.yCategory || this.y) + '</b><br/>';
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
        resultLimit: limit || 10

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

      languageChart: top10Chart('Age', 'line', 'Age-Group', 'Age-Group'),
      serviceAreaChart: top10Chart('Service Area', 'bar', 'Service-Area', 'Service-Area'),
      companyTypeChart: top10Chart('Company Type', 'line', 'company_type', 'company_type'),
      companyCategoryChart: top10Chart('Company Category', 'area', 'company_category', 'company_category'),
      typeChart: top10Chart('City wise distributions', 'pie', 'City', 'City'),
      spendChart: top10Chart('Spending Categories', 'line', 'Spending_Category', 'Spending_Category'),
      tagsChart: top10Chart('Customer Classifications', 'pie', 'Tags', 'Tags')
    });

    ctrl.filterCreditor = function(val){
      if(ctrl.qtext.length < 1){
        ctrl.qtext = "'"+val+"'"
      }else{
        ctrl.qtext = ctrl.qtext + " OR '"+val+"'"
      }
      ctrl.search(ctrl.qtext)
    }

    ctrl.downloadReportUrl = function() {
      return '/ext/export-as-csv.xqy?q=' + encodeURIComponent(ctrl.qtext || '') + '&structuredQuery=' + encodeURIComponent(JSON.stringify(ctrl.mlSearch.getQuery())) + '&fields=' + encodeURIComponent((ctrl.selectedColumns || []).map(function(a) { return a.field; }).join(','));
    };

    ctrl.learnWord = function(){
      var val = ctrl.qtext
      $http.put('/v1/resources/doubleMeta?rs:q='+val)
    }

		ctrl.toggleMapSearch = function (){
			if(ctrl.runMapSearch) {
				ctrl.mlSearch.additionalQueries.push(ctrl.getGeoConstraint());
			}
			else {
				ctrl.mlSearch.additionalQueries.pop(ctrl.getGeoConstraint());
			}
			ctrl.search();
		};

		ctrl.toggleSynonyms = function() {
			if(!ctrl.runSynonyms) {
				ctrl.synonymMatches = [];
			}
			ctrl.search(ctrl.qtext);
		};
    var bulkSearchResults = searchFactory.newContext({
      queryOptions: 'all'
    });
    ctrl.toggleHouseHolding = function() {
      if(ctrl.runHouseHolding & ctrl.qtext.length > 0) {

        var first_name =[]

        var res = this.response
        for(var i=0 ; i< this.response.results.length; i++){
          $http.get('/v1/resources/createHouseHolding', {params: {'rs:subject': 'http://marklogic.com/triples/'+this.response.results[i].metadata.first_name.values.toString() + '_' + this.response.results[i].metadata.last_name.values.toString() }}).then
          (
            function(resp) {
              var queryString = ctrl.qtext ;
              var tmp = [];
              $(resp.data).find("household").each(function ()
              {

                if($(this).text().length > 1){
                  ctrl.houseHold.push($(this).text())
                  tmp.push('"'+$(this).text()+'"')
                }
              })
              if(tmp.length > 0){
                queryString =  ctrl.qtext+ ' OR ' + tmp.join(' OR ')
              }
              console.log(ctrl.houseHold)
              ctrl.startSearch( queryString );
            }
          )
        }

      }else{
        ctrl.qtext = '';
        ctrl.search(ctrl.qtext)
      }
    };
    ctrl.toggleBulkSearch = function() {
      if(ctrl.runBulkSearch) {
        var bulkSearch = searchFactory.newContext({
          queryOptions: 'bulk'
        });
        bulkSearch
          .search()
          .then(updateBulkSearchResults);
      }
    };

      $scope.$watch(userService.currentUser, function(newValue) {
      ctrl.currentUser = newValue;
    });
  }
}());
