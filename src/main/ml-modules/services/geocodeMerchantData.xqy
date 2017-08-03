xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/geocodeMerchantData";

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
  for $d in fn:collection('merchants')
  let $zip-raw := $d//(Zip|zip|ZipCode|zipCode|zipcode)[1]
	let $zip :=
		if (fn:contains($zip-raw, "_")) then
			fn:tokenize($zip-raw, "_")[1]
		else
			$zip-raw
  let $geocode := cts:search(fn:collection("zipcodes"),
      cts:element-value-query(
        xs:QName("Zipcode"),
        $zip
      )
    )/root/*

  return if(fn:exists($d//geo-data)) then () else xdmp:node-insert-child($d//metadata, <geo-data>{$geocode}</geo-data>)

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
