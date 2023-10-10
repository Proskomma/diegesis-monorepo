<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common">
    <xsl:output method="text"/>

    <xsl:template match="/">
        <xsl:text>Key&#09;nParas&#09;nRefs&#09;nMarkRefs&#10;</xsl:text>
        <xsl:apply-templates select="all/items/item[@typename='Article']"/>
    </xsl:template>

    <xsl:template match="item">
        <xsl:value-of select="@name"/>
        <xsl:text>&#09;</xsl:text>
        <xsl:value-of select="count(body/p)"/>
        <xsl:text>&#09;</xsl:text>
        <xsl:value-of select="count(body//a[@href[contains(., 'bref')]])"/>
        <xsl:text>&#09;</xsl:text>
        <xsl:value-of select="count(body//a[@href[contains(., 'bref')]][contains(., 'Mk')])"/>
        <xsl:text>&#10;</xsl:text>
    </xsl:template>

</xsl:stylesheet>
