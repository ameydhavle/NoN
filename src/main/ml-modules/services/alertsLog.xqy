xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/alertsLog";
import module namespace alert = "http://marklogic.com/xdmp/alert" at "/MarkLogic/alert.xqy";
import module namespace search="http://marklogic.com/appservices/search" at "/MarkLogic/appservices/search/search.xqy";
import module namespace sec="http://marklogic.com/xdmp/security" at "/MarkLogic/security.xqy";

declare function get(
  $context as map:map,
  $params  as map:map
  ) as document-node()*
{
  let $table :=
    <div>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Alert Configuration</th>
            <th>Alert Value</th>
            <th>Matched Document</th>
            <th>User ID</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {
            for $alert in fn:collection("alerts")[1 to 100]
            let $query-text:= alert:get-my-rules("cust360-alert-config-uri",alert:rule-id-query($alert//alert:rule-id/text()))//*:description
            let $_ := xdmp:log($query-text)
            return
                <tr>
                  <td name="name">{fn:data($alert//*:config-uri)}</td>
                  <td name="desc">{$query-text}</td>
                  <td name="alertValue">{fn:data($alert//*:document-uri)}</td>
                  <td>admin</td>
                  <td> { fn:format-dateTime(fn:data($alert//*:timestamp),
                      "[Y01]/[M01]/[D01] [H01]:[m01]:[s01]:[f01]") }</td>
                </tr>
          }
        </tbody>
      </table>
    </div>
  return document{$table},
  map:put($context, "output-types", "application/html"),
  xdmp:set-response-code(200, "OK")
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
