xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/normalizeName";

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
  let $_ :=
    (
      for $d in fn:collection('customers')[//(fname|first_name|name|firstName|GivenName)]
      return if(fn:exists($d//headers/first_name)) then () else  xdmp:node-insert-child($d//headers, <first_name>{$d//(fname|first_name|name|firstName|GivenName)/text()}</first_name>)
    )
  let $_ :=
    (
      for $d in fn:collection('customers')[//(lname|last_name|surname|lastName|Surname)]
      return if(fn:exists($d//headers/last_name)) then () else   xdmp:node-insert-child($d//headers, <last_name>{$d//(lname|last_name|surname|lastName|Surname)/text()}</last_name>)
    )
  return xdmp:log("")
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
