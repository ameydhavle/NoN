xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/clearDatabase";

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
  let $collection-seq := ('-customers','-merchants', '-products','-call-center','-documents','-binary','-processed-binary','-feeds','-entities','-events')
  for $seq in $collection-seq
  let $_ := if(fn:string-length(xdmp:get-current-user()) > 0) then xdmp:collection-delete(fn:concat(xdmp:get-current-user(),$seq)) else()
  return xdmp:log("Put called")
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
