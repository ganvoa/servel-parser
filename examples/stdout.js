const reader = require('../lib/reader')
const args = process.argv.slice(2);

if (args.length !== 1) {
    console.error(`
Error: Cantidad de parámetros inválidos

Ejemplo: 

node examples/stdout "/path/to/pdf"
    `);
    process.exit(1)
}

const pdfPath = args[0];
const stream = reader(pdfPath).pipe(process.stdout);

stream.on('finish', () => {
    console.log('Fin :)');
})