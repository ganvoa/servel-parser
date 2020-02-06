/**
 * @see http://ndjson.org/
 */

const reader = require('../lib/json-reader');
const args = process.argv.slice(2);

if (args.length !== 2) {
    console.error(`
Error: Cantidad de parámetros inválidos

Ejemplo: 

ejemplo: node app "ArchivoServel.pdf" "/path/to/json/folder"
    `);
    process.exit(1)
}

const pdfPath = args[0];
const jsonFolder = args[1];

const stream = reader(pdfPath, jsonFolder);

stream.on('finish', () => {
    console.log('Fin :)');
})