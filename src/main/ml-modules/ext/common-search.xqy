xquery version "0.9-ml"
(: Copyright 2002-2011 MarkLogic Corporation.  All Rights Reserved. :)
(:~ 
: Main library module for all cts:query operations for co-occurrence visualization widgets.  This is based on element-attribute range indices.  Should the content require the use of element-value range indicies, element word lexicons, or attribute word lexicons, this module would have to be adjusted accordingly.
:
: @author MarkLogic Corporation (CS)
: @version 1.1
:)

module "common-search"
import module namespace functx = "http://www.functx.com" at "/MarkLogic/functx/functx-1.0-nodoc-2007-01.xqy"
(:~ 
: Function that builds the free-text query, optionally constrained by a filter/facet.
:
: @param $query-string The free text to search for in the database.
: @param $filters (Optional) Lexicon name and values in which to limit results by.  This takes the form of lex:value;lex:value;lex:value
: @return cts:query
:)
define function build-query($query-string as xs:string, $filters as xs:string*) as cts:query
{
		let $query:= cts:and-query((
			cts:directory-query("/", "infinity"),
			if ($query-string != "") then 
				 for $filter-tokens in fn:tokenize($query-string, "AND")
                                   return
                                    if(fn:contains($filter-tokens, ":"))
                                    then
					let $filter-name := if(fn:contains($filter-tokens, ":")) then fn:substring-before($filter-tokens, ":") else ()  
					let $values := fn:substring-after($filter-tokens, ":")
					let $filter-clean:=fn:replace($filter-name,'\(','')
					let $filter-modified:=functx:trim($filter-clean)
					for $value in fn:tokenize($values, ",")
                                        return if(fn:contains($filter-tokens,"-")) then cts:not-query(cts:element-value-query(xs:QName(fn:replace($filter-modified,'-','')), fn:replace($value,'\)',''))) else cts:element-value-query(xs:QName($filter-modified), fn:replace($value,'\)',''))
                                    else if(fn:contains($filter-tokens,"-")) then cts:not-query(cts:word-query($filter-tokens)) else cts:word-query($filter-tokens)
                          else ()
		))
	return $query 

}

(:~ 
: Utility function to add comma separations to numbers.  e.g.  1000 -> 1,000
:
: @param $num An integer to be commafied
: @return A string representing a commafied version of the inputed number.
:)
define function add-commas($num as xs:integer)
{
	 fn:string-join(
		 fn:reverse(
			 for $i at $x in fn:reverse(for $i in fn:string-to-codepoints(xs:string($num)) return fn:codepoints-to-string($i))
			 return
			 if ($x > 1 and ($x - 1) mod 3 = 0) then 
			 	fn:concat($i, ",") 
			 else $i
		 )
	 , "")
}