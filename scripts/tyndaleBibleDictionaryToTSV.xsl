<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common">
    <xsl:output method="text"/>

    <xsl:variable name="selectedArticles">
        <key>Bishop</key>
        <key>Blasphemy</key>
        <key>Christ</key>
        <key>Circumcision</key>
        <key>Crete</key>
        <key>DeaconDeaconess</key>
        <key>Elder</key>
        <key>Faith</key>
        <key>Glory</key>
        <key>Gospel</key>
        <key>Grace</key>
        <key>Holiness</key>
        <key>Hope</key>
        <key>Lord</key>
        <key>PaultheApostle</key>
        <key>Philippi</key>
        <key>Savior</key>
        <key>Servant</key>
        <key>TimothyPerson</key>
        <key>TitusPerson</key>
        <key>Wisdom</key>
    </xsl:variable>

    <xsl:template match="/">
        <xsl:apply-templates select="all/items/item[@typename='Article']"/>
    </xsl:template>

    <xsl:template match="item">
        <xsl:variable name="itemName" select="@name"/>
        <xsl:if test="exsl:node-set($selectedArticles)/key[.=$itemName]">
            <xsl:value-of select="@name"/>
            <xsl:text>&#09;</xsl:text>
            <xsl:for-each select="body/p">
                <xsl:apply-templates select="."/>
                <xsl:text>\n\n</xsl:text>
            </xsl:for-each>
            <xsl:text>&#10;</xsl:text>
        </xsl:if>
    </xsl:template>

    <xsl:template match="span[@class='sn-ref']">
    </xsl:template>

    <xsl:template match="span[@class='sn-excerpt']">
        <xsl:text>**</xsl:text>
        <xsl:apply-templates select="node()"/>
        <xsl:text>**</xsl:text>
    </xsl:template>

    <xsl:template match="span[@class='hebrew' or @class='ital']">
        <xsl:text>*</xsl:text>
        <xsl:apply-templates select="node()"/>
        <xsl:text>*</xsl:text>
    </xsl:template>

    <xsl:template match="a[@href]">
        <xsl:text>*</xsl:text>
        <xsl:apply-templates select="node()"/>
        <xsl:text>*</xsl:text>
    </xsl:template>

    <xsl:template match="text()">
        <xsl:value-of select="normalize-space(.)"/>
    </xsl:template>

</xsl:stylesheet>
