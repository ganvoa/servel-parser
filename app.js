const PdfReader = require("pdfreader").PdfReader;
const ignore = require("./ignore.json");
const fs = require('fs');
const path = require('path');

let currentPage = 0;
let currentLine = 0;
let currentElement = null;
currentRegion = null;
currentProvincia = null;
currentComuna = null;
currentFile = null;
let elements = [];

let proccess = (err, item) => {

    if (err) {
        console.error(err);
        return;
    }

    if (!item) {
        const extension = path.extname(currentFile);
        const fileName = path.basename(currentFile, extension);
        fs.writeFileSync(__dirname + '/json/' + fileName +'.json', JSON.stringify(elements));
        return;
    }

    if (ignore.includes(item.text)) {
        return;
    }

    // Si es una página nueva
    if (item && item.file) {
        currentFile = path.basename(item.file.path);
        console.info(`Procesando archivo: ${currentFile}`);
    }

    // Si es una página nueva
    if (item && item.page) {
        currentPage = item.page;
        currentLine = 0;
        console.info(`Procesando página: ${currentPage}`);
    }
    
    if (item && item.text) {
        currentLine++;

        if (currentLine > 5) {

            if ((currentLine - 5)%7 == 1) {
                currentElement = {}
                currentElement["nom"] = item.text;
            }
            
            if ((currentLine - 5)%7 == 2)
                currentElement["rut"] = item.text;
            if ((currentLine - 5)%7 == 3)
                currentElement["sex"] = item.text;
            if ((currentLine - 5)%7 == 4)
                currentElement["dir"] = item.text;
            if ((currentLine - 5)%7 == 5)
                currentElement["cir"] = item.text;
            if ((currentLine - 5)%7 == 6)
                currentElement["me1"] = item.text;
            
            // Hay casos en que no tienen Mesa V o M,
            // Evaluamos si el token es una M o V, si no, rellenamos

            if ((currentLine - 5)%7 == 0) {
                if (item.text == "V" || item.text == "M") {
                    currentElement["me2"] = item.text;
                    currentElement["reg"] = currentRegion;
                    currentElement["pro"] = currentProvincia;
                    currentElement["com"] = currentComuna;
                    currentElement["fil"] = currentFile;
                    currentElement["pag"] = currentPage;
                    elements.push(currentElement);
                } else {
                    currentElement["me2"] = null;
                    currentElement["reg"] = currentRegion;
                    currentElement["pro"] = currentProvincia;
                    currentElement["com"] = currentComuna;
                    currentElement["fil"] = currentFile;
                    currentElement["pag"] = currentPage;
                    elements.push(currentElement);
                    currentLine++;
                    currentElement = {}
                    currentElement["nom"] = item.text;
                }
            }
        } else { 
            if (currentLine == 2) {
                currentRegion = item.text.replace(": ", "");
            }
            if (currentLine == 4) {
                currentProvincia = item.text.replace(": ", "");
            }
            if (currentLine == 5) {
                currentComuna = item.text.replace(": ", "");
            }
        }
    }
}

new PdfReader().parseFileItems("./pdf/A01402.pdf", proccess);