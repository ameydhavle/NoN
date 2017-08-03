xquery version "1.0-ml";

module namespace res = "http://marklogic.com/rest-api/resource/map-links-merchants";

import module namespace json = "http://marklogic.com/xdmp/json" at "/MarkLogic/json/json.xqy";
import module namespace sem = "http://marklogic.com/semantics" at "/MarkLogic/semantics.xqy";


declare function res:get(
  $context as map:map,
  $params  as map:map
) as document-node()*
{
  let $subject := map:get($params, "subject")
  return res:build-graph($subject, map:get($params, "expand") = "true")
};


declare function res:build-graph(
  $subjects,
  $is-expand as xs:boolean
  )
{
  let $nodes := json:array()
  let $edges := json:array()
  let $nodes-map := map:map()
  let $edges-map := map:map()
  let $edges-count-map := map:map()
  let $edges-volume-map := map:map()

  let $_ :=
	  for $subject in $subjects
	  let $results := cts:search(
		  fn:collection("merchant-wire"),
		  cts:element-value-query(
		    xs:QName("Sender_Name"),
		    $subject
		  )
		)

	  let $results-obj := cts:search(
		  fn:collection("merchant-wire"),
		  cts:element-value-query(
		    xs:QName("Receiver_Name"),
		    $subject
		  )
		)

	  return
	    (
	      if ($is-expand) then ()
	      else
	        let $node := json:object()
	        let $label := $subject
	        let $props := res:get-object-props($subject)
	        return (
	          map:put($node, "label", $label),
	          map:put($node, "id", $subject),
	          map:put($node, "metadata", $props),
	          map:put($node, "group", res:get-object-group($subject)),
	          map:put($node, "edgeCount", res:get-edge-count($subject)),
	          map:put($node, "location", res:get-object-location($subject)),
	          map:put($nodes-map, $subject, $node)
	        ),

	      for $result in $results
	      let $node := json:object()
	      let $object := $result//Receiver_Name/data()
	      let $props := res:get-object-props($object)
	      let $edge-id := "edge-" || $subject || "-" || $object
	      let $_ := map:put($edges-count-map, $edge-id, (map:get($edges-count-map, $edge-id), 1))
	      let $_ :=
	      	if (fn:exists($result//Amount)) then
	      		map:put($edges-volume-map, $edge-id, (map:get($edges-volume-map, $edge-id), $result//Amount/data()))
	      	else
	      		()

	      return (
	        map:put($node, "label", $object),
	        map:put($node, "id", $object),
	        map:put($node, "metadata", $props),
	        map:put($node, "group", res:get-object-group($object)),
	        map:put($node, "edgeCount", res:get-edge-count($object)),
	        map:put($node, "location", res:get-object-location($object)),
	        map:put($nodes-map, $object, $node),

	        let $edge := json:object()
	        let $edge-meta := json:object()
	        return (
	        	map:put($edge-meta, "from", $subject),
	          map:put($edge-meta, "to", $object),
	          map:put($edge-meta, "label", "sent"),
	          map:put($edge-meta, "type", "sent"),
	          map:put($edge-meta, "transCount", fn:count(map:get($edges-count-map, $edge-id))),
	          map:put($edge-meta, "transVolume", fn:sum(map:get($edges-volume-map, $edge-id))),
	          map:put($edge, "id", $edge-id),
	          map:put($edge, "from", $subject),
	          map:put($edge, "to", $object),
	          map:put($edge, "label", "sent"),
	          map:put($edge, "type", "sent"),
	          map:put($edge, "metadata", $edge-meta),
	          map:put($edges-map, $edge-id, $edge)
	        )
	      ),

	      for $result in $results-obj
	      let $node := json:object()
	      let $object := $result//Sender_Name/data()
	      let $props := res:get-object-props($object)
	      let $edge-id := "edge-" || $object || "-" || $subject
	      let $_ := map:put($edges-count-map, $edge-id, (map:get($edges-count-map, $edge-id), 1))
	      let $_ :=
	      	if (fn:exists($result//Amount)) then
	      		map:put($edges-volume-map, $edge-id, (map:get($edges-volume-map, $edge-id), $result//Amount/data()))
	      	else
	      		()

	      return (
	        map:put($node, "label", $object),
	        map:put($node, "id", $object),
	        map:put($node, "metadata", $props),
	        map:put($node, "group", res:get-object-group($object)),
	        map:put($node, "edgeCount", res:get-edge-count($object)),
	        map:put($node, "location", res:get-object-location($object)),
	        map:put($nodes-map, $object, $node),

	        let $edge := json:object()
	        let $edge-meta := json:object()
	        return (
	        	map:put($edge-meta, "from", $object),
	          map:put($edge-meta, "to", $subject),
	          map:put($edge-meta, "label", "sent"),
	          map:put($edge-meta, "type", "sent"),
	          map:put($edge-meta, "transCount", fn:count(map:get($edges-count-map, $edge-id))),
	          map:put($edge-meta, "transVolume", fn:sum(map:get($edges-volume-map, $edge-id))),
	          map:put($edge, "id", $edge-id),
	          map:put($edge, "from", $object),
	          map:put($edge, "to", $subject),
	          map:put($edge, "label", "sent"),
	          map:put($edge, "type", "sent"),
	          map:put($edge, "metadata", $edge-meta),
	          map:put($edges-map, $edge-id, $edge)
	        )
	      )
	    )

  (: Move node data from map to array. :)
  let $_ :=
    for $key in map:keys($nodes-map)
    return
      json:array-push($nodes, map:get($nodes-map, $key))

  (: Move node data from map to array. :)
  let $_ :=
    for $key in map:keys($edges-map)
    return
      json:array-push($edges, map:get($edges-map, $key))

  return
    document {
      xdmp:to-json(
        let $data-object := json:object()
        let $_ := map:put($data-object, "nodes", $nodes)
        let $_ := map:put($data-object, "edges", $edges)
        return $data-object
      )
    }

};

declare private function res:get-types($subjects as xs:string*) as node()*
{
  <x>{cts:triples($subjects ! sem:iri(.), sem:iri("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"))}</x>/*
};

declare private function res:retrieve-type(
  $types as node()*,
  $uri as xs:string
) as xs:string?
{
  ($types[sem:subject = $uri]/sem:object/string(), "unknown")[1]
};

declare private function res:get-label($subject as xs:string) as xs:string
{
  let $tokens := tokenize($subject, "/")
  return
    if (count($tokens) = 1) then $subject
    else $tokens[last() - 1] || "/" || $tokens[last()]
};

declare private function res:get-edge-count($subject) as xs:int
{
	let $count := xdmp:estimate(
		cts:search(
			fn:collection("merchant-wire"),
			cts:or-query((
				cts:element-value-query(xs:QName("Receiver_Name"), $subject),
				cts:element-value-query(xs:QName("Sender_Name"), $subject)
			))
		)
	)

	return $count
};

declare private function res:get-object-props($subject as xs:string) as json:object
{
	let $results := cts:search(
	  fn:collection("merchants"),
	  cts:element-range-query(xs:QName("Company_Name"), "=", $subject, ("collation=http://marklogic.com/collation/en/S1"))
	)
  let $node := json:object()
  let $_ :=
    if ($results and fn:count($results) > 0) then
    	(
    		map:put($node, "name", $subject),
    		map:put($node, "type", "merchant"),
    		map:put($node, "edgeCount", res:get-edge-count($subject)),
    		if (fn:exists($results[1]//Lat)) then
	      	let $_ := map:put($node, "latitude", xs:float($results[1]//Lat[1]/data()))
	      	let $_ := map:put($node, "longitude", xs:float($results[1]//Long[1]/data()))
	      	return $node
	      else
	      	()
	      ,
	      if (fn:exists($results[1]//group)) then
	    		map:put($node, "group", $results[1]//group/text())
	      else
	      	map:put($node, "group", "unknown")
	      ,
	      if (fn:exists($results[1]//Company_Contact)) then
	    		map:put($node, "companyContact", $results[1]//Company_Contact/text())
	      else
	      	map:put($node, "companyContact", "unknown")
	      ,
	      if (fn:exists($results[1]//Employees)) then
	    		map:put($node, "employees", $results[1]//Employees/text())
	      else
	      	map:put($node, "employees", "unknown")
	      ,
	      if (fn:exists($results[1]//Revenue)) then
	    		map:put($node, "revenue", $results[1]//Revenue/text())
	      else
	      	map:put($node, "revenue", "unknown")
	      ,
	      if (fn:exists($results[1]//Industry)) then
	    		map:put($node, "industry", $results[1]//Industry/text())
	      else
	      	map:put($node, "industry", "unknown")
	    )
    else
      ()

  return $node
};

declare private function res:get-object-location($subject as xs:string) as json:object
{
	let $results := cts:search(
	  fn:collection("merchants"),
	  cts:element-range-query(xs:QName("Company_Name"), "=", $subject, ("collation=http://marklogic.com/collation/en/S1"))
	)
  let $node := json:object()
  let $_ :=
    if ($results and fn:count($results) > 0) then
    	if (fn:exists($results[1]//Lat)) then
      	let $_ := map:put($node, "latitude", xs:float($results[1]//Lat[1]/data()))
      	let $_ := map:put($node, "longitude", xs:float($results[1]//Long[1]/data()))
      	return $node
      else
      	()
    else
      ()

  return $node
};

declare private function res:get-object-group($subject as xs:string) as xs:string
{
	let $results := cts:search(
	  fn:collection("merchants"),
	  cts:element-range-query(xs:QName("Company_Name"), "=", $subject, ("collation=http://marklogic.com/collation/en/S1"))
	)
  let $group :=
    if ($results and fn:count($results) > 0) then
    	if (fn:exists($results[1]//group)) then
    		$results[1]//group/text()
      else
      	"unknown"
    else
      "unknown"

  return $group
};
