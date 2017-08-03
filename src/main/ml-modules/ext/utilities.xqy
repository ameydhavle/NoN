xquery version "1.0-ml";

module namespace utilities = "http://marklogic.com/utilities";
import module namespace sem = "http://marklogic.com/semantics" at "/MarkLogic/semantics.xqy";
import module namespace functx = "http://www.functx.com" at "/MarkLogic/functx/functx-1.0-nodoc-2007-01.xqy";
import module namespace alert = "http://marklogic.com/xdmp/alert" at "/MarkLogic/alert.xqy";
import module namespace search="http://marklogic.com/appservices/search" at "/MarkLogic/appservices/search/search.xqy";


declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare namespace html = "http://www.w3.org/1999/xhtml";
(:
 : Wrapper function for sending an email
 :)
declare function utilities:alert-config(){
  let $config := alert:make-config(
      "retail-alert-config-uri",
      "dmlc-retail",
      "Alerting config for dmlc-retail",
      <alert:options/> )
  return
    alert:config-insert($config)
};

declare function utilities:alert-action($name, $desc){
  let $action := alert:make-action(
      $name,
      $desc,
      xdmp:modules-database(),
      xdmp:modules-root(),
      ("/ext/alerts-test.xqy"),
      <alert:options>put anything here</alert:options> )
  return
    alert:action-insert("cust360-alert-config-uri", $action)
};

declare function utilities:alert-rule($name,$desc,$alert-value){
  let $_ := xdmp:log("2")
  let $_logger := xdmp:log($alert-value)
  let $_ := xdmp:log("3")
  let $config := alert:make-config(
      "cust360-alert-config-uri",
      "Customer360",
      "Alerting config for Customer 360",
      <alert:options/> )
  let $action := alert:make-action(
      fn:concat("Customer-360 ", $name),
      $desc,
      xdmp:modules-database(),
      xdmp:modules-root(),
      ("/ext/alerts-test.xqy"),
      <alert:options>put anything here</alert:options> )
  let $config :=
      if (alert:config-get("cust360-alert-config-uri"))
      then ()
      else  (alert:config-insert($config),alert:action-insert("cust360-alert-config-uri", $action))

  (:
  alert:make-rule(
  "Customer-360 CC Transaction over 7000 - ",
  "Send an alert when an CC transaction passes 7000",
  0,
  cts:element-range-query(xs:QName("Amount"), ">",
      xs:int(7000)),
  "xdmp:log",
  <alert:options/> )
  :)
  let $rule := alert:make-rule(
      fn:concat("Customer-360 ", $name),
      $desc,
      0, (: equivalent to xdmp:user(xdmp:get-current-user()) :)
      cts:query(search:parse($alert-value)),
      "xdmp:log",
      <alert:options/>)

  let $_ := alert:rule-insert("cust360-alert-config-uri", $rule)
  return "Rule created"
};

declare function utilities:delete-rule($id){
  alert:rule-remove("cust360-alert-config-uri", xs:unsignedLong($id))
};



declare function utilities:add-triple($sub, $pred, $obj)
{
  let $doc := cts:search(collection("customers"),
      cts:element-query(xs:QName("sem:subject"), $sub),
      "score-simple", 1.0, ())[1]
  let $sub := fn:concat('http://marklogic.com/triples/',replace($sub,' ','_'))
  let $pred := fn:concat('http://marklogic.com/',$pred )
  let $obj := fn:concat('http://marklogic.com/triples/' || replace($obj,' ','_'))
  return xdmp:node-insert-child($doc//triples,
      <sem:triple xmlns:sem="http://marklogic.com/semantics">
        <sem:subject>{$sub}</sem:subject>
        <sem:predicate>{$pred}</sem:predicate>
        <sem:object>{$obj}</sem:object>

      </sem:triple>)

(:let $_ := sem:rdf-insert(
      sem:triple(sem:iri($sub),
          sem:iri("http://marklogic.com/isCustomerOf"),
          $obj),(),(),"linkedData")
  return document {" Triple value inserted"}
  :)
};

declare function utilities:add-boost-triple($sub, $obj)
{
  let $insert-triple :=
    sem:rdf-insert(
        sem:triple(sem:iri($sub),
            sem:iri("http://marklogic.com/boostTerms"),
            xs:int($obj)),(),(),"score-boost")
  return document {" Triple value inserted"}
};
