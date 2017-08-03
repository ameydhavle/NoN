xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/createLinkData";

import module namespace sem = "http://marklogic.com/semantics" at "/MarkLogic/semantics.xqy";


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
  let $investor := ('Brokers','Margin','Leverage','Shares','Trading')
  let $parent := ('School','Tuition','College','DayCare','Child Care')
  let $mortgage := ('Mortgage','Realtor','Pre-Approval','Refinance')
  let $maternity := ('Prenatal','Pregnancy','529','Maternity')
  let $renter := ('Rent','rent')
  let $new-home := ('Building Construction','Construction')
  let $small-business := ('Accounting','Management','Wholesale','Business Services')
  let $leisure := ('Eating','Recreation')
  let $auto_owner := ('Automotive','Gasoline')

  for $cust in fn:collection('customers')
  let $level1 :=
    (
      xdmp:node-insert-child($cust//triples,
          <sem:triple xmlns:sem="http://marklogic.com/semantics">
            <sem:subject>{'http://marklogic.com/triples/' || $cust//first_name[1]/text() || '_' || $cust//last_name[1]/text()}</sem:subject>
            <sem:predicate>http://marklogic.com/hasBankAccount</sem:predicate>
            <sem:object>{'http://marklogic.com/triples/' || $cust//content/AccountNum[1]/text()}</sem:object>
          </sem:triple>
      ),
      xdmp:node-insert-child($cust//triples,
          <sem:triple xmlns:sem="http://marklogic.com/semantics">
            <sem:subject>{'http://marklogic.com/triples/' || $cust//first_name[1]/text() || '_' || $cust//last_name[1]/text()}</sem:subject>
            <sem:predicate>http://marklogic.com/hasCreditCard</sem:predicate>
            <sem:object>{'http://marklogic.com/triples/' || $cust//content/CCNumber[1]/text()}</sem:object>
          </sem:triple>
      )
    )
  let $level2 :=
    for $trans in $cust//metadata/transaction-data/record
    return
      (
        xdmp:node-insert-child($cust//triples,
            <sem:triple xmlns:sem="http://marklogic.com/semantics">
              <sem:subject>{'http://marklogic.com/triples/' || $cust//first_name[1]/text() || '_' || $cust//last_name[1]/text()}</sem:subject>
              <sem:predicate>http://marklogic.com/isCustomerOf</sem:predicate>
              <sem:object>{'http://marklogic.com/triples/' || fn:replace($trans//Company_Name[1]/text(),"[\s\(/\),'-]","_")}</sem:object>
            </sem:triple>),
      if($trans/Service_Area/text() eq "Credit Card Swipe")
      then
        if(fn:matches($trans//Spending_Category, $investor))
        then
          (
            if($cust//metadata/tags eq 'Investor') then () else xdmp:node-insert-child($cust//metadata, <tags>Investor</tags>),
            xdmp:node-insert-child($cust//triples,
                <sem:triple xmlns:sem="http://marklogic.com/semantics">
                  <sem:subject>{'http://marklogic.com/triples/' || $cust//first_name[1]/text() || '_' || $cust//last_name[1]/text()}</sem:subject>
                  <sem:predicate>http://marklogic.com/isClassifiedAs</sem:predicate>
                  <sem:object>Investor</sem:object>
                </sem:triple>))
          else if(fn:matches($trans//Spending_Category, $parent))then
          (
            if($cust//metadata/tags eq 'Parent') then () else xdmp:node-insert-child($cust//metadata, <tags>Parent</tags>),
            xdmp:node-insert-child($cust//triples,
                <sem:triple xmlns:sem="http://marklogic.com/semantics">
                  <sem:subject>{'http://marklogic.com/triples/' || $cust//first_name[1]/text() || '_' || $cust//last_name[1]/text()}</sem:subject>
                  <sem:predicate>http://marklogic.com/isClassifiedAs</sem:predicate>
                  <sem:object>Parent</sem:object>
                </sem:triple>))

          else if(fn:matches($trans//Spending_Category, $mortgage))then
            (
              if($cust//metadata/tags eq 'Mortgage') then () else xdmp:node-insert-child($cust//metadata, <tags>Mortgage</tags>),
              xdmp:node-insert-child($cust//triples,
                  <sem:triple xmlns:sem="http://marklogic.com/semantics">
                    <sem:subject>{'http://marklogic.com/triples/' || $cust//first_name[1]/text() || '_' || $cust//last_name[1]/text()}</sem:subject>
                    <sem:predicate>http://marklogic.com/isClassifiedAs</sem:predicate>
                    <sem:object>Mortgage</sem:object>
                  </sem:triple>))

          else if(fn:matches($trans//Spending_Category, $maternity))then
              (
                if($cust//metadata/tags eq 'Expecting-Parent') then () else xdmp:node-insert-child($cust//metadata, <tags>Expecting-Parent</tags>),
                xdmp:node-insert-child($cust//triples,
                    <sem:triple xmlns:sem="http://marklogic.com/semantics">
                      <sem:subject>{'http://marklogic.com/triples/' || $cust//first_name[1]/text() || '_' || $cust//last_name[1]/text()}</sem:subject>
                      <sem:predicate>http://marklogic.com/isClassifiedAs</sem:predicate>
                      <sem:object>Expecting_Parent</sem:object>
                    </sem:triple>)
              )
          else if(fn:matches($trans//Spending_Category, $renter))then
              (
                if($cust//metadata/tags eq 'Renter') then () else xdmp:node-insert-child($cust//metadata, <tags>Renter</tags>),
                  xdmp:node-insert-child($cust//triples,
                      <sem:triple xmlns:sem="http://marklogic.com/semantics">
                        <sem:subject>{'http://marklogic.com/triples/' || $cust//first_name[1]/text() || '_' || $cust//last_name[1]/text()}</sem:subject>
                        <sem:predicate>http://marklogic.com/isClassifiedAs</sem:predicate>
                        <sem:object>Renter</sem:object>
                      </sem:triple>))

          else if(fn:matches($trans//Spending_Category, $new-home))then
             (
                if($cust//metadata/tags eq 'New-Home-Owner') then () else xdmp:node-insert-child($cust//metadata, <tags>New-Home-Owner</tags>),
                    xdmp:node-insert-child($cust//triples,
                        <sem:triple xmlns:sem="http://marklogic.com/semantics">
                          <sem:subject>{'http://marklogic.com/triples/' || $cust//first_name[1]/text() || '_' || $cust//last_name[1]/text()}</sem:subject>
                          <sem:predicate>http://marklogic.com/isClassifiedAs</sem:predicate>
                          <sem:object>New_Home_Owner</sem:object>
                        </sem:triple>))

          else if(fn:matches($trans//Spending_Category, $small-business))then
            (
                if($cust//metadata/tags eq 'Small-Business') then () else xdmp:node-insert-child($cust//metadata, <tags>Small-Business</tags>),
                      xdmp:node-insert-child($cust//triples,
                          <sem:triple xmlns:sem="http://marklogic.com/semantics">
                            <sem:subject>{'http://marklogic.com/triples/' || $cust//first_name[1]/text() || '_' || $cust//last_name[1]/text()}</sem:subject>
                            <sem:predicate>http://marklogic.com/isClassifiedAs</sem:predicate>
                            <sem:object>Small_Business</sem:object>
                          </sem:triple>))

          else if(fn:matches($trans//Spending_Category, $leisure))then
            (
                        if($cust//metadata/tags eq 'Leisure-Life-Style') then () else xdmp:node-insert-child($cust//metadata, <tags>Leisure-Life-Style</tags>),
                        xdmp:node-insert-child($cust//triples,
                            <sem:triple xmlns:sem="http://marklogic.com/semantics">
                              <sem:subject>{'http://marklogic.com/triples/' || $cust//first_name[1]/text() || '_' || $cust//last_name[1]/text()}</sem:subject>
                              <sem:predicate>http://marklogic.com/isClassifiedAs</sem:predicate>
                              <sem:object>Leisure_Life_Style</sem:object>
                            </sem:triple>))

          else if(fn:matches($trans//Spending_Category, $auto_owner))then
                        (
                          if($cust//metadata/tags eq 'Auto-Owner') then () else xdmp:node-insert-child($cust//metadata, <tags>Auto-Owner</tags>),
                          xdmp:node-insert-child($cust//triples,
                              <sem:triple xmlns:sem="http://marklogic.com/semantics">
                                <sem:subject>{'http://marklogic.com/triples/' || $cust//first_name[1]/text() || '_' || $cust//last_name[1]/text()}</sem:subject>
                                <sem:predicate>http://marklogic.com/isClassifiedAs</sem:predicate>
                                <sem:object>Auto_Owner</sem:object>
                              </sem:triple>))

          else(
                          xdmp:node-insert-child($cust//triples,
                              <sem:triple xmlns:sem="http://marklogic.com/semantics">
                                <sem:subject>{'http://marklogic.com/triples/' || $cust//first_name[1]/text() || '_' || $cust//last_name[1]/text()}</sem:subject>
                                <sem:predicate>http://marklogic.com/hasCategoryPreference</sem:predicate>
                                <sem:object>{'http://marklogic.com/triples/' || fn:replace($trans//Spending_Category[1]/text(),"[\s\(/\),'-]","_")}</sem:object>
                              </sem:triple>)
                        )
               else()
      )

  return xdmp:log("PUT called")

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
