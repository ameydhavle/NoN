xquery version "1.0-ml";
import module namespace functx = "http://www.functx.com" at "/MarkLogic/functx/functx-1.0-nodoc-2007-01.xqy";
for $i in (1 to 500)
return
  let $random-customer := xdmp:random(fn:count(fn:collection('merchants')) - 1)
  let $random := xdmp:random(fn:count(fn:collection('merchants')) - 1)
  let $_ := fn:collection("merchants")[$random]
  let $tmp_cust := fn:collection('merchants')[$random-customer]
  let $transaction :=
    <message>
      <Sender>
        <Sender_Name>{$_//Company_Name/text()}</Sender_Name>
        <Sender_Address>{$_//Address/text()}</Sender_Address>
        <Sender_City>{$_//City/text()}</Sender_City>
        <Sender_State>{$_//State/text()}</Sender_State>
        <Sender_Zip>{$_//Zip/text()}</Sender_Zip>
      </Sender>
      <Receiver>
        <Receiver_Name>{$tmp_cust//Company_Name/text()}</Receiver_Name>
        <Receiver_Address>{$tmp_cust//Address/text()}</Receiver_Address>
        <Receiver_City>{$tmp_cust//City/text()}</Receiver_City>
        <Receiver_State>{$tmp_cust//State/text()}</Receiver_State>
        <Receiver_Zip>{$tmp_cust//Zip/text()}</Receiver_Zip>
      </Receiver>
      <IBFT>{xdmp:random(1000)+10 * 4058}</IBFT>
      <REF>{xdmp:random(1000)+10 * 6058}</REF>
      <NONREF></NONREF>
      <Date>{fn:current-date()}</Date>
      <Currency>USD</Currency>
      <Amount>{xdmp:random(1000)+10 * 10024}</Amount>
      <Beneficiary>
        <Beneficiary_Name>{$tmp_cust//Company_Name/text()}</Beneficiary_Name>
        <Beneficiary_Address>{$tmp_cust//Address/text()}</Beneficiary_Address>
        <Beneficiary_City>{$tmp_cust//City/text()}</Beneficiary_City>
        <Beneficiary_State>{$tmp_cust//State/text()}</Beneficiary_State>
        <Beneficiary_Zip>{$tmp_cust//Zip/text()}</Beneficiary_Zip>
      </Beneficiary>
      <Notes></Notes>
    </message>
  let $_ := xdmp:log("Creating Merchant Network Wire Transaction ")

  return

      xdmp:document-insert(fn:concat('/events/merchant/wire/',xdmp:random(100000000)+10,'.xml'), $transaction,(),'merchant-wire')
