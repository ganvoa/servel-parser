'use strict';

const Readable = require('stream').Readable;
const pdfjs = require('pdfjs-dist');

module.exports = class PDFReader extends Readable {

    /**
     * PDFReader Constructor
     * @param {Object|string|ArrayBuffer} options Options object (based on stream.Readable) or PDF source
     * @param {string|ArrayBuffer} options.src PDF source, string is URL
     */
    constructor(options) {
        
        if (typeof options === 'string' || ArrayBuffer.isView(options)) {
            options = {
                src: options
            };
        }

        const defaults = {
            readable: true,
            writable: false,
            objectMode: true
        };

        const config = Object.assign({}, defaults, options);
        const src = config.src;
        delete config.src;
        super(config);

        this.page = 1;
        this.num_pages = false;
        this.source = src;
    }

    _read(size) {
        if (!this.num_pages) {
            this._get_doc();
        } else if (this.page <= this.num_pages) {
            this._get_text_content();
        } else {
            this.push(null);
        }
    }

    _get_doc() {
        pdfjs.getDocument(this.source)
            .then((doc) => {
                this.num_pages = doc.numPages;
                this.doc = doc;
                this.doc.getMetadata()
                    .then((metadata) => {
                        this.push({
                            numPages: this.num_pages,
                            metadata: metadata
                        });
                    }).catch(e => {
                        this.push(null);
                        console.error(e.message)
                    });
            })
            .catch(e => {
                this.push(null);
                console.error(e.message)
            });
    }

    _get_text_content() {
        this.doc.getPage(this.page)
            .then((page) => {
                page.getTextContent()
                    .then((content) => {
                        this.push({
                            page: this.page++,
                            textContent: content
                        });
                    }).catch(e => {
                        this.push(null);
                        console.error(e.message)
                    });;
            }).catch(e => {
                this.push(null);
                console.error(e.message)
            });
    }
};
