const reader = require('./reader')
const fs = require('fs');
const path = require('path');

module.exports = (pdfPath, jsonFolder) => {

    let currentFile = path.basename(pdfPath);
    const extension = path.extname(currentFile);
    const fileName = path.basename(currentFile, extension);
    const file = fs.createWriteStream(`${jsonFolder}/${fileName}.json`);

    console.log(`Escribiendo JSON en "${jsonFolder}/${fileName}.json"`);

    return reader(pdfPath)
        .pipe(file);
}