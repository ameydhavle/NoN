xquery version "1.0-ml";
import module namespace functx = "http://www.functx.com" at "/MarkLogic/functx/functx-1.0-nodoc-2007-01.xqy";
for $i in (1 to 2500)
return
  let $random-customer := xdmp:random(fn:count(fn:collection('customers')) - 1)
  let $tmp-cust := fn:collection('customers')[$random-customer]
  let $transaction :=
    <transaction>
      <record>
        <Transaction_Date>{fn:current-date()}</Transaction_Date>
        <Service_Area>Cash Deposits</Service_Area>
        <Account_Description/>
        <AccountNum>{$tmp-cust//AccountNum/text()}</AccountNum>
        <Amount>{xdmp:random(10000)+10}</Amount>
      </record>
    </transaction>
  let $_ := xdmp:log("Creating cash deposit transaction ")
  return
    if(fn:string-length($transaction/record/AccountNum) > 0 )
    then
      (xdmp:document-insert(fn:concat('/events/deposits/',xdmp:random(100000000)+10,'.xml'), $transaction,(),'transactions'))
    else()
