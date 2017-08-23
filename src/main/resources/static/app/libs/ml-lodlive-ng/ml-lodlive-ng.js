angular.module('ml.lodlive', ['ml.lodlive.tpls']);

(function () {
  'use strict';

  angular.module('ml.lodlive')
    .directive('mlLodlive', [function () {
      return {
        restrict: 'E',
        replace: true,
        scope: {
          iri: '=',
          profile: '=',
          zooming: '@'
        },
        template: '<div class="ml-lodlive"><ml-lodlive-legend profile="profile" zooming="zooming"></ml-lodlive-legend></div>',
        link: function($scope, $elem, $attrs) {

          $scope.$watch('iri', function(newVal, oldVal) {
            if (newVal) {
              angular.element($elem).lodlive({ profile: $scope.profile, firstUri: newVal, ignoreBnodes: true });
            }
          });

        },
      };
    }]);

}());

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
        if (model && model.profile && model.profile.UI && model.profile.UI.relationships) {
          var rels = model.profile.UI.relationships;

          for (var p in rels) {
            if (rels.hasOwnProperty(p)) {
              var title = rels[p].title || p;
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

(function() {
  'use strict';

  angular.module('ml.lodlive')
    .factory('MLLodliveProfileFactory', [
      function() {
        var DBPediaProfile = {};

        // LodLive will match connection by the base URL of the query used, so the key must match the URL
        DBPediaProfile.connection = {
          // http matches all http requests, so this will be the only connection settings used
          'http:': {
            description: {
              it: 'DBpedia is a community effort to extract structured information from Wikipedia and to make this information available on the Web. DBpedia allows you to ask sophisticated queries against Wikipedia, and to link other data sets on the Web to Wikipedia data.',
              en: 'DBpedia is a community effort to extract structured information from Wikipedia and to make this information available on the Web. DBpedia allows you to ask sophisticated queries against Wikipedia, and to link other data sets on the Web to Wikipedia data.'
            },
            sparql: {
              allClasses: 'SELECT DISTINCT ?object  WHERE {[] a ?object} ORDER BY ?object  LIMIT 50  ',
              findSubject: 'SELECT DISTINCT ?subject WHERE { {?subject a <{CLASS}>;<http://purl.org/dc/elements/1.1/title> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} UNION {?subject a <{CLASS}>;<http://www.w3.org/2000/01/rdf-schema#label> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} UNION {?subject a <{CLASS}>;<http://www.w3.org/2004/02/skos/core#prefLabel> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} } LIMIT 1',
              documentUri: 'SELECT DISTINCT * WHERE {<{URI}> ?property ?object.FILTER ((( isIRI(?object) && ?property != <http://xmlns.com/foaf/0.1/depiction> )|| ?property = <http://www.w3.org/2000/01/rdf-schema#label>  || ?property = <http://www.georss.org/georss/point> || ?property = <http://xmlns.com/foaf/0.1/surname> || ?property = <http://xmlns.com/foaf/0.1/name> || ?property = <http://purl.org/dc/elements/1.1/title>))}  ORDER BY ?property',
              document: 'SELECT DISTINCT *  WHERE  {{<{URI}> ?property ?object. FILTER(!isLiteral(?object))} UNION    {<{URI}> ?property    ?object.FILTER(isLiteral(?object)).FILTER(lang(?object) ="it")} UNION   {<{URI}> ?property    ?object.FILTER(isLiteral(?object)).FILTER(lang(?object) ="en")}}  ORDER BY ?property',
              bnode: 'SELECT DISTINCT *  WHERE {<{URI}> ?property ?object}',
              inverse: 'SELECT DISTINCT * WHERE {?object ?property <{URI}> FILTER(REGEX(STR(?object),\'//dbpedia.org\'))} LIMIT 100',
              inverseSameAs: 'SELECT DISTINCT * WHERE {?object <http://www.w3.org/2002/07/owl#sameAs> <{URI}> FILTER(REGEX(STR(?object),\'//dbpedia.org\'))}'
            },
            useForInverseSameAs: true,
            endpoint: 'http://dbpedia.org/sparql',
          }
        };

        // here we define the known relationships so that labels will appear
        DBPediaProfile.arrows = {
          'http://www.w3.org/2002/07/owl#sameAs': 'isSameAs',
          'http://purl.org/dc/terms/isPartOf': 'isPartOf',
          'http://purl.org/dc/elements/1.1/type': 'isType',
          'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'isType'
        };

        // this is the default data configuration, this is important.  It informs LodLive how to construct queries and how to read the data that comes back
        DBPediaProfile.
        default = {
          sparql: {
            allClasses: 'SELECT DISTINCT ?object WHERE {[] a ?object}',
            findSubject: 'SELECT DISTINCT ?subject WHERE { {?subject a <{CLASS}>;<http://purl.org/dc/elements/1.1/title> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} UNION {?subject a <{CLASS}>;<http://www.w3.org/2000/01/rdf-schema#label> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} UNION {?subject a <{CLASS}>;<http://www.w3.org/2004/02/skos/core#prefLabel> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} }  LIMIT 1  ',
            documentUri: 'SELECT DISTINCT * WHERE {<{URI}> ?property ?object} ORDER BY ?property',
            document: 'SELECT DISTINCT * WHERE {<{URI}> ?property ?object}',
            bnode: 'SELECT DISTINCT *  WHERE {<{URI}> ?property ?object}',
            inverse: 'SELECT DISTINCT * WHERE {?object ?property <{URI}>.} LIMIT 100',
            inverseSameAs: 'SELECT DISTINCT * WHERE {{?object <http://www.w3.org/2002/07/owl#sameAs> <{URI}> } UNION { ?object <http://www.w3.org/2004/02/skos/core#exactMatch> <{URI}>}}'
          },
          endpoint: 'http://labs.regesta.com/resourceProxy/',
          document: {
            className: 'standard',
            titleName: 'none',
            titleProperties: ['http://xmlns.com/foaf/0.1/name']
          }, // http://www.w3.org/2000/01/rdf-schema#label
        };

        DBPediaProfile.UI = {
          ignoreBnodes: true,
          nodeIcons: [{
            builtin: 'tools'
          }, {
            builtin: 'docInfo'
          }, {
            icon: 'fa fa-refresh',
            title: 'Randomize node color',
            handler: function(node, inst) {
              // http://www.paulirish.com/2009/random-hex-color-code-snippets/
              var nextColor = '#' + Math.floor(Math.random() * 16777216).toString(16);
              node.find('.lodlive-node-label').css('backgroundColor', nextColor);
            }
          }],
          tools: [{
            builtin: 'remove'
          }, {
            builtin: 'rootNode'
          }, {
            builtin: 'expand'
          }],
          // docInfo: function() {},
          nodeHover: function() {},
          relationships: {
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': {
              color: '#000'
            },
            'http://www.w3.org/2004/02/skos/core#broader': {
              color: '#69C'
            },
            'http://www.w3.org/2004/02/skos/core#related': {
              color: '#FFF444'
            }
          }
        };

        DBPediaProfile.endpoints = {
          all: 'output=json&format=json&timeout=0',
          jsonp: true
        };

        var MarkLogicProfile = {};

        // LodLive will match connection by the base URL of the query used, so the key must match the URL
        MarkLogicProfile.connection = {
          // http matches all http requests, so this will be the only connection settings used
          'http:': {
            endpoint: '/v1/graphs/sparql',
            accepts: 'application/sparql-results+json',
            description: {
              en: 'MarkLogic LodLive'
            }
          }
        };

        // here we define the known relationships so that labels will appear
        MarkLogicProfile.arrows = {
          'http://www.w3.org/2002/07/owl#sameAs': 'isSameAs',
          'http://purl.org/dc/terms/isPartOf': 'isPartOf',
          'http://purl.org/dc/elements/1.1/type': 'isType',
          'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'isType',
          'http://ieee.org/concept/coContrib': 'Contributor To',
          'http://ieee.org/concept/hasAffiliation': 'Has Affiliation',
        };

        // this is the default data configuration, this is important.  It informs LodLive how to construct queries and how to read the data that comes back
        MarkLogicProfile.
        default = {
          sparql: {
            allClasses: 'SELECT DISTINCT ?object WHERE {[] < ?object}',
            findSubject: 'SELECT DISTINCT ?subject WHERE { {?subject a <{CLASS}>;<http://purl.org/dc/elements/1.1/title> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} UNION {?subject a <{CLASS}>;<http://www.w3.org/2000/01/rdf-schema#label> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} UNION {?subject a <{CLASS}>;<http://www.w3.org/2004/02/skos/core#prefLabel> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} UNION {?subject a <{CLASS}>; <http://xmlns.com/foaf/0.1/name> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} }  LIMIT 1 ',
            documentUri: 'SELECT DISTINCT * WHERE {<{URI}> ?property ?object} ORDER BY ?property',
            document: 'SELECT DISTINCT * WHERE {<{URI}> ?property ?object}',
            bnode: 'SELECT DISTINCT *  WHERE {<{URI}> ?property ?object}',
            inverse: 'SELECT DISTINCT * WHERE {?object ?property <{URI}>.} LIMIT 100',
            inverseSameAs: 'SELECT DISTINCT * WHERE {{?object <http://www.w3.org/2002/07/owl#sameAs> <{URI}> } UNION { ?object <http://www.w3.org/2004/02/skos/core#exactMatch> <{URI}>}}'
          },
          document: {
            className: 'standard',
            titleProperties: [
              'http://www.w3.org/2004/02/skos/core#prefLabel',
              'http://xmlns.com/foaf/0.1/name',
              'http://purl.org/dc/elements/1.1/title',
              'http://www.w3.org/2000/01/rdf-schema#label',
              'http://purl.org/dc/terms/title'
            ]
          }, // http://www.w3.org/2000/01/rdf-schema#label
        };

        MarkLogicProfile.UI = {
          ignoreBnodes: false,
          nodeIcons: [{
            builtin: 'tools'
          }, {
            builtin: 'docInfo'
          }],
          tools: [{
            builtin: 'remove'
          }, {
            builtin: 'rootNode'
          }, {
            builtin: 'expand'
          }],
          // docInfo: function() {},
          nodeHover: function() {},
          relationships: {
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': {
              color: '#000',
              title: 'rdf:type'
            },
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#instance': {
              color: '#000',
              title: 'rdf:instance'
            },
            'http://www.w3.org/2004/02/skos/core#broader': {
              color: '#69C',
              title: 'skos:broader'
            },
            'http://www.w3.org/2004/02/skos/core#narrower': {
              color: '#69C',
              title: 'skos:narrower'
            },
            'http://www.w3.org/2004/02/skos/core#related': {
              color: '#69C',
              title: 'skos:related'
            },
            'http://www.w3.org/2002/07/owl#imports': {
              color: '#FA0527',
              title: 'owl:imports'
            },
            'http://www.w3.org/2002/07/owl#sameAs': {
              color: '#FA0527',
              title: 'owl:sameAs'
            },
            'http://www.w3.org/2000/01/rdf-schema#subClassOf': {
              color: '#FA7F05',
              title: 'rdfs:subClassOf'
            },
            'http://www.w3.org/2000/01/rdf-schema#isDefinedBy': {
              color: '#FA7F05',
              title: 'rdfs:isDefinedBy'
            },
            'http://ieee.org/concept/hasAffiliation': {
              color: '#588F27',
              title: 'ieee:hasAffiliation'
            },
            'http://purl.org/dc/elements/1.1/contributor': {
              color: '#04756F',
              title: 'dc:contributor'
            }
          }
        };

        MarkLogicProfile.endpoints = {
          all: '',
          jsonp: false
        };

        return {
          profile: function(type) {
            if (type === 'dbpedia') {
              return DBPediaProfile;
            } else {
              return MarkLogicProfile;
            }
          }
        };
      }
    ]);

}());

(function(module) {
try {
  module = angular.module('ml.lodlive.tpls');
} catch (e) {
  module = angular.module('ml.lodlive.tpls', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/ml-lodlive-ng/ml-lodlive-legend-dir.html',
    '<div class="ml-lodlive-toolbar"><div class="ml-lodlive-legend-toggle"><button class="btn btn-xs ml-lodlive-toolbar-button" ng-click="model.showLegend = !model.showLegend"><i class="glyphicon glyphicon-info-sign"></i></button></div><div class="ml-lodlive-legend-display" ng-if="model.showLegend"><h4>Legend</h4><div ng-repeat="item in model.items"><span class="{{item.icon}}"></span> {{item.title}}</div><h5>Relationships</h5><div ng-repeat="rel in model.relationships | orderBy:\'title\' track by $index"><span class="{{rel.icon}}" style="{{rel.style}}"></span> {{rel.title}}</div><div><span class="fa fa-circle" style="color: #369;"></span> other</div></div><div class="ml-lodlive-zooming" ng-if="zooming"><div><button class="btn btn-xs ml-lodlive-toolbar-button" ng-click="zoomIn()"><i class="glyphicon glyphicon-zoom-in"></i></button></div><div><button class="btn btn-xs ml-lodlive-toolbar-button" ng-click="zoomOut()"><i class="glyphicon glyphicon-zoom-out"></i></button></div><div><button class="btn btn-xs ml-lodlive-toolbar-button" ng-click="zoomReset()"><i class="glyphicon glyphicon-refresh"></i></button></div></div></div>');
}]);
})();
