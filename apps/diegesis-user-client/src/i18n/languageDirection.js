import langTable from "../i18n/languages.json"

const directionText = function directionText(lang) {
    return langTable[lang]['textDirection']    
}

const alignmentText = function alignmentText(lang) {
    return (langTable[lang]['textDirection']==='rtl' ? "right" : "left")
}
export {directionText,alignmentText}
