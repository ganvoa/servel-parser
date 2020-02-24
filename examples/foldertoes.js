const fs = require('fs');
const util = require('util');
const path = require('path');
const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: 'http://elastic:9200' });
const WritableBulk = require('elasticsearch-streams').WritableBulk;
const TransformToBulk = require('elasticsearch-streams').TransformToBulk;
const reader = require('../lib/reader');
const args = process.argv.slice(2);
const es = require('event-stream');

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

const index = "servel";
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

const split = (name) => {
    name = name.replace(/del|de|la|las|mc|y/g, '');
    return name.split(" ");
}

const processFile = async (pdfPath) => {

    const ws = new WritableBulk(bulkExec);
    const toBulk = new TransformToBulk((doc) =>  {
        return { _id: doc.uid }
    });

    return new Promise((resolve, reject) => {
        reader(pdfPath)
            .pipe(es.mapSync(item => {
                let doc = JSON.parse(item)
                let words = split(doc.nom);
                doc.cnt = words.length;
                doc.ap1 = words[0];
                doc.ap2 = words[1];
                return doc;
            }))
            .pipe(toBulk).pipe(ws)
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
    const countFiles = files.length;
    let currentFile = null;
    let count = 0;
    while (currentFile = files.pop()) {
        count++;
        console.log(`procesando archivo ${currentFile} ${count}/${countFiles}`);
        await processFile(currentFile);
    }
    console.log('Fin :)')
}

run(args[0])