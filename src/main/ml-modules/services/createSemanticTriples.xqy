xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/createSemanticTriples";

import module namespace sem = "http://marklogic.com/semantics" at "/MarkLogic/semantics.xqy";
import module namespace utilities = "http://marklogic.com/utilities" at "/ext/utilities.xqy";

declare function get(
  $context as map:map,
  $params  as map:map
  ) as document-node()*
{
  let $sub := map:get($params, "q")
  let $subjectIRI := ($sub)
  let $predIRI := ("http://marklogic.com/same-as")
  let $bindings := map:map()
  let $_ := map:put($bindings, "doc", sem:iri($subjectIRI) )
  let $_P := map:put($bindings, "predicate", sem:iri($predIRI) )
  let $triples-values :=
    sem:query-results-serialize(sem:sparql('
     select ?obj
     where { $doc  $predicate ?obj }', $bindings))//*:literal
  let $result := <result>{
    for $triple at $cnt in $triples-values
    let $query-string := if($cnt lt fn:count($triples-values)) then ( '"' || $triple || '"' ) else ('"' || $triple || '"')
    return <same-as>{$query-string}</same-as>
  }</result>

  return document{ $result }
};

declare function put(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
  ) as document-node()?
{
  let $sub := map:get($params, "subject")
  let $obj := map:get($params, "object")
  let $pred := map:get($params, "predicate")
  return
    utilities:add-triple($sub, $pred, $obj)
};

declare function post(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
  ) as document-node()*
{
  let $sub := map:get($params, "subject")
  let $obj := map:get($params, "object")
  let $pred := map:get($params, "predicate")

  return
    utilities:add-triple($sub, $pred, $obj)
};

declare function delete(
  $context as map:map,
  $params  as map:map
  ) as document-node()?
{
  xdmp:log("DELETE called")
};
