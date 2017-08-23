xquery version "1.0-ml";

module namespace ext = "http://marklogic.com/rest-api/resource/synonyms";

import module namespace thsr="http://marklogic.com/xdmp/thesaurus"
    at "/MarkLogic/thesaurus.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare namespace roxy = "http://marklogic.com/roxy";

(:
 : To add parameters to the functions, specify them in the params annotations.
 : Example
 :   declare %roxy:params("uri=xs:string", "priority=xs:int") ext:get(...)
 : This means that the get function will take two parameters, a string and an int.
 :)

(:
 :)
declare
%roxy:params("qtext=xs:string")
function ext:get(
    $context as map:map,
    $params  as map:map
) as document-node()*
{
  ext:post($context, $params, ())
};

(:
 :)
declare
%roxy:params("qtext=xs:string")
function ext:post(
    $context as map:map,
    $params  as map:map,
    $input   as document-node()*
) as document-node()*
{
  let $output-types := map:put($context, "output-types", "application/json")
  let $matched-terms := map:new()
  let $qtext := map:get($params, "qtext")
  let $synonyms :=
  	if (exists($qtext)) then
  		let $tokens := fn:tokenize(fn:lower-case($qtext), " ")
			return
			  for $tok in $tokens
			  let $syn := thsr:lookup("/data/thesaurus.xml", $tok)
			  let $expanded-query :=
			    if ($syn) then
			      thsr:expand(
			        cts:word-query($tok),
			        $syn,
			        0.25,
			        (),
			        ()
			      )
			   else ()
			  let $_ :=
			  	if ($syn) then
			  		for $t in $syn
			  		let $value := $t//thsr:synonym/thsr:term/data()
			  		return map:put($matched-terms, $value, $value)
			  	else ()
			  return
			  	if ($syn) then
			  		object-node {
			  			"term": $tok,
			  			"synonyms" : array-node {
			  				for $t in $syn
			  				return $t//thsr:synonym/thsr:term/data()
			  			},
			  			"structured-query" : xdmp:to-json($expanded-query)
			  		}
			  	else ()
	  else ()

	let $exp-search := fn:string-join(map:keys($matched-terms), " OR ")
	let $full-search :=
		if (fn:string-length($exp-search) > 0) then
			fn:concat($qtext, " OR ", $exp-search)
		else
			$qtext

  let $response := json:object()
  let $_ := map:put($response, "qtext", $qtext)
  let $_ := map:put($response, "matched", json:to-array($synonyms))
  let $_ := map:put($response, "expansionSearchText", $exp-search)
  let $_ := map:put($response, "fullSearchText", $full-search)
  return (xdmp:set-response-code(200, "OK"), document { xdmp:to-json($response) })
};
