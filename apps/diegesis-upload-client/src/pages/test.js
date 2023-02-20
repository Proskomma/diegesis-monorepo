// const data = ["RUT", "PHP", "RUT", "GEN", "EXO", "LEV", "PHP"];
// // result => ["RUT", "PHP", "GEN", "EXO", "LEV"]

// function dedupe1(l) {
//   let ret = [];
//   for (const el of data) {
//     if (!ret.includes(el)) {
//       ret.push(el);
//     }
//   }
//   return ret;
// }

// console.log(dedupe1(data));

// function dedupe2(l) {
//   let ret = [];
//   for (let n = 0; n < l.length; n++) {
//     if (!l.slice(0, n).includes(l[n])) {
//       ret.push(l[n]);
//     }
//   }
//   return ret;
// }

// console.log(dedupe2(data));

// function dedupe3(l, ret = []) {
//   return l.length === 0
//     ? ret
//     : dedupe3(l.slice(1), ret.includes(l[0]) ? ret : [...ret, l[0]]);
// }

// console.log(dedupe3(data));

const fields = [
  "title",
  "description",
  "langCode",
  "script",
  "copyright",
  "abbreviation",
  "textDirection",
];

const args = [
  "title",
  "description",
  "langCode",
  "script",
  "copyright",
  "abbreviation",
  "gggggg",
];

function compareArrays(fields, args) {
  if (args.length !== fields.length) {
    return "wrong number args";
  }
  if (args.filter((f) => !fields.includes(f)).length !== 0) {
    return `Unexpected fields ${nonValidFields.join(";")}`;
  }
  if (fields.filter((f) => !args.includes(f)).length !== 0) {
    return `Missing fields ${missingFields.join(";")}`;
  }
  return "Good";
}

console.log(compareArrays(fields, args));
