xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/clearCentralMerchant";

declare function get(
  $context as map:map,
  $params  as map:map
  ) as document-node()*
{
  xdmp:log("GET called")
};

declare function put(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
  ) as document-node()?
{
	let $_ :=
	  for $i in fn:collection("merchant-wire-generated")
		return xdmp:document-delete(xdmp:node-uri($i))

  return xdmp:log("deleted central merchant")
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
