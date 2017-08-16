xquery version "1.0-ml";

module namespace res = "http://marklogic.com/rest-api/resource/merchant-summary";

import module namespace json = "http://marklogic.com/xdmp/json" at "/MarkLogic/json/json.xqy";
import module namespace sem = "http://marklogic.com/semantics" at "/MarkLogic/semantics.xqy";


declare function res:get(
  $context as map:map,
  $params  as map:map
) as document-node()*
{
  let $subject := map:get($params, "subject")
  return res:build-data($subject)
};

declare function res:build-data($subject)
{
  let $data := json:object()
  let $outgoing-data := json:object()
  let $outgoing-tx := json:array()
  let $incoming-data := json:object()
  let $incoming-tx := json:array()

  let $outgoing-trans := cts:search(
	  fn:collection("wire-transfers"),
    	  cts:json-property-value-query(
    	    "CDT_NAME1",
    	    $subject
    	  )
    	)[1 to 10]

  let $incoming-trans := cts:search(
	  fn:collection("wire-transfers"),
	  cts:json-property-value-query(
	    "DBT_NAME1",
	    $subject
	  )
	)[1 to 10]

	let $_ :=
		for $i in $outgoing-trans
		let $tx := json:object()
		let $_ := (
			map:put($tx, "type", "Outgoing"),
			map:put($tx, "date", $i/message/Date/data()),
			map:put($tx, "amount", $i/message/Amount/data()),
			map:put($tx, "merchant", $i/message/Beneficiary/Beneficiary_Name/data())
		)
		return json:array-push($outgoing-tx, $tx)

	let $_ :=
		for $i in $incoming-trans
		let $tx := json:object()
		let $_ := (
			map:put($tx, "type", "Incoming"),
			map:put($tx, "date", $i/message/Date/data()),
			map:put($tx, "amount", $i/message/Amount/data()),
			map:put($tx, "merchant", $i/message/Sender/Sender_Name/data())
		)
		return json:array-push($incoming-tx, $tx)

	let $_ := (
		map:put($outgoing-data, "count", fn:count($outgoing-trans)),
		map:put($outgoing-data, "amount", fn:sum($outgoing-trans//Amount/data())),
		map:put($incoming-data, "count", fn:count($incoming-trans)),
		map:put($incoming-data, "amount", fn:sum($incoming-trans//Amount/data())),
		map:put($data, "id", $subject),
		map:put($data, "label", fn:replace($subject, "_", " ")),
		map:put($data, "uri", res:get-merchant-uri($subject)),
		map:put($data, "cashflow", (map:get($incoming-data, "amount") - map:get($outgoing-data, "amount"))),
		map:put($data, "outgoingSummary", $outgoing-data),
		map:put($data, "outgoingTransactions", $outgoing-tx),
		map:put($data, "incomingSummary", $incoming-data),
		map:put($data, "incomingTransactions", $incoming-tx)
	)

  return
    document {
      xdmp:to-json($data)
    }

};

declare private function res:get-merchant-uri($subject as xs:string) as xs:string
{
	let $results := cts:search(
	  fn:collection("wire-transfers"),
	  cts:json-property-range-query("CDT_NAME1", "=", $subject, ("collation=http://marklogic.com/collation/en/S1"))
	)
  let $uri :=
    if ($results and fn:count($results) > 0) then
    	xdmp:node-uri($results[1])
    else
      ()

  return $uri
};
