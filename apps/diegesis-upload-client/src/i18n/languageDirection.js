import langTable from "./languages.json";

function directionText(lang) {
  return langTable[lang]["textDirection"];
}

const fontFamily = function fontFamily(lang) {
  const lTable = langTable[lang]
  return (lTable ? lTable['fontFamily'] : 'Arial')
}

function otherDirectionText(lang) {
  if (langTable[lang]["textDirection"] === "rtl") {
    return "left";
  } else {
    return "right";
  }
}

function alignmentText(lang) {
  return langTable[lang]["textDirection"] === "rtl" ? "right" : "left";
}
export { directionText, alignmentText, otherDirectionText,fontFamily };
