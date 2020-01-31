
/*var fs = require('fs');
var readline = require('readline');
var stream = require('stream');

var instream = fs.createReadStream(__dirname + "/pdf/A13132.pdf");
var outstream = new stream;
var rl = readline.createInterface(instream, outstream);

rl.on('line', function (line) {
    console.log(line)
});

rl.on('close', function () {
    console.log("fin")
});
*/
'use strict';
const fs = require('fs');
const text = require('pdf-stream').text;
const es = require('event-stream');

// Load file contents to ArrayBuffer synchronously
// let file = __dirname + "/pdf/A13132.pdf";
let file = __dirname + "/pdf/A11303.pdf";
let pdf = new Uint8Array(fs.readFileSync(file));
let cont = 0;
// Stream PDF text to stdout
text(pdf)
.pipe(es.split(new RegExp(/([1-9]{1,2}\.[0-9]{3}\.[0-9]{3}\-[0-9kK]{1})/, "g")))
.pipe(es.mapSync(line => {
    console.log("- " + line + "\n")
    cont++;
}));