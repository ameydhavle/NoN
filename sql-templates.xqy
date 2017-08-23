xquery version "1.0-ml";

declare namespace tde = "http://marklogic.com/xdmp/tde";

let $templates := (
<templates>
	<mytemplate>
		<name>sql-customer</name>
		<collection>sql</collection>
		<template xmlns="http://marklogic.com/xdmp/tde">
			<description>customer</description>
			<context>/envelope/content</context>
			<rows>
				<row>
					<schema-name>main</schema-name>
					<view-name>customer</view-name>
					<columns>
						<column>
							<name>fname</name>
							<scalar-type>string</scalar-type>
							<val>fname</val>
							<invalid-values>ignore</invalid-values>
						</column>
						<column>
							<name>lname</name>
							<scalar-type>string</scalar-type>
							<val>lname</val>
							<invalid-values>ignore</invalid-values>
						</column>
						<column>
							<name>ssn</name>
							<scalar-type>string</scalar-type>
							<val>ssn</val>
							<nullable>true</nullable>
							<invalid-values>ignore</invalid-values>
						</column>
						<column>
							<name>city</name>
							<scalar-type>string</scalar-type>
							<val>city</val>
							<invalid-values>ignore</invalid-values>
						</column>
						<column>
							<name>state</name>
							<scalar-type>string</scalar-type>
							<val>state</val>
							<invalid-values>ignore</invalid-values>
						</column>
						<column>
							<name>zip</name>
							<scalar-type>string</scalar-type>
							<val>zip</val>
							<invalid-values>ignore</invalid-values>
						</column>
						<column>
							<name>mortgage_id</name>
							<scalar-type>string</scalar-type>
							<val>mortgage_id</val>
							<nullable>true</nullable>
							<invalid-values>ignore</invalid-values>
						</column>
					</columns>
				</row>
			</rows>
		</template>
	</mytemplate>
	<mytemplate>
		<name>sql-event</name>
		<collection>sql</collection>
		<template xmlns="http://marklogic.com/xdmp/tde">
			<description>events</description>
			<context>/envelope/event</context>
			<rows>
				<row>
					<schema-name>main</schema-name>
					<view-name>event</view-name>
					<columns>
						<column>
							<name>date</name>
							<scalar-type>string</scalar-type>
							<val>date</val>
							<invalid-values>ignore</invalid-values>
						</column>
						<column>
							<name>title</name>
							<scalar-type>string</scalar-type>
							<val>title</val>
							<invalid-values>ignore</invalid-values>
						</column>
						<column>
							<name>mortgage_id</name>
							<scalar-type>string</scalar-type>
							<val>mortgage_id</val>
							<nullable>true</nullable>
							<invalid-values>ignore</invalid-values>
						</column>
						<column>
							<name>caller_name</name>
							<scalar-type>string</scalar-type>
							<val>caller_name</val>
							<invalid-values>ignore</invalid-values>
						</column>
						<column>
							<name>transcript</name>
							<scalar-type>string</scalar-type>
							<val>transcript</val>
							<invalid-values>ignore</invalid-values>
						</column>
					</columns>
				</row>
			</rows>
		</template>
	</mytemplate>
</templates>
)

return
for $r in $templates/mytemplate
  return xdmp:document-insert(
    fn:concat("/tde/", $r/name, ".xml"),
    $r/tde:template,
    xdmp:default-permissions(), ("all", "http://marklogic.com/xdmp/tde", $r/collection)
  )
