xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/createCentralMerchant";


declare function get(
  $context as map:map,
  $params  as map:map
  ) as document-node()*
{
  xdmp:log("GET called")
};

declare function put(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
  ) as document-node()?
{
	(:
	let $key-merch := cts:search(
	    fn:collection("merchants"),
	    cts:element-value-query(xs:QName("group"), "outNetwork"),
	    ("unfiltered")
	  )[1]/envelope
  :)
	let $key-merch :=
		<envelope>
		  <headers>
		    <last_updated>17:51:19-05:00</last_updated>
		    <last_updated_by>admin</last_updated_by>
		    <source>MLCP</source>
		    <collection>merchants admin-merchants</collection>
		    <group>outNetwork</group>
		  </headers>
		  <metadata>
		    <transaction-data/>
		    <geo-data>
		      <Zipcode>N/A</Zipcode>
		      <ZipCodeType></ZipCodeType>
		      <City>Aleppo</City>
		      <State>N/A</State>
		      <Lat>36.2043</Lat>
		      <Long>37.1475</Long>
		      <Location>Syria</Location>
		    </geo-data>
		  </metadata>
		  <triples/>
		  <content>
		    <Company_Name>Franks_Beverages</Company_Name>
		    <Address>37_Lake_Avenue_Ext</Address>
		    <City>Aleppo</City>
		    <State></State>
		    <Zip></Zip>
		    <County></County>
		    <Phone_Number>Not_in_Sample</Phone_Number>
		    <Fax_Number>Not_in_Sample</Fax_Number>
		    <Company_Contact>Fred Smith</Company_Contact>
		    <Contact_Title>Owner</Contact_Title>
		    <Employees>54</Employees>
		    <Revenue>4544900</Revenue>
		    <Industry>Gasoline_Service_Stations_and_Automotive_Dealers_(Automotive)</Industry>
		    <SIC_Code></SIC_Code>
		    <SIC_Code_Description></SIC_Code_Description>
		    <Website></Website>
		  </content>
		</envelope>
	let $_ := xdmp:document-insert(
		"/data/merchants/merchant-000001.xml",
		$key-merch,
		(),
		("merchants", fn:concat(xdmp:get-current-user(), "-merchants"))
	)

	let $merchants := fn:collection("merchants")

	let $_ := xdmp:log("key merch name: ")
	let $_ := xdmp:log($key-merch/content)

	let $_ :=
	  for $merch at $index in $merchants
	  let $uri := fn:concat("/events/merchant/wire/68392283003-", $index, ".xml")
	  let $merch-name := $key-merch/envelope/content/Company_Name/text()
	  let $linked-merch-name := $merch/envelope/content/Company_Name/text()
	  let $tran :=
	    <message>
	      <Sender>
	        <Sender_Name>{$merch/envelope/content/Company_Name/text()}</Sender_Name>
	        <Sender_Address>{$merch/envelope/content/Address/text()}</Sender_Address>
	        <Sender_City>{$merch/envelope/content/City/text()}</Sender_City>
	        <Sender_State>{$merch/envelope/content/State/text()}</Sender_State>
	        <Sender_Zip>{$merch/envelope/content/Zip/text()}</Sender_Zip>
	      </Sender>
	      <Receiver>
	        <Receiver_Name>{$key-merch/content/Company_Name/text()}</Receiver_Name>
	        <Receiver_Address>{$key-merch/content/Address/text()}</Receiver_Address>
	        <Receiver_City>{$key-merch/content/City/text()}</Receiver_City>
	        <Receiver_State>{$key-merch/content/State/text()}</Receiver_State>
	        <Receiver_Zip>{$key-merch/content/Zip/text()}</Receiver_Zip>
	      </Receiver>
	      <IBFT>40770</IBFT>
	      <REF>61246</REF>
	      <NONREF/>
	      <Date>2017-02-16-05:00</Date>
	      <Currency>USD</Currency>
	      <Amount>99999</Amount>
	      <Beneficiary>
	        <Beneficiary_Name>{$key-merch/content/Company_Name/text()}</Beneficiary_Name>
	        <Beneficiary_Address>{$key-merch/content/Address/text()}</Beneficiary_Address>
	        <Beneficiary_City>{$key-merch/content/City/text()}</Beneficiary_City>
	        <Beneficiary_State>{$key-merch/content/State/text()}</Beneficiary_State>
	        <Beneficiary_Zip>{$key-merch/content/Zip/text()}</Beneficiary_Zip>
	      </Beneficiary>
	      <Notes/>
	    </message>

	  return
	    if ($merch-name eq $linked-merch-name) then
	      ()
	    else
	      xdmp:document-insert($uri, $tran, (), ("merchant-wire", "merchant-wire-generated"))

  return xdmp:log("Created central merchant")
};

declare function post(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
  ) as document-node()*
{
  xdmp:log("POST called")
};

declare function delete(
  $context as map:map,
  $params  as map:map
  ) as document-node()?
{
  xdmp:log("DELETE called")
};
