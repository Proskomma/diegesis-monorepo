const path = require('path');
const fse = require('fs-extra');
const xre = require('xregexp');

const usage = "node index.js <source> <dest>";
if (process.argv.length !== 4) {
    throw new Error(`Wrong number of arguments\n${usage}`);
}

const inputPath = path.resolve(process.argv[2]);
if (!fse.pathExistsSync(inputPath)) {
    throw new Error(`Input path ${inputPath} does not exist\n${usage}`);
}

const outputPath = path.resolve(process.argv[3]);
if (fse.pathExistsSync(outputPath)) {
    throw new Error(`Input path ${outputPath} already exists\n${usage}`);
}

const unpackRef = ref => {
    let [fromCV, toSomething] = ref.split('-');
    if (!toSomething) {
        toSomething = fromCV;
    }
    let [fromC, fromV] = fromCV.split(':');
    if (!fromV) {
        fromV = fromC;
        fromC = 1;
    }
    let toC;
    let toV;
    if (toSomething.includes("-")) {
        [toC, toV] = toSomething.split(':');
        if (!toV) {
            toV = toC;
            toC = 1;
        }
    } else {
        toC = fromC;
        toV = toSomething;
    }
    const fromRef = `${currentBook} ${fromC}:${fromV}`;
    const toRef = `${currentBook} ${toC}:${toV}`;
    return [fromRef, toRef];
}

// Clean up text
const paraPrefix = '<ParaStyle:BSB\\:';
const inputLines = fse.readFileSync(inputPath)
    .toString()
    .replace(/\x00/g, "")
    .replace(/\x19 /g, "’")
    .replace(/\x13 /g, "-")
    .split(/[\r\t\n]+/)
    .filter(l => l.startsWith(paraPrefix))

// Collect narrative notes by book
const bookMapping = {
    "The Gospel of Matthew": "MAT",
    "The Gospel of Mark": "MRK",
    "The Gospel of Luke": "LUK",
    "The Gospel of John": "JHN",
    "The Book of Acts": "ACT",
    "Romans": "ROM",
    "1 Corinthians": "1CO",
    "2 Corinthians": "2CO",
    "Galatians": "GAL",
    "Ephesians": "EPH",
    "Philippians": "PHP",
    "Colossians": "COL",
    "1 Thessalonians": "1TH",
    "2 Thessalonians": "2TH",
    "1 Timothy": "1TI",
    "2 Timothy": "2TI",
    "Titus": "TIT",
    "Philemon": "PHM",
    "Hebrews": "HEB",
    "James": "JAS",
    "1 Peter": "1PE",
    "2 Peter": "2PE",
    "1 John": "1JN",
    "2 John": "2JN",
    "3 John": "3JN",
    "Jude": "JUD",
    "Revelation": "REV"
};
const bookLines = {};
let currentBook = null;
for (const inputLine of inputLines) {
    if (inputLine.startsWith(`${paraPrefix}BookIntro\\:mt1`)) {
        currentBook = bookMapping[inputLine.split('>')[1]];
        bookLines[currentBook] = [];
    } else if (inputLine.startsWith(`${paraPrefix}NarrativeNotes\\`)) {
        bookLines[currentBook].push(inputLine);
    }
}

// Make markdown for main note
const bookNoteMarkdown = {};
const bookFootnoteMarkdown = {};
const tsvLines = [];
let noteN = 1;
for (currentBook of Object.values(bookMapping)) {
    /*
    if (currentBook !== "MAT") {
        continue;
    }
     */
    bookNoteMarkdown[currentBook] = {};
    let currentRef = null;
    for (let bookLine of bookLines[currentBook]) {
        const refRE = xre("^<ParaStyle:BSB\\\\:NarrativeNotes\\\\:m><CharStyle:bd>([^<]+)<CharStyle:>");
        const refMatch = xre.exec(bookLine, refRE);
        if (refMatch) {
            currentRef = refMatch[1].replace(/ /g, "");
            bookNoteMarkdown[currentBook][currentRef] = [];
            bookLine = xre.replace(bookLine, refRE, "");
        } else {
            const refRE = xre("^<ParaStyle:BSB\\\\:NarrativeNotes\\\\:.>");
            bookLine = xre.replace(bookLine, refRE, "");
        }
        bookNoteMarkdown[currentBook][currentRef].push(
            bookLine
                .replace(/<CharStyle:Page Elements\\:fn-caller><FootnoteStart:>.*?<FootnoteEnd:><CharStyle:>/g, "")
                .replace(/<CharStyle:[kb]>([^<]+)<CharStyle:>/g, "**$1**")
                .replace(/<CharStyle:it>([^<]+)<CharStyle:>/g, "*$1*")
                .replace(/<CharStyle:w>([^<]+)<CharStyle:>/g, "*$1*")
                .trim()
        )
    }
    // Generate footnote markdown


    // Generate main markdown and merge into TSV
    for (const [ref, mds] of Object.entries(bookNoteMarkdown[currentBook])) {
        if (!ref) {
            continue;
        }
        const [fromRef, toRef] = unpackRef(ref);
        tsvLines.push(`${fromRef}\t${toRef}\t${noteN}\t${mds.join('\\n\\n')}`)
        noteN++;
    }
}
fse.writeFileSync(outputPath, tsvLines.join('\n'));

