import i18nTables from "./languageTexts/index" 

const substituteArgs = function (str , args) {
  let ret = str 
  let n = 0
  for (const arg of args || []){
    ret = ret.replace(`{${n}}`,arg)
    n++
  }
  return ret;
}

export default function i18n(lang, key, args) {
  if(i18nTables[lang] === 'debug'){
    return 'debug mode'
  }
  if(!i18nTables[lang]){
    throw new Error(`NOLANG ${lang}`)
  }
  else if(i18nTables[lang][key]){
    return substituteArgs(i18nTables[lang][key],args)
  }
  else if(i18nTables['en'][key]){
    return substituteArgs(i18nTables['en'][key],args)
  }
  else {
    return `??${key}??`
  }
}
