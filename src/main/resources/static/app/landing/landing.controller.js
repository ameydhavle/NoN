(function () {
  'use strict';

  angular.module('app.landing',['shagstrom.angular-split-pane', 'treeControl'])
    .controller('LandingCtrl', LandingCtrl)
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
    }});

  LandingCtrl.$inject = ['$scope', 'MLRest', '$state', 'userService','$http', '$window','MLSearchFactory', '$location'];


  function LandingCtrl($scope, mlRest, $state, userService, $http, $window, searchFactory, $location) {
    var ctrl = this;

    var custData = searchFactory.newContext({
      queryOptions: 'customers'
    });

    var transactionsData = searchFactory.newContext({
      queryOptions: 'transactions'
    });



    $scope.users = {
      '1-idl': { label: 'Internal Data', desc: 'Internal data lake integrating the data silos for Transactions, Customer Data, Demographic Information etc.', name: 'idl' },
      '2-search': { label: 'Data 360', desc: 'Actionable view of your data combining internal & external data lakes.', name: 'search' },
      '3-edl': { label: 'External Data', desc: 'External data lake integrating the data silos for Social Media, Click Stream, Online Marketing etc.', name: 'edl' },
      '5-upload': { label: 'Data Hub', desc: 'User interface for loading, harmonizing, accessing & configuration data', name: 'upload' },
      '4-events': { label: 'Network View', desc: 'Network of merchant networks view', name: 'events' }
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
      tree: {
        options: {
          nodeChildren: 'children',
          dirSelectable: true
        },
        data: [
          { 'name': 'Transactions Data', 'id': null, 'type': 'transaction-data', 'count': 10, 'children': [] },
          { 'name': 'Customer Data', 'id': null, 'type': 'customer-data', 'count': 10, 'children': [] }
        ],
        indexes: {
          TRANSACTION_DATA: 0,
          CUSTOMER_DATA: 1
        }
      },
      tabs: {
        transactions: { active: true },
        customers: { active: false }
      }
    };

    function search(){
      model.customers.isSearching = true;
      model.transactions.isSearching = true;
      searchTransactions()
      searchCustomers()

    }

    function searchTransactions() {
      model.transactions.isSearching = true;
      transactionsData
        .setText(model.qtext)
        .setPage(model.transactions.page)
        .search()
        .then(updateTransactionResults);
    }
    function updateTransactionResults(data) {
      model.transactions.isSearching = false;
      model.transactions.search = data;
      model.transactions.page = transactionsData.getPage();
      model.transactions.results = data.results;
      model.tree.data[model.tree.indexes.TRANSACTION_DATA].count = model.transactions.search.total
    }

    function searchCustomers() {
      model.customers.isSearching = true;
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
        else if (node.type === 'customer-data') {
          model.tabs.customers.active = true;
        }
      }
    }

    angular.extend(ctrl, {
      model:model,
      showSelected:showSelected,
      searchTransactions:searchTransactions,
      searchCustomers:searchCustomers,
      search:search
    });

    search()
  }
}());
