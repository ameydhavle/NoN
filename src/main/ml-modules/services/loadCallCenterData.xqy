xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/loadCallCenterData";

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
  for $files at $index in xdmp:filesystem-directory("/space/data/ref/events")//*:pathname/text()
  return
    xdmp:spawn-function(
        function()
        {
          xdmp:document-load($files,
              <options xmlns="xdmp:document-load"
              xmlns:http="xdmp:http">
                <collections>
                  <collection>{fn:concat(xdmp:get-current-user(),'-events')}</collection>
                </collections>
              </options>
          )
        },
        <options xmlns="xdmp:eval">
          <transaction-mode>update-auto-commit</transaction-mode>
        </options>)

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
