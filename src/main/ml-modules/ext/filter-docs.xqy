xquery version '1.0-ml';

import module namespace functx = "http://www.functx.com" at "/MarkLogic/functx/functx-1.0-nodoc-2007-01.xqy";
import module namespace trgr = 'http://marklogic.com/xdmp/triggers' at '/MarkLogic/triggers.xqy';

declare namespace html = "http://www.w3.org/1999/xhtml";
declare namespace p360 = "http://marklogic.com/solutions/p360";
declare namespace rdf = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
declare namespace resources ="http://marklogic.com/solutions/p360/resource";
declare namespace skos = "http://www.w3.org/2004/02/skos/core#";

declare variable $trgr:uri as xs:string external;

let $add-coll := xdmp:document-add-collections($trgr:uri, "processed-binary")
let $_ := xdmp:log("Trigger invoked for binary processing")
let $doc := fn:doc($trgr:uri)
let $content := xdmp:document-filter(fn:doc($trgr:uri))
let $title := functx:replace-multi(functx:substring-after-last($trgr:uri, '/'),'%20',' ')

let $_ := xdmp:document-insert(
    fn:concat('/artifact/',$trgr:uri,'.xml'),
    <artifact>
      <title>{$title}</title>
      <metadata>{fn:concat(fn:concat('/artifact/',$trgr:uri,'.xml'))}</metadata>
      <uri>{$trgr:uri}</uri>
      <submitted-timestamp>{current-date()}</submitted-timestamp>
      <submitted-by>{xdmp:get-current-user()}</submitted-by>

      <content>{$content}</content>
    </artifact>,
    xdmp:default-permissions(),
    ( 'documents'),
    ()
  )

return xdmp:log("Updating artifact line items" )
