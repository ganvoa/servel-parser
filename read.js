
'use strict';

const fs = require('fs');
const es = require('event-stream');
const PdfReader = require('./lib/PdfReader');
const ignore = require("./lib/ignore.json");
const path = require('path');

const localPath = __dirname + "/pdf/A13132.pdf";
//const localPath = __dirname + "/pdf/A11303.pdf";
const pdf = new Uint8Array(fs.readFileSync(localPath));
const pdfStream = new PdfReader({ src: pdf });

let currentPage = 0;
let currentLine = 0;
let currentElement = null;
let currentRegion = null;
let currentProvincia = null;
let currentComuna = null;
let currentFile = path.basename(localPath);
const extension = path.extname(currentFile);
const fileName = path.basename(currentFile, extension);
const file = fs.createWriteStream(__dirname + '/json/' + fileName + '.json');

pdfStream
    .pipe(es.filterSync(data => data && data.textContent))
    .pipe(es.mapSync(data => data.textContent.items))
    .pipe(es.mapSync(items => {
        let line = '';
        for (let i = 0; i < items.length; i++) {
            line += items[i].str + "\n";
        }
        return line;
    }))
    .pipe(es.split())
    .pipe(es.filterSync(line => !ignore.includes(line)))
    .pipe(es.mapSync(line => {

        if (line == "Página") {
            currentPage++;
            currentLine = 0;
            console.info(`Procesando página: ${currentPage}`);
        }

        currentLine++;

        if (currentLine > 7) {
            if ((currentLine - 7) % 7 == 1) {
                currentElement = {}
                currentElement["nom"] = line;
            }
            if ((currentLine - 7) % 7 == 2) {
                currentElement["uid"] = parseInt(line.replace(/\./g, "").split("-")[0]);
                currentElement["rut"] = line;
            }
            if ((currentLine - 7) % 7 == 3)
                currentElement["sex"] = line;
            if ((currentLine - 7) % 7 == 4)
                currentElement["dir"] = line;
            if ((currentLine - 7) % 7 == 5)
                currentElement["cir"] = line;
            if ((currentLine - 7) % 7 == 6)
                currentElement["me1"] = line;

            if ((currentLine - 7) % 7 == 0) {
                currentElement["me2"] = line;
                currentElement["reg"] = currentRegion;
                currentElement["pro"] = currentProvincia;
                currentElement["com"] = currentComuna;
                currentElement["fil"] = currentFile;
                currentElement["pag"] = currentPage;
                return JSON.stringify(currentElement) + "\n"
            }
        } else {
            if (currentLine == 3) {
                currentRegion = line.replace(": ", "");
            }
            if (currentLine == 5) {
                currentProvincia = line.replace(": ", "");
            }
            if (currentLine == 6) {
                currentComuna = line.replace(": ", "");
            }
        }
    }))
    .pipe(file)
