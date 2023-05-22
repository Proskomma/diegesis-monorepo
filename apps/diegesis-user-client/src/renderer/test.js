// import { renderStyles as styles } from "./renderStyles";
const styles = require("./renderStyles").renderStyles;

const StyleAsCSS = ({ options }) => {
  console.log(options);
  let cssResult = "";
  for (const op in options) {
    console.log("op :", op);
    cssResult += `${op} {`;
    const styles = options[op];
    for (const prop in styles) {
      console.log("prop :", prop);
      cssResult += `${prop}: ${styles[prop]};`;
    }
    cssResult += "}";
  }
  console.log("Res :", cssResult);
};

const res = StyleAsCSS(styles.paras);
console.log(res);
