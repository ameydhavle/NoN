(function () {
  'use strict';
  angular.module('app.detail')
    .controller('DetailCtrl', DetailCtrl)
    .filter('strReplace', function () {
      return function (input, from, to) {
        input = input || '';
        from = from || '';
        to = to || '';
        return input.replace(new RegExp(from, 'g'), to);
      };
    });

  DetailCtrl.$inject = ['$scope', 'doc', '$stateParams','MLRest','MLLodliveProfileFactory', 'mapLinksService', '$uibModal', '$document'];
  function DetailCtrl($scope, doc, $stateParams, mlRest, factory, mapLinksService, $uibModal, $document) {
    var osmBasemap = {
      name: 'OpenStreetMap',
      source: {
        type: 'OSM'
      }
    };
		console.log(doc.data.envelope.content.CDT_NAME1);
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

    var x2js = new X2JS();
    ctrl.entityType ='';
    ctrl.contentType = '';
    ctrl.enableRedaction = true;
    ctrl.isCustomer = false;
    ctrl.isMerchant = false;
    ctrl.deposits = 0;
    ctrl.ccTransactions = 0;
    ctrl.depositTransactions = 0;
    ctrl.spend = 0;
    ctrl.spends = [];
    ctrl.spend = 0;
    ctrl.deposits = 0;
    ctrl.merchantSummary = null;
    //Fuzzy match on stuff like Rent / Mortgage / Car / Schools etc
    ctrl.paySchool = false;
    ctrl.payMortgage = false;
    ctrl.payRent = false;
    ctrl.payCar = false;
    ctrl.payMaternity = false;
    ctrl.payTravel = false;
    ctrl.tradingAccount = false;
    ctrl.trading = ['Broker', 'Margin', 'Leverage', 'Shares', 'Trading'];
    ctrl.childrens = ['School', 'Tuition', 'College', 'DayCare'];
    ctrl.mortgage = ['Mortgage', 'Realtor', 'Pre-Approval', 'Refinance']
    ctrl.maternity = ['Prenatal', 'Pregnancy', '529', 'Maternity']
    ctrl.renter = ['Rent', 'rent']
    ctrl.nodeUri = doc.data.envelope.content.CDT_NAME1;
    ctrl.showMap = true;
    ctrl.showGraph = false;

    ctrl.mapFeatures = [];
    ctrl.mapOptions = {
      zoom: 6,
      baseMap: topoBaseMap
    };
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
    console.log("heere")
    var uri = $stateParams.uri;
    ctrl.graphSearch = mapLinksService.search;
    ctrl.graphExpand = mapLinksService.expand;
    ctrl.contentType = doc.headers('content-type');
    try{
      switch(ctrl.contentType.substring(0,ctrl.contentType.indexOf(';'))) {
        case 'application/json':
          console.log("json", doc);

          //ctrl.xml = vkbeautify.xml(x2js.json2xml_str(doc.data));
          ctrl.json = doc.data;
					console.log(ctrl.json)
          break;
        case 'application/xml':
          if(ctrl.enableRedaction){
            mlRest.extension('redaction?format=json&rs:uri=' + uri, {method: 'GET'}).then(function (response) {
              ctrl.xml = response.data;
              ctrl.json = x2js.xml_str2json(response.data);
              ctrl.render();
              ctrl.processLocationData(ctrl.json);
              console.log(ctrl.json)
              if (ctrl.isMerchant) {
              	ctrl.getMerchantSummary(ctrl.json.envelope.content.Company_Name);
              }
            })
          }else{
            ctrl.xml = doc.data;
            ctrl.json = x2js.xml_str2json(doc.data);
          }
          break;
        case 'text/plain':
          console.log("text")
          break;
        default:
      }

    }catch(e){

    }



    var settingsGET = {
      method: 'GET'
    };

    function containsAny(str, substrings) {
      for (var i = 0; i != substrings.length; i++) {
        var substring = substrings[i];
        if (str.indexOf(substring) != -1) {
          return substring;
        }
      }
      return null;
    }

    function traverse(o, container) {
      var type = typeof o
      if (type == "object") {
        for (var key in o) {
          var rssFeed = false;
          try {
            if (key == '_isPermaLink') {
              rssFeed = true
            }
            if (key == '__text') {
              continue;
            }
            if (key == 'link') {
              $("#" + container).append("<tr><td colspan='2'><a href='" + o[key] + "' target='_blank'>" + o[key] + "</a></td></tr>")
              continue;
            }
            if (key == '__prefix' || key == '_xmlns:sem' || key == '_xmlns:dc'
              || key == '_xmlns:dc' || key == '_xmlns:content' || key == '_xmlns:atom'
              || key == '_xmlns:media' || key == '_width' || key == '_height'
              || key == '_url' || key == '_isPermaLink' || key == '_height') {
              continue;
              console.log("skip that")
            }
            if (key == '__text' & o._isPermaLink == 'true') {
              continue;
            }
            /*if(key == '__text' & !o._isPermaLink  ){
             ctrl.triples = true;
             $("#triples" ).append("<tr><td colspan='2'><span class='label label-pill label-info '>Triple</span> "+ o[key]+"</td><td colspan='2'><span class='label label-pill label-info '>Triple</span> "+ o[key]+"</td></tr>")
             continue;
             }*/
            if (typeof o[key] != "object" && o[key].toString().length > 0) {
              if (o[key].indexOf("NAME@") > -1 || o[key].indexOf("XXX-") > -1 || o[key].indexOf("###") > -1) {
                $("#" + container).append("<tr><td>" + key + "</td><td >" + o[key] + "  <span class='label label-pill label-danger'>Redacted</span></td></tr>")
              } else {
                $("#" + container).append("<tr><td>" + key + "</td><td>" + o[key] + "</td></tr>")
              }
            }
          } catch (e) {

          }
          traverse(o[key], container)
        }
      }
    }

    ctrl.render = function(){
      if (containsAny(uri, ['.docx', '.pdf', '.pptx', '.xlsx']) == null) {
        traverse(ctrl.json, "content")
      } else {
        console.log(ctrl.type)
        ctrl.type = 'binary'
        ctrl.xml = doc.data;
        ctrl.json = x2js.xml_str2json(doc.data);
        console.log(ctrl.json)
        ctrl.binaryUri = uri.substr(0, uri.lastIndexOf('.')).replace('/artifact/', '')
        console.log($(doc.data).find('body'))
        $("#content").html(doc.data)
      }

      if(ctrl.type !== 'binary' && ctrl.json.envelope !== undefined && ctrl.json !== null){
        ctrl.entityType = ctrl.json.envelope.headers.collection.toString();
        if( ctrl.entityType.toString().indexOf('entities') > -1 ||
        	ctrl.entityType.toString().indexOf('customers') > -1)
        {
          ctrl.isCustomer = true;
        }

        if( ctrl.entityType.toString().indexOf('merchants') > -1) {
          ctrl.isMerchant = true;
        }

        if(ctrl.entityType === 'customers'){
          for (var i = 0; i <= ctrl.json.envelope.metadata['transaction-data'].record.length; i++) {
            var transaction_type =(ctrl.json.envelope.metadata['transaction-data'].record[i] == undefined
                                || ctrl.json.envelope.metadata['transaction-data'].record[i].Service_Area == undefined)
                                ?'NA'
                                :ctrl.json.envelope.metadata['transaction-data'].record[i].Service_Area;
            if (transaction_type === 'Credit Card Swipe') {
              ctrl.spends.push(ctrl.json.envelope.metadata['transaction-data'].record[i].Creditor.Spending_Category)
              ctrl.spend = parseInt(ctrl.spend) + parseInt(ctrl.json.envelope.metadata['transaction-data'].record[i].Amount)
              ctrl.ccTransactions = parseInt(ctrl.ccTransactions) + 1
            }
            else if (transaction_type === 'Cash Deposits') {
              ctrl.deposits = parseInt(ctrl.deposits) + parseInt(ctrl.json.envelope.metadata['transaction-data'].record[i].Amount)
              ctrl.depositTransactions = parseInt(ctrl.depositTransactions) + 1
            }
          }
        }
        if(ctrl.entityType === 'merchants'){
          var beneficiary = '';
          for (var i = 0; i <= ctrl.json.envelope.metadata['transaction-data'].record.length; i++) {
            beneficiary = (ctrl.json.envelope.metadata['transaction-data'].record[i] == undefined || ctrl.json.envelope.metadata['transaction-data'].record[i].message == undefined) ?'NA':ctrl.json.envelope.metadata['transaction-data'].record[i].message.Beneficiary.Beneficiary_Name
            if(beneficiary !== 'NA' && beneficiary.length > 1 && beneficiary !== ctrl.json.envelope.content.Company_Name) {
              ctrl.spend = parseInt(ctrl.spend) + parseInt(ctrl.json.envelope.metadata['transaction-data'].record[i].message.Amount)
              ctrl.ccTransactions = parseInt(ctrl.ccTransactions) + 1
            }
            else if(beneficiary.length > 1 === ctrl.json.envelope.content.Company_Name){
              ctrl.deposits = parseInt(ctrl.deposits) + parseInt(ctrl.json.envelope.metadata['transaction-data'].record[i].message.Amount)
              ctrl.depositTransactions = parseInt(ctrl.depositTransactions) + 1
            }
          }
        }

        if(ctrl.json.envelope.triples.triple !== undefined){
          ctrl.triples = true;
        }else{
          ctrl.triples = false;
        }
        if(ctrl.triples){
          for (var k = 0; k < ctrl.json.envelope.triples.triple.length; k++) {
              $("#triples").append("<tr><td>" + ctrl.json.envelope.triples.triple[k].subject.__text + "</td>" +
                "<td >" + ctrl.json.envelope.triples.triple[k].predicate.__text + "</td>" +
                "<td >" + ctrl.json.envelope.triples.triple[k]['object'].__text + "</td></tr>")
          }
          ctrl.iri = ctrl.json.envelope.triples.triple[0].subject.__text;
          ctrl.profile = factory.profile('marklogic');
          ctrl.profile.relationships = {
            'http://marklogic.com/isClassifiedAs': {
              color: '#FA7F05',
              title: 'isClassifiedAs'
            },
            'http://marklogic.com/hasBankAccount': {
              color: 'yellow',
              title: 'hasBankAccount'
            },
            'http://marklogic.com/hasCreditCard': {
              color: 'green',
              title: 'hasCreditCard'
            }
          }
        }
      }
    }

    ctrl.openMapModal = function (parentSelector) {
      var parentElem = parentSelector ?
        angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
      var modalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'app/detail/modal-map.html',
        controller: 'MapModalCtrl',
        controllerAs: 'ctrl',
        size: 'custom',
        appendTo: parentElem,
        resolve: {
          features: function() {
            return ctrl.mapFeatures;
          }
        }
      });
    };

    ctrl.openGraphModal = function (type, parentSelector) {
      var parentElem = parentSelector ?
        angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
      var ctrlName = 'GraphModalCtrl';
      var uri = ctrl.nodeUri;

      if ('customer' === type) {
      	ctrlName = 'GraphDataModalCtrl';
      	uri = ctrl.nodeUri;
      }

      var modalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'app/detail/modal-graph.html',
        controller: ctrlName,
        controllerAs: 'ctrl',
        size: 'custom',
        appendTo: parentElem,
        resolve: {
          nodeUri: function() {
            return uri;
          }
        }
      });
    };

    ctrl.getMerchantSummary = function (merchant) {
    	console.log("hi")
    	mlRest.extension('merchant-summary?rs:subject=' + merchant, {method: 'GET'}).then(function (response) {
        ctrl.merchantSummary = response.data;
      })
    };

    ctrl.processLocationData = function (data) {
      if (ctrl.type!=='binary' &&  data.envelope && data.envelope.metadata && data.envelope.metadata['geo-data']) {
        var geo = data.envelope.metadata['geo-data'];
        var name = '';
        var uri = ctrl.uri;
        if (data.envelope.headers && data.envelope.headers.first_name) {
          name = data.envelope.headers.first_name + data.envelope.headers.last_name;
        }
        else if (data.envelope.content && data.envelope.content.Company_Name) {
          name = data.envelope.content.Company_Name;
        }

        if (data.envelope.triples && data.envelope.triples.triple ) {
          uri = data.envelope.triples.triple[0].subject.__text;
        }

        ctrl.nodeUri = name;
        if (geo.Lat && geo.Long) {
          var tmpFeatures = [];
          tmpFeatures.push({
            type: 'Feature',
            properties: {
              id: name,
              name: name,
              uri: name
            },
            geometry: {
              type: 'Point',
              coordinates: [
                parseFloat(geo.Long),
                parseFloat(geo.Lat)
              ]
            }
          });

          ctrl.mapFeatures = tmpFeatures;
        }
      }
    };


    angular.extend(ctrl, {
      doc : doc.data,
      uri : uri
    });
  }
}());
