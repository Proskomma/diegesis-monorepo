export const i18nTables = {
  en: {
     HOME_TITLE:'Creative Commons Scripture Resources to Go!' ,
     HOME_PHRASE:'Diegesis is a place to find Bibles and related resources, in a variety of formats, released under open licences. (In other words, you can use, share, improve and translate them.)',
     HOME_CONTENT:'You can see the content ',
     HOME_HERE:'here',
     FOOTER_START:'Diegesis.Bible is a project by ',
     FOOTER_END:' that uses the',
     FOOTER_LINK:' Proskomma Scripture Runtime Engine',
     WHO_TITLE:`Who's behind Diegesis? `,
     WHO_SUBTITLE1:`The Data`,
     WHO_SUBTITLE2:`The Software`,
     WHO_PARAGRAPHE1:`Diegesis pulls data from a number of major open-access archives including:`,
     WHO_DIGI:`The Digital Bible Library`,
     WHO_DOOR:`Door 43`,
     WHO_BIBLE:`eBible`,
     WHO_VACHAN:`Vachan`,
     WHO_PARAGRAPHE2:`The Diegesis project is led by Mark Howe from`,
     HOW_TITLE:`Diegesis Technology`,
     HOW_PHRASE:`Diegesis is an open-source project. The source code is hosted on `,
     HOW_SUITE_PHRASE:`Internally, Diegesis makes extensive use of the ` ,
     HOW_ENGINE: `Proskomma Scripture Runtime Engine`,
     HOW_END_PHRASE: 'to parse and process Scripture content.'
  },
  fr: {
      HOME_TITLE:'Ressources bibliques Creative Commons à emporter!' ,
      HOME_PHRASE:`Diegesis est un endroit pour trouver des bibles et des ressources connexes, dans une variété de formats, publiés sous licences ouvertes. (En d'autres termes, vous pouvez les utiliser, les partager, les améliorer et les traduire.)`,
      HOME_CONTENT:'Vous pouvez voir le contenu par ',
      HOME_HERE:'ici',
      FOOTER_START:'Diegesis.Bible est un projet de ',
      FOOTER_END:' qui utilise le ',
      FOOTER_LINK:` Moteur d'exécution des écritures Proskomma`,
      WHO_TITLE:`Qui est derrière Diegesis ?`,
      WHO_SUBTITLE1:`Les Données`,
      WHO_SUBTITLE2:`Les Logiciels`,
      WHO_PARAGRAPHE1:`Diegesis extrait des données d'un certain nombre d'archives majeures en libre accès, notamment :`,
      WHO_DIGI:`La bibliothèque biblique numérique`,
      WHO_DOOR:`Porte 43`,
      WHO_BIBLE:`eBible`,
      WHO_VACHAN:`Vachan`,
      WHO_PARAGRAPHE2:`Le projet Diegesis est dirigé par Mark Howe de`,
      HOW_TITLE:`Technologie Diegesis`,
      HOW_PHRASE:`Diegesis est un projet open source. Le code source est hébergé sur `,
      HOW_SUITE_PHRASE:`En interne, Diegesis utilise largement ` ,
      HOW_ENGINE: `le moteur d'exécution Proskomma Scripture`,
      HOW_END_PHRASE: 'pour analyser et traiter le contenu des Écritures.'
  }
};

const substituteArgs = function (str , args) {
  let ret = str 
  let n = 0
  for (const arg of args || []){
    ret = ret.replace(`{${n}}`,arg)
    n++
  }
  return ret;
}

export default function i18n(lang, key,args) {
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

// module.exports = i18n ;