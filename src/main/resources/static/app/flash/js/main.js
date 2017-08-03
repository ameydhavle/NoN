// Copyright 2002-2011 MarkLogic Corporation.  All Rights Reserved.

// Name of the first lexicon to run co-occurences and first in facet list.  Must include prefix if one is required
// in cooc.xqy.
var lex1 =  "city"; //getPairsItem1()

// Name of the second lexicon to run co-occurences and second in facet list.  Must include prefix if one is required
// in cooc.xqy.
var lex2 =  "state"; //getPairsItem2()

// The number of top co-occurrences to return.  Typographic widget can hold a maxmimum of 10.
var pageSize = 15;

var qString = location.search
var qValue = qString.substring(qString.indexOf("q=") + 2, qString.length);
//var qValue = $("#query-text").val();


// The default query when the page is loaded or when the page is reset.  Can be empty.
var defaultQuery;

if (qValue !== "") {
  defaultQuery = unescape(qValue).replace(/\+/g, " ");
} else {
  defaultQuery = "";
}

var startIndex = 1;

function getPairsItem(id) {

  var i = 0;
  var chosen = "none";
  var target = document.getElementById(id);

  if (target !== null && target.length > 0) {
    for (i = 0; i < target.length; i++) {
      if (target[i].selected) {
        chosen = target[i].value;
      }
    }
  }
  return chosen;
}

function getNewPost() {
  var sQuery;

  // sFacets = "";
  var lex1_value = getPairsItem("lex1_control");

  if (lex1_value !== "none") {
    lex1 = lex1_value;
  }

  var lex2_value = getPairsItem("lex2_control");

  if (lex2_value !== "none") {
    lex2 = lex2_value;
  }

  var mySearch = '';

  if (mySearch !== "") {
    sQuery = mySearch;
  } else {
    mySearch = '';
    sQuery = '';
  }

  // sStr = mySearch.name + "=" + mySearch.value;
  if (document.Cooc.newSearch !== undefined) {
    setTimeout("document.Cooc.newSearch('" + sQuery + "', '" + lex1 + "', '" + lex2 + "', " + pageSize + ", " + startIndex + ")", 100);
  }

  return false;
}

// This function gets called when the Flash widget gets loaded. Not quite sure how.
function widgetLoaded() {
  getNewPost();
}

$.extend({
  getUrlVars: function(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  },
  getUrlVar: function(name){
    return $.getUrlVars()[name];
  }
});