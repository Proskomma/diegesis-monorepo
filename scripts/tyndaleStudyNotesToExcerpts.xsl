<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="text"/>

    <xsl:variable name="bookNames" select="document('tyndale_book_names.xml')/books/book"/>

    <xsl:template match="/">
        <xsl:apply-templates select="items/item"/>
    </xsl:template>

    <xsl:template match="item">
        <xsl:variable name="refText" select="refs/text()"/>
        <xsl:variable name="refBook" select="$bookNames[@tyndale=substring-before($refText, '.')]/@pt"/>
        <xsl:variable name="refFromCh" select="substring-before(substring-after($refText, '.'), '.')"/>
        <xsl:variable name="refFromV">
            <xsl:choose>
                <xsl:when test="contains($refText, '-')">
                    <xsl:value-of
                            select="substring-before(substring-after(substring-after($refText, '.'), '.'), '-')"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="substring-after(substring-after($refText, '.'), '.')"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="refToCh">
            <xsl:choose>
                <xsl:when test="contains($refText, '-')">
                    <xsl:variable name="ref2" select="substring-after($refText, '-')"/>
                    <xsl:choose>
                        <xsl:when test="contains($ref2, '.')">
                            <xsl:value-of select="substring-before($ref2, '.')"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="$refFromCh"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="$refFromCh"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="refToV">
            <xsl:choose>
                <xsl:when test="contains($refText, '-')">
                    <xsl:variable name="ref2" select="substring-after($refText, '-')"/>
                    <xsl:choose>
                        <xsl:when test="contains($ref2, '.')">
                            <xsl:value-of select="substring-after($ref2, '.')"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="$ref2"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="$refFromV"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:value-of select="concat($refBook, ' ', $refFromCh, ':', $refFromV)"/>
        <xsl:text>-</xsl:text>
        <xsl:value-of select="concat($refBook, ' ', $refToCh, ':', $refToV)"/>
        <xsl:text> :: </xsl:text>
        <xsl:apply-templates select="body/p/span[@class='sn-excerpt']"/>
        <xsl:text>&#xA;</xsl:text>
    </xsl:template>

    <xsl:template match="span">
        <xsl:value-of select="text()"/>
        <xsl:text> :: </xsl:text>
    </xsl:template>

</xsl:stylesheet>
