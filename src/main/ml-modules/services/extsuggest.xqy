xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/extsuggest";

import module namespace search = "http://marklogic.com/appservices/search"
at "/MarkLogic/appservices/search/search.xqy";

declare namespace roxy = "http://marklogic.com/roxy";

(: label information for json properties :)
declare variable $constraints := map:new((
  map:entry("tags", "Customer Classification"),
  map:entry("Service_Area", "Customer Transaction Area"),
  map:entry("Company_Name", "Business Name"),
  map:entry("City", "City"),
  map:entry("State", "State"),
  map:entry("UniqueCarrier", "Unique Carrier")
));

(: json properties to show with a json property :)
declare variable $contraint-fields := map:new((
  map:entry("tags", ("Company_Name","City","State","Service_Area")),
  map:entry("Service_Area", ("Company_Name","City","State","tags")),
  map:entry("Company_Name", ("City","State","tags","Service_Area")),
  map:entry("State", ("Company_Name","City","tags","Service_Area")),
  map:entry("City", ("Company_Name","State","tags","Service_Area")),
  map:entry("UniqueCarrier", ("Origin","Dest","FlightNum"))
));

(: for protential future use so items other than json properties may be used :)
declare variable $contraint-references := map:new(());

(: for protential future use so items other than json properties may be used :)
declare variable $contraint-query-builder := map:new(());

(: regex for wildcarding all-consonant abbreviations:)
declare variable $consonants := "[bcdfghjklmnpqrstvwxyz]";
declare variable $abbrev-regex := "(^|\s)"||$consonants||"+(/s|$)";

(:
 : returns suggestions based off of specified json properties
 :)
declare
%roxy:params("qtext=xs:string")
function resource:get(
    $context as map:map,
    $params  as map:map
) as document-node()*
{
  let $output-types := map:put($context,"output-types", "application/json")
  let $qtext := map:get($params, "qtext")
  let $qtext :=
    (: wildcard all consonant abbreviations :)
    fn:string-join(
        for $part in fn:analyze-string($qtext, $abbrev-regex, "i")/*
        return
          if ($part instance of element(fn:match)) then
            fn:string-join(
                for $char in (fn:string-to-codepoints($part) ! fn:codepoints-to-string(.))
                return (
                  $char,
                  if (fn:matches($char, $consonants, "i")) then
                    "*"
                  else ()
                ),
                ""
            )
          else
            fn:string($part),
        ""
    )
  let $matching-contraints :=
    resource:find-matching-constriants(
        (: tokenize query by commas for multi-field search, exclude empty strings :)
        fn:tokenize($qtext, "\s*,\s*")[. ne ''],
        map:keys($constraints),
        (),
        ()
    )
  return (xdmp:set-response-code(200,"OK"), document {
    object-node {
    "results": array-node {
      fn:subsequence(
          for $matching-contraint in $matching-contraints
          let $fields := $matching-contraint/fields
          let $tuples := $matching-contraint/results
          (: order in by number matches :)
          order by fn:count($tuples) descending
          return
            for $tuple at $tup-pos in $tuples
            let $tuple-values := $tuple/tuple
            let $obj := json:object(document {map:new((
            (: if first tuple, add label info for UI :)
            if ($tup-pos eq 1) then (
              map:entry("labels",
                  json:to-array(
                      for $constraint in $fields
                      return map:get($constraints, $constraint)
                  )
              )
            ) else (),
            map:entry("keys", $fields),
            map:entry("uri", $tuple-values[1]),
            for $field at $field-pos in $fields
            let $tuple-val-pos := $field-pos + 1
            return
              map:entry($field, $tuple-values[$tuple-val-pos])
            ))}/*)
            return
              $obj,
          1,
          20
      )
    }
    }

  })
};

(:
  recursive function to find matches. There are multiple tree branches involved.
  $qtext-parts, which is the query text tokenized by commas
  $constraint-keys, which are the json property names we are using to build constraints from
  :)
declare function resource:find-matching-constriants($qtext-parts, $constraint-keys, $matching-contraints, $additional-query)
{

  if (fn:empty($constraint-keys)) then
    $matching-contraints
  else
    let $constraint := fn:head($constraint-keys)
    let $suggestion-source := resource:build-suggestion-source($constraint, $additional-query)
    let $current-qtext := fn:head($qtext-parts)
    let $qtext :=
      (
        $current-qtext,
        (: If there is a number, get the text version as well :)
        if (fn:matches($current-qtext, "(^|\s)[0-9]{1,3}(\s|$)")) then
          resource:number-to-text($current-qtext)
        else ()
      )
    (: get matching values based off of search suggest :)
    let $constraint-values :=
      $qtext ! search:suggest(
          (: add opening quote to look for matches at the begining of property values,
          and add wildcard at the end :)
          ('"' || . || '*'),
          $suggestion-source
          (: remove the opening quote from the suggestion for our tuple queries later :)
      ) ! fn:replace(., '^"', '')
    let $count := fn:count($constraint-values)
    return
      resource:find-matching-constriants(
          $qtext-parts,
          (: Look at the next json property to find matches :)
          fn:tail($constraint-keys),
          (
          (: if there are matches on this json property, keep looking :)
          if ($count gt 0) then
            let $constraint-values-query := resource:build-query($constraint, $constraint-values)
            let $additional-qtext-parts := fn:tail($qtext-parts)
            (: use the additional queries to build a trail of visited properties :)
            let $visited-constraints :=
              (
                $additional-query ! cts:json-property-value-query-property-name(.),
                $constraint
              )
            return
            (: if there are additional query parts, search for matching properties on those
                   queries.
                 :)
              if (fn:exists($additional-qtext-parts)) then
                resource:find-matching-constriants(
                    $additional-qtext-parts,
                    (: ensure we don't get in an infinite loop by excluding visited properties :)
                    map:keys($constraints)[fn:not(. = $visited-constraints)],
                    $matching-contraints,
                    (: add another query to ensure we're restricting the possible matches :)
                    (
                      $additional-query,
                      $constraint-values-query
                    )
                )
              (: otherwise return an object with matching tuples information :)
              else
              (: use no more than 4 fields from concat of visited properties and properties associated from property :)
                let $fields :=
                  fn:subsequence(
                      fn:distinct-values((
                        $visited-constraints,
                        map:get($contraint-fields, $constraint)
                      )),
                      1,
                      4
                  )
                return
                  object-node {
                  "name": $constraint,
                  "values": array-node {
                    $constraint-values
                  },
                  "fields": array-node {$fields},
                  "results": array-node {
                    for $tuple in cts:value-tuples(
                        (cts:uri-reference(),$fields ! resource:build-reference(.)),
                        "limit=20",
                        cts:and-query((
                          $constraint-values-query,
                          $additional-query
                        ))
                    )
                    return
                      object-node {
                      "tuple": $tuple
                      }
                  }
                  }
          (: otherwise this property has no matches, so move on :)
          else (),
          $matching-contraints
          ),
          $additional-query
      )
};


(: build index reference based off of a provided json property name :)
declare function resource:build-reference($name)
{
  if (map:contains($contraint-references, $name)) then
    map:get($contraint-references, $name)
  else
    cts:element-reference(fn:QName("", $name), ("collation=http://marklogic.com/collation/en/S1"))
};

(: build suggestion source based off of a provided json property name and additional queries :)
declare function resource:build-suggestion-source($name, $additional-queries) {
  <search:options xmlns="http://marklogic.com/appservices/search">
    <additional-query>
      <cts:and-query>{
        $additional-queries
      }</cts:and-query>
    </additional-query>
    <default-suggestion-source>
      <range collation="http://marklogic.com/collation/en/S1"
      type="xs:string" facet="true">
        <element ns=""
        name="{$name}"/>
      </range>
    </default-suggestion-source>
  </search:options>
};

(: build query based off of a provided json property name and value :)
declare function resource:build-query($name, $value)
{
  if (map:contains($contraint-references, $name)) then
    map:get($contraint-query-builder, $name)($value)
  else
    cts:json-property-value-query(
        $name,
        (
          $value,
          if ($value castable as xs:double) then
            fn:number($value)
          else ()
        ),
        ("case-insensitive", "punctuation-insensitive", "whitespace-insensitive")
    )
};

(: BEGIN logic for converting number digits to their word equivilent :)

declare variable $single-digits :=
  map:new((
    map:entry("1","one"),
    map:entry("2","two"),
    map:entry("3","three"),
    map:entry("4","four"),
    map:entry("5","five"),
    map:entry("6","six"),
    map:entry("7","seven"),
    map:entry("8","eight"),
    map:entry("9","nine")
  ));

declare variable $special-two-digits :=
  map:new((
    map:entry("10","ten"),
    map:entry("11","eleven"),
    map:entry("12","twelve"),
    map:entry("13","thirteen"),
    map:entry("14","fourteen"),
    map:entry("15","fifteen"),
    map:entry("16","sixteen"),
    map:entry("17","seventeen"),
    map:entry("18","eighteen"),
    map:entry("19","nineteen")
  ));

declare variable $tens :=
  map:new((
    map:entry("2","twenty"),
    map:entry("3","thirty"),
    map:entry("4","forty"),
    map:entry("5","fifty"),
    map:entry("6","sixty"),
    map:entry("7","seventy"),
    map:entry("8","eighty"),
    map:entry("9","ninety")
  ));

(: Converts numbers 0-999 to text version :)
declare function resource:number-to-text($text as xs:string)
{
  fn:string-join(
      (: Find number matches :)
      for $part in fn:analyze-string($text, "[0-9]+")/*
      return
        if ($part instance of element(fn:match)) then
          let $length := fn:string-length($part)
          return
          (: If number is 3 or less digits, convert to text :)
            if ($length le 3) then
            (: pad the number with zeros so we are working with consistent number placement :)
              let $pad :=
                fn:string-join(for $i in (1 to 3 - $length)  return "0", "") || $part
              let $char1 := fn:substring($pad, 1, 1)
              let $char2 := fn:substring($pad, 2, 1)
              let $char3 := fn:substring($pad, 3, 1)
              return
                if ($pad eq '000') then
                  'zero'
                else
                  fn:string-join(
                      (
                        if ($char1 ne '0') then
                          (map:get($single-digits, $char1),"hundred")
                        else (),
                        (: handle ten differently than other powers of ten :)
                        if ($char2 eq '1') then
                          map:get($special-two-digits, $char2 || $char3)
                        else
                          (map:get($tens,$char2), map:get($single-digits, $char3))
                      ),
                      " ")
            else
              $part
        else
          fn:string($part),
      ""
  )
};
(: BEGIN logic for converting number digits to their word equivilent :)

