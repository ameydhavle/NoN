(function () {
  'use strict';

  angular.module('app.idl',['shagstrom.angular-split-pane', 'treeControl'])
    .controller('IdlCtrl', IdlCtrl)
    .filter('numberFixedLen', function () {
    return function (n, len) {
      var num = parseInt(n, 10);
      len = parseInt(len, 10);
      if (isNaN(num) || isNaN(len)) {
        return n;
      }
      num = ''+num;
      while (num.length < len) {
        num = '0'+num;
      }
      return num;
    }})
    .filter('strReplace', function () {
      return function (input, from, to) {
        input = input || '';
        from = from || '';
        to = to || '';
        return input.replace(new RegExp(from, 'g'), to);
      };
    });
  ;

  IdlCtrl.$inject = ['$scope', 'MLRest', '$state', 'userService','$http', '$window','MLSearchFactory', '$location'];


  function IdlCtrl($scope, mlRest, $state, userService, $http, $window, searchFactory, $location) {
    var ctrl = this;

    var custData = searchFactory.newContext({
      queryOptions: 'customers'
    });

    var transactionsData = searchFactory.newContext({
      queryOptions: 'transactions'
    });

    var merchantsData = searchFactory.newContext({
      queryOptions: 'merchants'
    });

    var companiesData = searchFactory.newContext({
      queryOptions: 'companies'
    });

    var productsData = searchFactory.newContext({
      queryOptions: 'products'
    });

    var documentsData = searchFactory.newContext({
      queryOptions: 'documents'
    });

    var callCenterData = searchFactory.newContext({
      queryOptions: 'call-center'
    });

    $scope.users = {
      '1-trades': { label: 'Internal Data', desc: 'Internal data lake integrating the data silos for Transactions, Customer Data, Demographic Information etc.', name: 'Trades' },
      '2-data': { label: 'Data 360', desc: 'Actionable view of your data combining internal & external data lakes.', name: 'Landing' },
      '3-explore': { label: 'External Data', desc: 'External data lake integrating the data silos for Social Media, Click Stream, Online Marketing etc.', name: 'Ontologies' },
      '5-settings': { label: 'Data Hub', desc: 'User interface for loading, harmonizing, accessing & configuration data', name: 'upload' },
    };

    $scope.login = function (key) {
      $location.path('/' + key.substring(key.indexOf('-') + 1));
    };
    var model = {
      showAlert: "none",
      defaultSymbol: 'tsla',
      symbol: '',
      qtext: '',
      customers: {
        search: {},
        isSearching: false,
        page: 1,
        results: []
      },
      transactions: {
        search: {},
        isSearching: false,
        page: 1,
        results: []
      },
      merchants: {
        search: {},
        isSearching: false,
        page: 1,
        results: []
      },
      companies: {
        search: {},
        isSearching: false,
        page: 1,
        results: []
      },
      documents: {
        search: {},
        isSearching: false,
        page: 1,
        results: []
      },
      products: {
        search: {},
        isSearching: false,
        page: 1,
        results: []
      },
      callcenter: {
        search: {},
        isSearching: false,
        page: 1,
        results: []
      },
      tree: {
        options: {
          nodeChildren: 'children',
          dirSelectable: true
        },
        data: [
          { 'name': 'Transactions Data', 'id': null, 'type': 'transaction-data', 'count': 10, 'children': [] },
          { 'name': 'Customer Data', 'id': null, 'type': 'customer-data', 'count': 10, 'children': [] },
          { 'name': 'Product Data', 'id': null, 'type': 'product-data', 'count': 10, 'children': [] },
          { 'name': 'Merchants Data', 'id': null, 'type': 'merchant-data', 'count': 10, 'children': [] },
          { 'name': 'Documents', 'id': null, 'type': 'document-data', 'count': 10, 'children': [] },
          { 'name': 'Customer Service Data', 'id': null, 'type': 'call-data', 'count': 10, 'children': [] },
          { 'name': 'Companies Data', 'id': null, 'type': 'company-data', 'count': 10, 'children': [] }
        ],
        indexes: {
          TRANSACTION_DATA: 0,
          CUSTOMER_DATA: 1,
          PRODUCT_DATA:2,
          MERCHANT_DATA:3,
          DOCUMENT_DATA:4,
          CALL_CENTER:5,
          COMPANY_CENTER:6
        }
      },
      tabs: {
        transactions: { active: true },
        customers: { active: false },
        products: { active: false },
        documents: { active: false },
        merchants: { active: false },
        companies: { active: false }
      }
    };

    function collectionConstraint(){
      return {
        'collection-query': {
          'uri': [ 'entities','customers', 'panama-entities']
        }
      }
    }

    function merchantsConstraint(){
      return {
        'collection-query': {
          'uri': [ 'merchants']
        }
      }
    }

    function companiesConstraint(){
      return {
        'collection-query': {
          'uri': ['companies']
        }
      }
    }

    function transactionConstraint(){
      return {
        'collection-query': {
          'uri': ['transactions']
        }
      }
    }
    function productsConstraint(){
      return {
        'collection-query': {
          'uri': [ 'products' ]
        }
      }
    }

    function documentsConstraint(){
      return {
        'collection-query': {
          'uri': [ 'admin-documents' ]
        }
      }
    }
    function callCenterConstraint(){
      return {
        'collection-query': {
          'uri': [ 'call-center']
        }
      }
    }

    ctrl.getCollectionConstraint = function(){
      return {
        'collection-query': {
          'uri': [ 'customers', 'call-center' , 'admin-documents']
        }
      }
    }

    function search(){
      model.customers.isSearching = true;
      model.transactions.isSearching = true;
      searchTransactions()
      searchCustomers()
      searchProducts()
      searchMerchants()
      searchDocuments()
      searchCallCenter()
      searchCompanies()
    }

    function searchCompanies() {
      model.companies.isSearching = true;
      ctrl.userName = userService.currentUser().name
      companiesData.additionalQueries.push(companiesConstraint());
      companiesData
        .setText(model.qtext)
        .setPage(model.companies.page)
        .search()
        .then(updateCompanyResults);
    }
    function updateCompanyResults(data) {
      model.companies.isSearching = false;
      model.companies.search = data;
      //console.log(model.merchants.search)
      model.companies.page = merchantsData.getPage();
      model.companies.results = data.results;
      model.tree.data[model.tree.indexes.COMPANY_CENTER].count = model.companies.search.total
    }

    function searchCallCenter() {
      model.callcenter.isSearching = true;
      ctrl.userName = userService.currentUser().name
      callCenterData.additionalQueries.push(callCenterConstraint());
      callCenterData
        .setText(model.qtext)
        .setPage(model.callcenter.page)
        .search()
        .then(updateCallCenterResults);
    }
    function updateCallCenterResults(data) {
      console.log('searching call center', data)
      model.callcenter.isSearching = false;
      model.callcenter.search = data;
      //console.log(model.merchants.search)
      model.callcenter.page = callCenterData.getPage();
      model.callcenter.results = data.results;
      model.tree.data[model.tree.indexes.CALL_CENTER].count = model.callcenter.search.total
    }

    function searchMerchants() {
      model.merchants.isSearching = true;
      ctrl.userName = userService.currentUser().name
      merchantsData.additionalQueries.push(merchantsConstraint());
      merchantsData
        .setText(model.qtext)
        .setPage(model.merchants.page)
        .search()
        .then(updateMerchantResults);
    }
    function updateMerchantResults(data) {
      model.merchants.isSearching = false;
      model.merchants.search = data;
      //console.log(model.merchants.search)
      model.merchants.page = merchantsData.getPage();
      model.merchants.results = data.results;
      model.tree.data[model.tree.indexes.MERCHANT_DATA].count = model.merchants.search.total
    }

    function searchDocuments() {
      model.documents.isSearching = true;
      ctrl.userName = userService.currentUser().name
      documentsData.additionalQueries.push(documentsConstraint());
      documentsData
        .setText(model.qtext)
        .setPage(model.documents.page)
        .search()
        .then(updateDocumentResults);
    }
    function updateDocumentResults(data) {
      model.documents.isSearching = false;
      model.documents.search = data;
      model.documents.page = documentsData.getPage();
      model.documents.results = data.results;
      model.tree.data[model.tree.indexes.DOCUMENT_DATA].count = model.documents.search.total
    }

    function searchTransactions() {
      model.transactions.isSearching = true;
      ctrl.userName = userService.currentUser().name
      //console.log(transactionConstraint())
      transactionsData.additionalQueries.push(transactionConstraint());
      transactionsData
        .setText(model.qtext)
        .setPage(model.transactions.page)
        .search()
        .then(updateTransactionResults);
    }
    function updateTransactionResults(data) {
      console.log(data)
      model.transactions.isSearching = false;
      model.transactions.search = data;
      model.transactions.page = transactionsData.getPage();
      model.transactions.results = data.results;
      model.tree.data[model.tree.indexes.TRANSACTION_DATA].count = model.transactions.search.total
      model.tree.data[model.tree.indexes.TRANSACTION_DATA].children = model.transactions.search.facets['Service-Area'].facetValues

      for(var i = 0; i < model.transactions.search.facets['Service-Area'].facetValues.length; i++) {
        model.tree.data[model.tree.indexes.TRANSACTION_DATA].children[i].id = model.transactions.search.facets['Service-Area'].facetValues[i].name;
        model.tree.data[model.tree.indexes.TRANSACTION_DATA].children[i].type = model.transactions.search.facets['Service-Area'].facetValues[i].name
      }
    }

    function searchCustomers() {
      model.customers.isSearching = true;
      ctrl.userName = userService.currentUser().name
      //console.log(collectionConstraint())
      custData.additionalQueries.push(collectionConstraint());
      custData
        .setText(model.qtext)
        .setPage(model.customers.page)
        .search()
        .then(updateCustomerResults);
    }
    function updateCustomerResults(data) {
      model.customers.isSearching = false;
      model.customers.search = data;
      model.customers.page = custData.getPage();
      model.customers.results = data.results;
      model.tree.data[model.tree.indexes.CUSTOMER_DATA].count = model.customers.search.total
    }

    $scope.filterCreditor = function(val){
      if(model.qtext.length < 1){
        model.qtext = "'"+val+"'"
      }else{
        model.qtext = model.qtext + " AND '"+val+"'"
      }
      search()
    }

    $scope.clear = function(){
      clear()
    }
    ctrl.clear = function(){
      clear()
    }
    function clear(){
      model.qtext = ''
      search()
    }

    function searchProducts() {
      model.products.isSearching = true;
      ctrl.userName = userService.currentUser().name
      //console.log(productsConstraint())
      productsData.additionalQueries.push(productsConstraint());
      productsData
        .setText(model.qtext)
        .setPage(model.transactions.page)
        .search()
        .then(updateProductResults);
    }
    function updateProductResults(data) {
      model.products.isSearching = false;
      model.products.search = data;
      model.products.page = productsData.getPage();
      model.products.results = data.results;
      model.tree.data[model.tree.indexes.PRODUCT_DATA].count = model.products.search.total
    }

    $scope.range = function(n) {
      return new Array(n);
    };
    $scope.$watch(userService.currentUser, function(newValue) {
      ctrl.currentUser = newValue;
    });

    function showSelected(node, selected) {
      if (node) {

        if (node.type === 'transaction-data') {
          model.tabs.transactions.active = true;
        }
        if (node.id) {
          if(model.qtext.length < 1){
            model.qtext = "'"+node.id+"'"
          }else{
            model.qtext = model.qtext + " AND '"+node.id+"'"
          }
          search()
        }
        if (node.type === 'customer-data') {
          model.tabs.customers.active = true;
        }
        if (node.type === 'merchant-data') {
          model.tabs.merchants.active = true;
        }
        if (node.type === 'product-data') {
          model.tabs.products.active = true;
        }
        if (node.type === 'document-data') {
          model.tabs.documents.active = true;
        }
        if (node.type === 'call-data') {
          model.tabs.callcenter.active = true;
        }
      }
    }

    angular.extend(ctrl, {
      model:model,
      showSelected:showSelected,
      searchTransactions:searchTransactions,
      searchCustomers:searchCustomers,
      searchProducts:searchProducts(),
      searchDocuments:searchDocuments(),
      searchMerchants:searchMerchants(),
      searchCallCenter:searchCallCenter(),
      searchCompanies:searchCustomers(),
      search:search,
      clear:clear
    });

    search()
  }
}());
