xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/envelopePatternMerchants";

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
  for $d at $i in fn:collection('merchants')
  let $group :=
  	if ($i mod 2 = 0) then
  		"inNetwork"
  	else
  		"outNetwork"

  let $env :=
    <envelope>
      <headers>
        <last_updated>{fn:current-time()}</last_updated>
        <last_updated_by>{xdmp:get-current-user()}</last_updated_by>
        <source>MLCP</source>
        <collection>{xdmp:document-get-collections(xdmp:node-uri($d))}</collection>
        <group>{$group}</group>
      </headers>
      <metadata>
      	<transaction-data></transaction-data>
      </metadata>
      <triples/>
      <content>
        {$d/(root|customers)/*}
      </content>
    </envelope>
  let $_ := if(fn:exists($d//envelope)) then () else xdmp:node-replace($d/(root|customers), $env)
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
