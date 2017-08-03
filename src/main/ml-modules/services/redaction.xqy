xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/redaction";

import module namespace rdt = "http://marklogic.com/xdmp/redaction" at "/MarkLogic/redaction.xqy";

declare function get(
  $context as map:map,
  $params  as map:map
  ) as document-node()*
{
  let $uri := map:get($params, "uri")
  let $_ := rdt:redact(fn:doc($uri), ("phone","ssn","email"))
  return $_

};

declare function put(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
  ) as document-node()?
{
  xdmp:log("PUT called")
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
