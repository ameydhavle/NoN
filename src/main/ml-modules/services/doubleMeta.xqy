xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/doubleMeta";
import module namespace spell = "http://marklogic.com/xdmp/spell" at "/MarkLogic/spell.xqy";
declare function get(
  $context as map:map,
  $params  as map:map
  ) as document-node()*
{
  let $q := map:get($params, "q")
  let $meta := for $i in spell:suggest('/data/ref/dictionary-large.xml',$q)
  						 return if($i) then $i else()
  return
    document {if(fn:count($meta) > 1)
     then string-join($meta, ',')
     else $meta}
};

declare function put(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
  ) as document-node()?
{
  let $q := map:get($params, "q")
  let $_ := spell:add-word("/data/ref/dictionary-large.xml", $q)
  return
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
