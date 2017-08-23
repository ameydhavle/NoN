xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/loadSampleData";

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
  for $files at $index in xdmp:filesystem-directory("/space/data/customers")//*:pathname/text()
  return
    let $claims-doc := xdmp:document-get($files)
    let $uri-prefix := "/data/"
    let $lines := tokenize($claims-doc, '\n')
    let $head := tokenize($lines[1], ',')
    let $body := remove($lines, 1)
    let $_ :=
      for $line at $idx in $body
      let $fields := tokenize($line, ',')
      let $doc :=
        <root>
          {
            for $key at $pos in $head
            let $value := $fields[$pos]
            return element { $key } { $value }
          }
        </root>
      let $doc-uri := fn:concat($uri-prefix, $files,$idx, ".xml")
      return
        xdmp:document-insert($doc-uri, $doc,(),fn:concat(xdmp:get-current-user(),'-entities'))
    return ()
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
