xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/alerts";
import module namespace alert = "http://marklogic.com/xdmp/alert" at "/MarkLogic/alert.xqy";
import module namespace utilities = "http://marklogic.com/utilities" at "/ext/utilities.xqy";

declare function get(
  $context as map:map,
  $params  as map:map
  ) as document-node()*
{
  let $table :=
    <div style="overflow:auto">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Alert Name</th>
            <th>Description</th>
            <th>Alert Values</th>
          </tr>
        </thead>
        <tbody>
          {
            for $alert in alert:get-all-rules("cust360-alert-config-uri",cts:word-query("Customer-360"))
            return
              <tr>
                <td name="name">{fn:data($alert/*:name)}</td>
                <td name="desc">{fn:data($alert/*:description)}</td>
                <td name="alertValue">{fn:data($alert//*:text)}</td>

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
  let $name := map:get($params, "ruleName")
  let $desc := map:get($params, "ruleDesc")
  let $alert-value := map:get($params, "ruleValue")
  let $_:= xdmp:log("1")
  let $_ := utilities:alert-rule($name,$desc,$alert-value)
  return document {"Adding Alerting Rule"}
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
