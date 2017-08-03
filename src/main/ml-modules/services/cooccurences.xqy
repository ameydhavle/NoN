xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/cooccurences";

import module namespace search = "common-search" at "/ext/common-search.xqy";
import module namespace functx = "http://www.functx.com" at "/MarkLogic/functx/functx-1.0-nodoc-2007-01.xqy";


declare function get(
  $context as map:map,
  $params  as map:map
  ) as document-node()*
{
  let $_ := xdmp:log("Cooccurence GET")
  let $lex1 := map:get($params, "lex1word")
  let $lex2 := map:get($params, "lex2word")
  let $_ := xdmp:log($lex1)
  let $_ := xdmp:log($lex2)
  let $query := search:build-query(fn:replace(map:get($params,"q"),"&amp;x=0&amp;y=0",""), map:get($params,"constraint"))
  let $shim := xdmp:log(fn:concat("Widget query: ", $query))
  let $start := 1
  let $end := 10
  return
    if (map:get($params,"lex1word") or map:get($params,"lex2word")) then
      document{
        <chart>
          {
            element {"group"}
            {
              attribute {if (map:get($params,"lex1word")) then "lex1" else "lex2"}
              {if (map:get($params,"lex1word")) then map:get($params,"lex1word") else map:get($params,"lex2word")},
              let $lex := if (map:get($params,"lex1word")) then $lex2 else $lex1
              let $word-query := if (map:get($params,"lex1word")) then
              (: Designed for attribute values in the form of <lex1 canonical="VALUE" />.  Change accordingly for content. :)
                cts:element-value-query(xs:QName($lex1), map:get($params,"lex1word"))
              else
              (: Designed for attribute values in the form of <lex2 canonical="VALUE" />.  Change accordingly for content. :)
                cts:element-value-query(xs:QName($lex2), map:get($params,"lex2word"))
              let $shim := xdmp:log(($query, $word-query), "info")

              (: Designed for attribute values in the form of <lex canonical="VALUE" />.  Change accordingly for content. :)
              let $info := xdmp:log((xs:QName($lex), (), ("frequency-order"), cts:and-query(($query, $word-query))), "info")
              for $i in cts:element-values(xs:QName($lex), (), ("frequency-order","collation=http://marklogic.com/collation/en/S1"), cts:and-query(($query, $word-query)))[$start to $end]
              return element {"data"}
              {
                attribute {"value"} {search:add-commas(cts:frequency($i))},
                attribute {if (map:get($params,"lex1word")) then "lex2" else "lex1"} {$i}
              }
            }
          }
          xdmp:log('aaa')
        </chart>
      }
    else
      document{
        <chart>
          {
          (: Designed for attribute values in the form of <lex1 canonical="VALUE" />.  Change accordingly for content. :)
            let $shim := xdmp:log((xs:QName($lex1), xs:QName($lex2), ("frequency-order"), ()),"info")

            for $i in cts:element-value-co-occurrences(xs:QName($lex1), xs:QName($lex2), ("frequency-order","collation=http://marklogic.com/collation/en/S1"),
                ())[1 to 50]

            return <data value="{cts:frequency($i)}" lex1="{$i/cts:value[1]/text()}" lex2="{$i/cts:value[2]/text()}" />
          }
        </chart>
      }

};

declare function put(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
  ) as document-node()?
{
  xdmp:log("Test called")
};

declare function post(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
  ) as document-node()*
{
  let $_ := xdmp:log("Amey")
  let $lex1 := map:get($params, "lex1word")
  let $lex2 := map:get($params, "lex2word")
  let $_ := xdmp:log($lex1)
  let $_ := xdmp:log($lex2)
  let $query := search:build-query(fn:replace(map:get($params,"q"),"&amp;x=0&amp;y=0",""), map:get($params,"constraint"))
  let $shim := xdmp:log(fn:concat("Widget query: ", $query))
  let $start := 1
  let $end := 10
  let $_ := xdmp:log(xdmp:get-request-field("lex1word"))

  return
    if (map:get($params,"lex1word") or map:get($params,"lex2word")) then
      document{
        <chart>
          {
            element {"group"}
            {
              for $i in cts:element-values(xs:QName("City"), (), ("frequency-order","collation=http://marklogic.com/collation/en/S1"))[1 to 10]
              return element {"data"}
              {
                attribute {"value"} {search:add-commas(cts:frequency($i))},
                attribute {"lex2"} {$i}
              }
            }
          }
          xdmp:log('aaa')
        </chart>
      }
    else
      document{
        <chart>
          {
          (: Designed for attribute values in the form of <lex1 canonical="VALUE" />.  Change accordingly for content. :)

            for $i in cts:element-value-co-occurrences(xs:QName("Service_Area"), xs:QName("City"), ("frequency-order","collation=http://marklogic.com/collation/en/S1"),
                ())[1 to 50]

            return <data value="{cts:frequency($i)}" lex1="{$i/cts:value[1]/text()}" lex2="{$i/cts:value[2]/text()}" />
          }
        </chart>
      }
};

declare function delete(
  $context as map:map,
  $params  as map:map
  ) as document-node()?
{
  xdmp:log("DELETE called")
};
