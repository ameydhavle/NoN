xquery version "1.0-ml";

declare namespace csv = "http://marklogic.com/app/csv";

import module namespace sq = "http://marklogic.com/mlpm/structured-query"
  at "/lib/structured-query-utils.xqy";
import module namespace search = "http://marklogic.com/appservices/search"
  at "/MarkLogic/appservices/search/search.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";

declare option xdmp:mapping "false";

declare function csv:print-line($values as item()*, $nr-columns as xs:integer) as xs:string {
  let $_ :=
    if (count($values) ne $nr-columns) then
      error(xs:QName("csv:COLUMNCOUNT"), "Values count not equal to column count")
    else ()
  return
    string-join(
      for $val in $values
      let $val := string($val)
      return
        if (matches($val, '[,"\n\r]')) then
          concat('"', replace($val, '"', '""'), '"')
        else
          $val,
      ","
    )
};

declare function csv:build-line($doc, $fields, $scope) as item()* {
  let $uri := base-uri($doc)
  let $filename := replace($uri, "^.*?([^/]+)$", "$1")
  let $results := map:new(
    for $binding in sem:sparql(
      '
        SELECT ?key ?value {
          [] ?p ?value.
          BIND( strafter(?p, "http://marklogic.com/semantics#") as ?key )
          FILTER( ?key = ?keys ) 
        }
      ',
      map:entry("keys", $fields),
      (),
      sem:store(
        $scope,
        cts:document-query($uri)
      )
    )
    return map:entry(map:get($binding, "key"), map:get($binding, "value"))
  )
  return ($filename, $fields ! string-join(map:get($results, .) ! string(.), ", "))
};

let $filename := concat("csv-", current-dateTime(), ".csv")
let $options :=
  sq:named-options(
    xdmp:get-request-field('options', 'all')[1]
  )
let $qtextQuery :=
  search:parse(xdmp:get-request-field('q', ''), $options)/cts:query(.)
let $structuredQuery :=
  xdmp:from-json-string(
    xdmp:get-request-field('structuredQuery', '{"query":{"queries":[{"and-query":{"queries":[]}}]}}')[1]
  )
let $additionalQuery := $options/search:additional-query/*/cts:query(.)
let $q :=
  cts:and-query((
    $qtextQuery,
    sq:to-cts(sq:from-json($structuredQuery), $options),
    $additionalQuery
  ))
let $scope := ($options/search:fragment-scope, "any")[1]
let $q :=
  cts:or-query((
    if ($scope = ('document', 'any')) then
      $q
    else (),
    if ($scope = ('properties', 'any')) then
      cts:properties-fragment-query($q)
    else (),
    if ($scope = ('locks', 'any')) then
      cts:locks-fragment-query($q)
    else ()
  ))
let $fields :=
  for $f in xdmp:get-request-field('fields')
  return tokenize($f, ",")
let $field-count := count($fields) + 1
return (
  xdmp:set-response-code(200,"OK"),
  xdmp:set-response-content-type("text/csv"),
  xdmp:set-response-encoding("UTF-8"),
  xdmp:add-response-header("Content-Disposition", concat("attachment;filename=", $filename)),
  xdmp:add-response-header("Pragma", "no-cache"),
  (: CSV header :)
  csv:print-line(('Filename',$fields), $field-count),
  (: CSV rows :)
  for $doc in cts:search(collection(), $q)
  let $line := csv:build-line($doc, $fields, $scope)
  return csv:print-line($line, $field-count)
)
