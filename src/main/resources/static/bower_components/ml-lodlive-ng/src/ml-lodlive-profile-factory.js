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
          'http://marklogic.com/hasCreditCard': 'isPartOf',
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
            'http://marklogic.com/isClassifiedAs': {
              color: 'Orange',
              title: 'isClassifiedAs'
            },
            'http://ieee.org/concept/hasAffiliation': {
              color: 'yellow',
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
