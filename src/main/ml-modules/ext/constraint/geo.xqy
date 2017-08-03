xquery version "1.0-ml";
(:
Copyright 2002-2015 MarkLogic Corporation.  All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
:)

module namespace viz-geo = "http://marklogic.com/appservices/viz/geo";


(:~ Custom geo constraint generates geo facet required by vizlogic map widget as generated by appbuilder

The search options for this constraint takes the following form;

<search:constraint name="g1">
  <search:custom facet="true">
    <search:parse apply="parse-structured" ns="http://marklogic.com/appservices/viz/geo" at="/application/constraint/geo.xqy"/>
    <search:start-facet apply="start" ns="http://marklogic.com/appservices/viz/geo" at="/application/constraint/geo.xqy"/>
    <search:finish-facet apply="finish" ns="http://marklogic.com/appservices/viz/geo" at="/application/constraint/geo.xqy"/>
    <search:facet-option>limit=10000</search:facet-option>
   </search:custom>
  <search:annotation>
    <search:geo-elem-pair>
      <search:heatmap n="89" e="179" s="-89" w="-179" latdivs="60" londivs="60"/>
      <search:parent ns="http://where.yahooapis.com/v1/schema.rng" name="centroid"/>
      <search:lat ns="http://where.yahooapis.com/v1/schema.rng" name="latitude"/>
      <search:lon ns="http://where.yahooapis.com/v1/schema.rng" name="longitude"/>
      <search:fragment-scope>documents</search:fragment-scope>
    </search:geo-elem-pair>
  </search:annotation>
</search:constraint>

Where a search:annotation element is used to pass information into the custom constraint. This form is useful as it
also means we can reuse existing appbuilder mechanisms in terms of storage and serialisation.

The custom constraint can be configured with the following geospatial indexes
    element-pair
    element-attribute-pair
    element-child
    element

The custom constraint works by being supplied a region coordinates (currently polygon and box are required,
though circle is also provided).

    polygon - used by shape selection tool on map widget
    box - used by bounded box viewer representing current map

These coordinates are parsed by viz-geo:parse-structured which returns a cts:query

The resultant facet generates boxes (like a normal geo constraint) with one additional feature. Boxes that contain a single result
also return the results URI. This is the mechanism by which infowindow marker popups information can be resolved in map widget.
Additionally this approach solves the too many marker problem as when combined with map clustering we get an efficient mechanism for
displaying marker results on maps without having to process all documents at any single point in time.

<search:boxes name="g1">
  <search:box count="1" s="-41.251" w="174.738" n="-41.251" e="174.738" uri="/oscars/10706140308139091511.xml"/>
  <search:box count="2" s="-33.8696" w="151.207" n="-33.8696" e="151.207"/>
  <search:box count="1" s="-27.4744" w="151.465" n="-27.4744" e="151.465" uri="/oscars/3814498056511212380.xml"/>
  <search:box count="1" s="-26.2147" w="27.9644" n="-26.2147" e="27.9644" uri="/oscars/10998054346110744581.xml"/>
  <search:box count="1" s="-24.4378" w="121.079" n="-24.4378" e="121.079" uri="/oscars/216047631647363141.xml"/>
  <search:box count="1" s="-24.9121" w="133.398" n="-24.9121" e="133.398" uri=""/>
  <search:box count="7" s="0" w="0" n="0" e="0"/>
  ....
  <search:box count="1" s="47.9496" w="9.08004" n="47.9496" e="9.08004" uri="/oscars/2468258861346492737.xml"/>
  <search:box count="1" s="48.3274" w="-101.602" n="48.3274" e="-101.602" uri="/oscars/2741944610551048706.xml"/>
  <search:box count="1" s="49.5" w="8.50196" n="49.5" e="8.50196" uri="/oscars/3824896039895273449.xml"/>
  <search:box count="3" s="48.2201" w="16.3799" n="48.2201" e="16.3799"/>
  <search:box count="1" s="50.6745" w="-4.65333" n="50.6745" e="-4.65333" uri="/oscars/11014120719800860979.xml"/>
  <search:box count="29" s="51.3534" w="-2.61508" n="51.5983" e="-0.01825"/>
  <search:box count="4" s="51.1024" w="0.02898" n="51.6044" e="1.3313"/>
  <search:box count="1" s="50.8484" w="4.34968" n="50.8484" e="4.34968" uri="/oscars/2573315925884411439.xml"/>
  <search:box count="3" s="51.8934" w="-4.21481" n="52.4045" e="-3.98512"/>
  <search:box count="9" s="52.4949" w="-3.08374" n="53.3693" e="-0.55617"/>
  <search:box count="2" s="53.8913" w="-68.4311" n="53.8913" e="-68.4311"/>
  <search:box count="2" s="53.4688" w="-9.72094" n="53.4688" e="-9.72094"/>
  <search:box count="3" s="53.4046" w="-6.30543" n="54.5943" e="-5.9262"/>
  <search:box count="8" s="53.4017" w="-2.56157" n="54.3473" e="-0.52763"/>
  <search:box count="5" s="59.3337" w="17.9801" n="59.3337" e="17.9801"/>
</search:boxes>

The map widget is only dependent upon this facet and does not need to refer to search results at any stage.

:)

import module namespace impl = "http://marklogic.com/appservices/search-impl"
at "/MarkLogic/appservices/search/search-impl.xqy";

declare namespace search = "http://marklogic.com/appservices/search";
declare default function namespace "http://www.w3.org/2005/xpath-functions";

import schema namespace opt = "http://marklogic.com/appservices/search"
at "search.xsd";

declare variable $viz-geo:query-options as xs:string* := ("coordinate-system=wgs84", "boundaries-included", "cached");
declare variable $viz-geo:basediv := 100;
declare variable $viz-geo:mapzoom := 10;
declare variable $viz-geo:n := 89.99999999;
declare variable $viz-geo:e := 179.99999999;
declare variable $viz-geo:s := -89.99999999;
declare variable $viz-geo:w := -179.99999999;
declare variable $viz-geo:type := "pinmap";

declare variable $viz-geo:min-div := 10;
declare variable $viz-geo:max-div := 100;

declare variable $viz-geo:lat-offset := .001;
declare variable $viz-geo:lon-offset := .001;

(:~ viz-geo:parse-structured - generates cts:query for box and polygon geospatial queries
 :
 :
 : @param $query-elem
 : @param $options
 :
 : @return cts:query (which is modified to return results from both properties and documents)
 :)
declare function viz-geo:parse-structured(
  $query-elem as element(),
  $options as element(search:options))
as cts:query
{
  let $annotations := fn:tokenize($query-elem/search:annotation,',')
  let $maptype     := $annotations[1]
  let $zoom     := fn:number( ($annotations[2],1)[1] )

  let $_ := (
    xdmp:set($viz-geo:type, $maptype),
    xdmp:set($viz-geo:mapzoom, $zoom),
    if ($zoom gt 10) then xdmp:set($viz-geo:basediv, $viz-geo:min-div)
    else xdmp:set($viz-geo:basediv, $viz-geo:max-div),
    xdmp:set($viz-geo:n, fn:number($query-elem/search:box/search:north)),
    xdmp:set($viz-geo:e, fn:number($query-elem/search:box/search:east)),
    xdmp:set($viz-geo:s, fn:number($query-elem/search:box/search:south)),
    xdmp:set($viz-geo:w, fn:number($query-elem/search:box/search:west))
  )
  let $constraint  := viz-geo:_constraintHelper($options/search:constraint[@name eq $query-elem/search:constraint-name])
  let $region :=
    typeswitch($query-elem/(search:box|search:polygon))
      case element(search:box)
        return
          cts:box($viz-geo:s,$viz-geo:w,$viz-geo:n,$viz-geo:e)
      case element(search:polygon)
        return
          element cts:region {
            attribute xsi:type { "cts:polygon" },
            string-join(
              (for $point in $query-elem/search:polygon/search:point
              return
                concat($point/search:latitude,"," ,$point/search:longitude))
              ,' ')
          }
      default return xdmp:log('viz-geo:parse-structured: no match for parse structured')
  let $geospatial-query := viz-geo:_generateGeospatialQuery($constraint,$region)
  return
    cts:or-query( ($geospatial-query, cts:properties-fragment-query($geospatial-query)) )

};


(:~ viz-geo:start - concurrent optimised query that returns search boxes
 :
 : first item returned is constraint name, which is then followed by the box regions themselves
 :
 : @param $constraint
 : @param $query
 : @param $facet-options
 : @param $quality-weight
 : @param $forests
 :
 : @return item()*
 :)
declare function viz-geo:start(
  $constraint as element(search:constraint),
  $query as cts:query?,
  $facet-options as xs:string*,
  $quality-weight as xs:double?,
  $forests as xs:unsignedLong*)
as item()*
{
  typeswitch(viz-geo:_constraintHelper($constraint)/(opt:geo-elem-pair|opt:geo-attr-pair|opt:geo-elem))
    case element(opt:geo-elem-pair)
      return (fn:string($constraint/@name),impl:heatmap-elem-pair-facet-start(viz-geo:_constraintHelper($constraint),$query,impl:facet-options($constraint), $quality-weight, $forests))
    case element(opt:geo-attr-pair)
      return (fn:string($constraint/@name),impl:heatmap-attr-pair-facet-start(viz-geo:_constraintHelper($constraint),$query,impl:facet-options($constraint), $quality-weight, $forests))
    case element(opt:geo-elem)
      return (fn:string($constraint/@name),impl:heatmap-elem-facet-start(viz-geo:_constraintHelper($constraint),$query,impl:facet-options($constraint), $quality-weight, $forests))
    default
      return xdmp:log("viz-geo:start- no match for geo constraint")
};



(:~ viz-geo:finish - processes start output, when there is just a single result then do subsequent search to lookup uri
 :
 :
 : @param $start
 : @param $constraint
 : @param $query
 : @param $facet-options
 : @param $quality-weight
 : @param $forests
 :
 : @return element(search:boxes)
 :
 :)
declare function viz-geo:finish(
  $start as item()*,
  $constraint as element(search:constraint),
  $query as cts:query?,
  $facet-options as xs:string*,
  $quality-weight as xs:double?,
  $forests as xs:unsignedLong*)
as element(search:boxes)
{
  let $constraint := viz-geo:_constraintHelper( $constraint [@name eq $start[1]])
  return
    element search:boxes {
      $constraint/@name,
      attribute count {fn:sum(for $i in fn:tail($start) return cts:frequency($i))},
      for $i in fn:tail($start)
      let $freq := cts:frequency($i)
      return
        element search:box {
          attribute count { $freq },
          attribute s { cts:box-south($i) },
          attribute w { cts:box-west($i)  },
          attribute n { cts:box-north($i) },
          attribute e { cts:box-east($i)  },
          if ($freq eq 1) then
            let $region := cts:box($i)
            let $geo :=  viz-geo:_generateGeospatialQuery($constraint,$region)
            let $uri := cts:search(/,$geo)
            return
              if($uri) then
                attribute uri{ base-uri($uri[1])}
              else
              (: if search fails, widen box to account for implicit cast rounding :)
                let $s := xs:float(cts:box-south($i)) - $viz-geo:lat-offset
                let $w := xs:float(cts:box-west($i))  - $viz-geo:lon-offset
                let $n := xs:float(cts:box-north($i)) + $viz-geo:lat-offset
                let $e := xs:float(cts:box-east($i))  + $viz-geo:lon-offset
                let $region := "[" || $s ||","|| $w || "," || $n || "," ||$e || "]"
                let $geo :=  viz-geo:_generateGeospatialQuery($constraint,cts:box($region))
                let $uri := cts:search(/,$geo)
                return
                  attribute uri{ base-uri($uri[1])}
          else
            ()
        }
    }
};


(:~ viz-geo:_constraintHelper - extracts geospatial search constraint from custom constraint
 :
 :  as an optimisation, if a pinmap, the heatmap bounding box is defined as the current map widget view bounds
 :
 : @param - custom constraint
 :
 : @return - search:constraint
 :)
declare private function viz-geo:_constraintHelper($constraint) as element(opt:constraint) {
  element opt:constraint { $constraint/@name,
  element {QName("http://marklogic.com/appservices/search",local-name($constraint/search:annotation/*))}{
    <search:heatmap n="{$viz-geo:n}" e="{$viz-geo:e}"  s="{$viz-geo:s}" w="{$viz-geo:w}" latdivs="{$viz-geo:basediv}" londivs="{$viz-geo:basediv}"/>,
    $constraint/search:annotation/(opt:geo-elem-pair|opt:geo-attr-pair|opt:geo-elem)/search:parent,
    $constraint/search:annotation/(opt:geo-elem-pair|opt:geo-attr-pair|opt:geo-elem)/search:element,
    $constraint/search:annotation/(opt:geo-elem-pair|opt:geo-attr-pair|opt:geo-elem)/search:lat,
    $constraint/search:annotation/(opt:geo-elem-pair|opt:geo-attr-pair|opt:geo-elem)/search:lon,
    $constraint/search:annotation/(opt:geo-elem-pair|opt:geo-attr-pair|opt:geo-elem)/search:fragment-scope
  }
  }
};


(:~ viz-geo:_generateGeospatialQuery - generate geospatial cts:query
 :
 : supports 4 geospatial query types
 :
 :           element-pair-geospatial-query
 :           element-attirbute-pair-geospatial-query
 :           element-child-geospatial-query
 :           element-geospatial-query
 :
 : @param constraint
 : @param region
 :
 : @return cts geospatial query
 :)
declare private function viz-geo:_generateGeospatialQuery($constraint,$region){
  typeswitch($constraint/(search:geo-elem-pair|search:geo-attr-pair|search:geo-elem))
    case element(search:geo-elem-pair)
      return
        cts:element-pair-geospatial-query(
          QName($constraint/search:geo-elem-pair/search:parent/@ns, $constraint/search:geo-elem-pair/search:parent/@name),
          QName($constraint/search:geo-elem-pair/search:lat/@ns, $constraint/search:geo-elem-pair/search:lat/@name),
          QName($constraint/search:geo-elem-pair/search:lon/@ns, $constraint/search:geo-elem-pair/search:lon/@name),
          $region,$viz-geo:query-options)
    case element(search:geo-attr-pair)
      return
        cts:element-attribute-pair-geospatial-query(
          QName($constraint/search:geo-attr-pair/search:parent/@ns, $constraint/search:geo-attr-pair/search:parent/@name),
          QName($constraint/search:geo-attr-pair/search:lat/@ns, $constraint/search:geo-attr-pair/search:lat/@name),
          QName($constraint/search:geo-attr-pair/search:lon/@ns, $constraint/search:geo-attr-pair/search:lon/@name),
          $region,$viz-geo:query-options)
    case element(search:geo-elem)
      return
        if($constraint/search:geo-elem/search:parent) then
          cts:element-child-geospatial-query (
            QName($constraint/search:geo-elem/search:parent/@ns, $constraint/search:geo-elem/search:parent/@name),
            QName($constraint/search:geo-elem/search:element/@ns, $constraint/search:geo-elem/search:element/@name),
            $region,$viz-geo:query-options)
        else
          cts:element-geospatial-query(
            QName($constraint/search:geo-elem/search:element/@ns, $constraint/search:geo-elem/search:element/@name),
            $region,$viz-geo:query-options)
    default
      return ()
};
