
xquery version "1.0-ml";

(: Copyright 2002-2014 MarkLogic Corporation.  All Rights Reserved. :)

(: alerting log action :)

declare namespace alert = "http://marklogic.com/xdmp/alert";

import module "http://marklogic.com/xdmp/alert" at "/MarkLogic/alert.xqy";

declare variable $alert:config-uri as xs:string external;
declare variable $alert:doc as node() external;
declare variable $alert:rule as element(alert:rule) external;
declare variable $alert:action as element(alert:action) external;

let $log-id := xdmp:random()
let $rule-options := alert:rule-get-options($alert:rule)
let $log-dir := data($rule-options/alert:directory)
let $log-dir := if ($log-dir) then $log-dir else "/"
let $_ := xdmp:log(fn:base-uri($alert:doc))
return
  if(fn:count(cts:search(collection("alerts"),
      cts:element-query(xs:QName("document-uri"), $alert:doc))) > 0 )
  then ()
  else
  (xdmp:document-insert(
      fn:concat($log-dir, $log-id, ".xml"),
      <alert:log>
        <alert:log-id>{$log-id}</alert:log-id>
        <alert:active>true</alert:active>
        <alert:config-uri>{$alert:config-uri}</alert:config-uri>
        <alert:rule-id>{alert:rule-get-id($alert:rule)}</alert:rule-id>
        <alert:user-id>{alert:rule-get-user-id($alert:rule)}</alert:user-id>
        <alert:document-uri>{fn:base-uri($alert:doc)}</alert:document-uri>
        <alert:timestamp>{fn:current-dateTime()}</alert:timestamp>
      </alert:log>,
      (),
      "alerts"),

      xdmp:email(
      <em:Message
      xmlns:em="URN:ietf:params:email-xml:"
      xmlns:rf="URN:ietf:params:rfc822:">
        <rf:subject>New Data Alert - {$alert:rule//*:description/text()}</rf:subject>
        <rf:from>
          <em:Address>
            <em:name>Data 360 Application Alerts</em:name>
            <em:adrs>amey.dhavle@marklogic.com</em:adrs>
          </em:Address>
        </rf:from>
        <rf:to>
          <em:Address>
            <em:name>Amey Dhavle</em:name>
            <em:adrs>amey.dhavle@marklogic.com</em:adrs>
          </em:Address>
        </rf:to>
        <em:content>
          <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
              <title>Alert - New data matching your rule has been identified</title>
            </head>
            <body>
              <h3>Following transaction needs your attention </h3>
              <h4>You are receiving this alert because of the following rule that has been set in the application</h4>
              <code>
                {$alert:rule//*:description}
              </code>
              <br/>
              <code>
                Matched Document - {fn:base-uri($alert:doc)}
              </code>

            </body>
          </html>
        </em:content>
      </em:Message>),
  xdmp:log("Alert complete"))


