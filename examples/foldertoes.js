const fs = require('fs');
const util = require('util');
const path = require('path');
const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: 'http://elastic:9200' });
const WritableBulk = require('elasticsearch-streams').WritableBulk;
const TransformToBulk = require('elasticsearch-streams').TransformToBulk;
const reader = require('../lib/reader');
const args = process.argv.slice(2);

if (args.length !== 1) {
    console.error(`
Error: Cantidad de parámetros inválidos

Ejemplo: 

node examples/foldertoes "/path/to/pdfFolder"
    `);
    process.exit(1)
}

const getFiles = async (directoryPath) => {
    const readdir = util.promisify(fs.readdir);
    files = await readdir(directoryPath);
    return files
        .filter(name => path.extname(name) === '.pdf')
        .map(name => path.join(directoryPath, name));
}

const index = "chile";
const type = "ppl";

const bulkExec = (bulkCmds, callback) => {
    client.bulk({
        index: index,
        type: type,
        body: bulkCmds
    }, callback);
}

const setup = async () => {
    let response = await client.cluster.health({});
    console.log("status: " + response.body.status)
}

const createIndex = async () => {
    try {
        let response = await client.indices.create({ index: index });
        console.log('success: ' + response.body.acknowledged)
    } catch (error) {
        console.error('error: ' + error.message)
    }
}

const processFile = async (pdfPath) => {

    const ws = new WritableBulk(bulkExec);
    const toBulk = new TransformToBulk((doc) =>  {
        let docJson = JSON.parse(doc)
        return { _id: docJson.uid }
    });

    return new Promise((resolve, reject) => {
        reader(pdfPath).pipe(toBulk).pipe(ws)
            .on('finish', () => {
                console.log(`archivo ${pdfPath} procesado`);
                resolve();
            }).on('error', error => {
                console.error(`error al procesar archivo ${pdfPath}: ${error.message}`);
                reject(error);
            });
    })
}

run = async (pathToPdfFolfer) => {

    await setup();
    await createIndex();

    const files = await getFiles(pathToPdfFolfer);
    let currentFile = null;
    while (currentFile = files.pop()) {
        console.log(`procesando archivo ${currentFile}`);
        await processFile(currentFile);
    }
    console.log('Fin :)')
}

run(args[0])