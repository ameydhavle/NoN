xquery version "1.0-ml";

(: Copyright 2002-2011 MarkLogic Corporation.  All Rights Reserved. :)
(:~
: Main module used to derive top X co-occurrence values from 2 selected lexicons for flash tyopgraphic visualization.  This is based on element-attribute range indices.  Should the content require the use of element-value range indicies, element word lexicons, or attribute word lexicons, this module would have to be adjusted accordingly.
:
:Is called with the following HTTP params:
: (e.g.)  n=10&s=1&lex2word=Chemotherapy&lex1=disease&t=word&lex2=treatment&q=heart
: n -- the number of top oc-occurrences to return
: s -- which position off the lexicon to start taking top co-occurrences from.  This, along with n, can be used as the basis for paging.
: lex1 -- the local name of the element of the first lexicon to run co-occurrence analysis on.  It may need the appropriate namespace prefix and declaration to work.
: lex2 -- the local name of the element of the second lexicon to run co-occurrence analysis on.  It may need the appropriate namespace prefix and declaration to work.
: lex1word -- the word in the first lexicon to build a "tree" view on
: lex2word -- the word in the first lexicon to build a "tree" view on
: q -- the word to generate the free text query to limit the lexicon lookups by
:
:
: @author MarkLogic Corporation (CS)
: @version 1.0
:)

import module namespace search = "common-search" at "/common-search.xqy";
import module namespace functx = "http://www.functx.com" at "/MarkLogic/functx/functx-1.0-nodoc-2007-01.xqy";

declare namespace cts = "http://marklogic.com/cts";
let $query := search:build-query(fn:replace(xdmp:get-request-field("q"),"&amp;x=0&amp;y=0",""), xdmp:get-request-field("constraint"))
let $shim := xdmp:log(fn:concat("Widget query: ", $query))
let $shims := xdmp:log(fn:concat("Widget Constraint: ", xdmp:get-request-field("constraint")))
let $start := xs:integer(xdmp:get-request-field("s"))
let $lex1 := xdmp:get-request-field("lex1")
let $lex2 := xdmp:get-request-field("lex2")
let $end := xs:integer(xdmp:get-request-field("n")) - $start + 1
let $log := xdmp:log($lex1 )
return
  if (xdmp:get-request-field("lex1word") or xdmp:get-request-field("lex2word")) then
    <chart>
      {
        element {"group"}
        {
          attribute {if (xdmp:get-request-field("lex1word")) then "lex1" else "lex2"}
          {if (xdmp:get-request-field("lex1word")) then xdmp:get-request-field("lex1word") else xdmp:get-request-field("lex2word")},
          let $lex := if (xdmp:get-request-field("lex1word")) then $lex2 else $lex1
          let $word-query := if (xdmp:get-request-field("lex1word")) then
          (: Designed for attribute values in the form of <lex1 canonical="VALUE" />.  Change accordingly for content. :)
            cts:element-value-query(xs:QName($lex1), xdmp:get-request-field("lex1word"))
          else
          (: Designed for attribute values in the form of <lex2 canonical="VALUE" />.  Change accordingly for content. :)
            cts:element-value-query(xs:QName($lex2), xdmp:get-request-field("lex2word"))
          let $shim := xdmp:log(($query, $word-query), "info")

          (: Designed for attribute values in the form of <lex canonical="VALUE" />.  Change accordingly for content. :)
          let $info := xdmp:log((xs:QName($lex), (), ("frequency-order"), cts:and-query(($query, $word-query))), "info")
          for $i in cts:element-values(xs:QName($lex), (), ("frequency-order","collation=http://marklogic.com/collation/codepoint"), cts:and-query(($query, $word-query)))[$start to $end]
          return element {"data"}
          {
            attribute {"value"} {search:add-commas(cts:frequency($i))},
            attribute {if (xdmp:get-request-field("lex1word")) then "lex2" else "lex1"} {$i}
          }
        }
      }
      xdmp:log('aaa')
    </chart>

  else
    <chart>
      {
      (: Designed for attribute values in the form of <lex1 canonical="VALUE" />.  Change accordingly for content. :)
        let $shim := xdmp:log((xs:QName($lex1), xs:QName($lex2), ("frequency-order"), $query),"info")
        for $i in cts:element-value-co-occurrences(xs:QName($lex1), xs:QName($lex2), ("frequency-order","collation=http://marklogic.com/collation/codepoint"),
            ())[$start to $end]

        return <data value="{search:add-commas(cts:frequency($i))}" lex1="{$i/cts:value[1]/text()}" lex2="{$i/cts:value[2]/text()}" />
      }
      xdmp:log('bb')
    </chart>
