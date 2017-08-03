xquery version "1.0-ml";
import module namespace functx = "http://www.functx.com" at "/MarkLogic/functx/functx-1.0-nodoc-2007-01.xqy";
for $i in (1 to 1250)
return
  let $random-customer := xdmp:random(fn:count(fn:collection('customers')) - 1)
  let $random := xdmp:random(fn:count(fn:collection("merchants")))
  let $_ := fn:collection("merchants")[$random]
  let $tmp-cust := fn:collection('customers')[$random-customer]
  let $transaction :=
    <transaction>
      <record>
        <Transaction_Date>{fn:current-date()}</Transaction_Date>
        <Service_Area>Credit Card Swipe</Service_Area>
        <Account_Description/>
        <Creditor>
          <SIC_Code>{if(fn:string-length($_//SIC_Code/text()) > 0) then $_//SIC_Code/text() else "123123"}</SIC_Code>
          <Company_Name>{if(fn:string-length($_//Company_Name/text()) > 0) then $_//Company_Name/text() else "Best Buy"}</Company_Name>
          <Spending_Category>{if(fn:string-length($_//Industry/text()) > 0) then $_//Industry/text() else "Electronics and Gadgets"}</Spending_Category>
        </Creditor>
        <CCNumber>{$tmp-cust//CCNumber/text()}</CCNumber>
        <Amount>{xdmp:random(1000)+10}</Amount>
      </record>
    </transaction>
  return
    if(fn:string-length($transaction/record/Creditor) > 0 )
    then
      (xdmp:document-insert(fn:concat('/events/creditcard/',xdmp:random(100000000)+10,'.xml'), $transaction,(),'transactions')
      )
    else()
