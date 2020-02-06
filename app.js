const args = process.argv.slice(2);

if (args.length !== 1) {
    console.error('Cantidad de parámetros inválidos');
    process.exit(1)
}

const pdfPath = args[0];
console.log(`Intentando importar archivo "${pdfPath}"`);