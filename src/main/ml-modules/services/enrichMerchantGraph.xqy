xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/enrichMerchantGraph";

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

  for $m in fn:collection('merchants')
  let $_:=
    (
      xdmp:node-insert-child($m/root,
          <sem:triple xmlns:sem="http://marklogic.com/semantics">
            <sem:subject>{'http://marklogic.com/triples/' || fn:replace($m//Company_Name[1]/text(),"[\s\(/\),'-]","_")}</sem:subject>
            <sem:predicate>http://marklogic.com/hasSICCode</sem:predicate>
            <sem:object>{'http://marklogic.com/triples/' || $m//SIC_Code[1]/text()}</sem:object>
          </sem:triple>),
      xdmp:node-insert-child($m/root,
          <sem:triple xmlns:sem="http://marklogic.com/semantics">
            <sem:subject>{'http://marklogic.com/triples/' || fn:replace($m//Company_Name[1]/text(),"[\s\(/\),'-]","_")}</sem:subject>
            <sem:predicate>http://marklogic.com/isPartOf</sem:predicate>
            <sem:object>{'http://marklogic.com/triples/' || $m//Industry[1]/text()}</sem:object>
          </sem:triple>)
    )
  return xdmp:log("Merchant Graph generated")

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
