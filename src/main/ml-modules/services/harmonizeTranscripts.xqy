xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/harmonizeTranscripts";

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
  for $d in fn:collection('customers')
  let $deposits := cts:search(fn:collection('transactions'),
      cts:element-value-query(
          xs:QName("AccountNum"),
          $d//AccountNum))//record
  let $_ := (for $dep in $deposits return  xdmp:node-insert-child($d//metadata/transaction-data, $dep)  )
  let $cc := cts:search(fn:collection('transactions'),
      cts:element-value-query(
          xs:QName("CCNumber"),
          $d//CCNumber))//record
  return (for $c in $cc return xdmp:node-insert-child($d//metadata/transaction-data, $c) )

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
