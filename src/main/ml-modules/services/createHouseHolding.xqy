xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/createHouseHolding";
import module namespace sem = "http://marklogic.com/semantics"
at "/MarkLogic/semantics.xqy";

declare function get(
  $context as map:map,
  $params  as map:map
  ) as document-node()*
{
  let $subject := map:get($params, "subject")
  let $q := sem:iri($subject)
  let $params :=
    map:new(map:entry("subject",
        sem:iri($q)))

  let $triples-values :=
    sem:query-results-serialize(sem:sparql("
  SELECT ?object
  WHERE
  { ?subject <http://marklogic.com/relatedTo> ?object } ",
        $params))
  let $result := <result>{
    for $triple at $cnt in $triples-values
    let $query-string := fn:replace(fn:replace($triple,'http://marklogic.com/triples/',''),'_',' ')
    return <household>{$query-string}</household>
  }</result>

  return document {$result}


};

declare function put(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
  ) as document-node()?
{
  for $person in fn:collection("customers")
  let $_ := cts:search
  (
      fn:collection('call-center'),
      cts:or-query
      ((
        cts:element-value-query(xs:QName("AccountNum"), ($person//AccountNum[1]/text()))
      ))
  )

  let $_ :=
    if($_ and not($_//caller_name/text() eq fn:concat($person//first_name/text(), ' ', $person//last_name/text()))) then
      xdmp:node-insert-child($person//triples,
          <sem:triple xmlns:sem="http://marklogic.com/semantics">
            <sem:subject>{'http://marklogic.com/triples/' || $person//first_name[1]/text() || '_' || $person//last_name[1]/text()}</sem:subject>
            <sem:predicate>http://marklogic.com/relatedTo</sem:predicate>
            <sem:object>{'http://marklogic.com/triples/' || fn:replace($_//caller_name/text(),' ','_')}</sem:object>
          </sem:triple>)
    else ()
  return xdmp:log("PUT called")
};

declare function post(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
  ) as document-node()*
{
  xdmp:log("POST called")
};

declare function delete(
  $context as map:map,
  $params  as map:map
  ) as document-node()?
{
  xdmp:log("DELETE called")
};
