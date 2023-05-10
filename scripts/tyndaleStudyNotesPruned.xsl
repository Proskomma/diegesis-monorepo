<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="xml" indent="yes"/>

    <xsl:template match="/">
        <items release="1.25">
            <xsl:copy-of select="items/item[starts-with(@name, 'Gen') or starts-with(@name, 'Jon') or starts-with(@name, 'Tit') or starts-with(@name, 'Ruth')]"/>
        </items>
    </xsl:template>

</xsl:stylesheet>
