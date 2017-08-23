xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/ingestRSSFeed";
import module namespace functx = "http://www.functx.com" at "/MarkLogic/functx/functx-1.0-nodoc-2007-01.xqy";


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
  let $feedURL := map:get($params,"url")
  let $user := xdmp:get-current-user()
  let $_:= xdmp:log($feedURL)
  let $feed := xdmp:http-get($feedURL)[2]
  for $item in $feed//item
  return xdmp:document-insert(fn:concat("/",$user,"/",functx:substring-after-last($item//guid[1],'/'),'.xml'), $item, (), "feeds")

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
