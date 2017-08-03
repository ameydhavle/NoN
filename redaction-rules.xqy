xquery version "1.0-ml";
import module namespace rdt = "http://marklogic.com/xdmp/redaction"
    at "/MarkLogic/redaction.xqy";
let $rules := (
<rules>
  <rule>
    <name>redact-name</name>
    <collection>deterministic</collection>
    <rdt:rule xml:lang="zxx"
        xmlns:rdt="http://marklogic.com/xdmp/redaction">
      <rdt:path>//name</rdt:path>
      <rdt:method>
        <rdt:function>mask-deterministic</rdt:function>
      </rdt:method>
      <rdt:options>
        <length>10</length>
      </rdt:options>
    </rdt:rule>
  </rule>
  <rule>
    <name>redact-alias</name>
    <collection>random</collection>
    <rdt:rule xml:lang="zxx"
        xmlns:rdt="http://marklogic.com/xdmp/redaction">
      <rdt:path>//alias</rdt:path>
      <rdt:method>
        <rdt:function>mask-random</rdt:function>
      </rdt:method>
      <rdt:options>
        <length>10</length>
      </rdt:options>
    </rdt:rule>
  </rule>
  <rule>
    <name>redact-address</name>
    <collection>conceal</collection>
    <rdt:rule xml:lang="zxx"
        xmlns:rdt="http://marklogic.com/xdmp/redaction">
      <rdt:path>//address</rdt:path>
      <rdt:method>
        <rdt:function>conceal</rdt:function>
      </rdt:method>
    </rdt:rule>
  </rule>
  <rule>
    <name>redact-ssn</name>
    <collection>ssn</collection>
    <rdt:rule xml:lang="zxx"
        xmlns:rdt="http://marklogic.com/xdmp/redaction">
      <rdt:path>//ssn</rdt:path>
      <rdt:method>
        <rdt:function>redact-us-ssn</rdt:function>
      </rdt:method>
      <rdt:options>
        <level>partial</level>
      </rdt:options>
    </rdt:rule>
  </rule>
  <rule>
    <name>redact-phone</name>
    <collection>phone</collection>
    <rdt:rule xml:lang="zxx"
        xmlns:rdt="http://marklogic.com/xdmp/redaction">
      <rdt:path>//phone</rdt:path>
      <rdt:method>
        <rdt:function>redact-us-phone</rdt:function>
      </rdt:method>
      <rdt:options>
        <level>full</level>
      </rdt:options>
    </rdt:rule>
  </rule>
  <rule>
    <name>redact-email</name>
    <collection>email</collection>
    <rdt:rule xml:lang="zxx"
        xmlns:rdt="http://marklogic.com/xdmp/redaction">
      <rdt:path>//email</rdt:path>
      <rdt:method>
        <rdt:function>redact-email</rdt:function>
      </rdt:method>
      <rdt:options>
        <level>name</level>
      </rdt:options>
    </rdt:rule>
  </rule>
  <rule>
    <name>redact-ip</name>
    <collection>ip</collection>
    <rdt:rule xml:lang="zxx"
        xmlns:rdt="http://marklogic.com/xdmp/redaction">
      <rdt:path>//ip</rdt:path>
      <rdt:method>
        <rdt:function>redact-ipv4</rdt:function>
      </rdt:method>
      <rdt:options>
        <character>X</character>
      </rdt:options>
    </rdt:rule>
  </rule>
  <rule>
    <name>redact-id</name>
    <collection>regex</collection>
    <rdt:rule xml:lang="zxx"
        xmlns:rdt="http://marklogic.com/xdmp/redaction">
      <rdt:path>//id</rdt:path>
      <rdt:method>
        <rdt:function>redact-regex</rdt:function>
      </rdt:method>
      <rdt:options>
        <pattern>\d{{2}}[-.\s]\d{{7}}</pattern>
        <replacement>NN-NNNNNNN</replacement>
      </rdt:options>
    </rdt:rule>
  </rule>
</rules>
)
return 
for $r in $rules/rule
  return xdmp:document-insert(
    fn:concat("/rules/", $r/name, ".xml"),
    $r/rdt:rule,
    xdmp:default-permissions(), ("all",$r/collection)
  )