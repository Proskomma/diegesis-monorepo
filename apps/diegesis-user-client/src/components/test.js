const regex =
  /^(("[HG][0-9]{3,5}")||("[A-Z0-9]{3}[ ]{1}[0-9]+:[0-9]+")||("[A-Z0-9]{3}[ ]{1}[0-9]+")||("[A-Za-z]+"))$/;
const StrongsRegex = /^"[HG][0-9]{3,5}"$/;
const BCVRegex = /^"[A-Z0-9]{3}[ ]{1}[0-9]+:[0-9]+"$/;
const BCRegex = /^"[A-Z0-9]{3}[ ]{1}[0-9]+"$/;
const TextRegex = /^"[A-Za-z]+"$/;

const matchingWords = function matchingWords() {
  const ret = [];
  const text = '"H2032""G523""5NH 6""ADV 2:25""hguuvg""1SA 5:1"';
  let str = "";
  for (let t = 0; t < text.length; t++) {
    if (!str.match(StrongsRegex)) {
      str += text[t];
      console.log("str :", str);
    }
    if (str.match(StrongsRegex)) {
      ret.push([str.match(StrongsRegex).input, "Strongs"]);
      str = "";
      console.log(ret);
    }
    if (str.match(BCVRegex)) {
      ret.push([str.match(BCVRegex).input, "BCV"]);
      str = "";
      console.log(ret);
    }
    if (str.match(BCRegex)) {
      ret.push([str.match(BCRegex).input, "BC"]);
      str = "";
      console.log(ret);
    }
    if (str.match(TextRegex)) {
      ret.push([str.match(TextRegex).input, "text"]);
      str = "";
      console.log(ret);
    }
  }
};

matchingWords();

//   const matchingWords = function matchingWords() {
//     const ret = XRegExp.match('G2012 H222',StrongsRegex,'all');
//     console.log(ret)
// }
