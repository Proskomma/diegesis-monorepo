import langTable from "../i18n/languages.json"

const directionText = function directionText(lang) {
    const lTable = langTable[lang]
    return (lTable ? lTable['textDirection'] : lang)
}

const setFontFamily = function setFontFamily(lang) {
    const lTable = langTable[lang]
    return (lTable ? lTable['fontFamily'] : 'Arial')
}

const alignmentText = function alignmentText(lang) {
    const lTable = langTable[lang]
    const textDirection = lTable ? lTable['textDirection'] : "ltr"
    return (textDirection==='rtl' ? "right" : "left")
}

const getAutonym = function getAutonym(lang){
    const lTable = langTable[lang]
    return (lTable ? lTable['autonym'] : lang)
}
export {directionText,alignmentText,getAutonym,setFontFamily}
