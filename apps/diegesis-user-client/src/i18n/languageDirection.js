import langTable from "../i18n/languages.json"

const directionText = function directionText(lang) {
    return langTable[lang]['textDirection']    
}

const alignmentText = function alignmentText(lang) {
    return (langTable[lang]['textDirection']==='rtl' ? "right" : "left")
}

const getAutonym = function getAutonym(lang){
    return (langTable[lang]['autonym'])
}
export {directionText,alignmentText,getAutonym}
