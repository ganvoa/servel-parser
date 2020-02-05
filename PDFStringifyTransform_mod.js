'use strict';

const Transform = require('stream').Transform;

//noinspection JSUnusedLocalSymbols
/**
 * Transform PDF text content object to string
 * @type {PDFStringifyTransform}
 */
module.exports = class PDFStringifyTransform extends Transform {

  //noinspection JSUnusedLocalSymbols
  /**
   * Transform PDF.js text object to string
   * @param {Object} obj
   * @param {number} [obj.numPages] Number of pages in the document
   * @param {Object} [obj.metadata] PDF metadata
   * @param {number} [obj.page] Current page number
   * @param {Object} [obj.textContent] PDF.js page text content
   * @param [encoding]
   * @param cb
   * @private
   */
  _transform(obj, encoding, cb) {
    // Skip objects without `textContent`
    if (!obj
      || typeof obj.textContent === 'undefined') {
      //console.log(JSON.stringify(obj));
      cb();
      return;
    }

    let item;
    let text_content = '';
    // Split text context items
    for (let i = 0, ii = obj.textContent.items.length; i < ii; i++) {
      item = obj.textContent.items[i];
      // Replace whitespace
      if (typeof this.whitespace === 'string' // Fix: bug always not cleaning whitespace
        && item.str.length === 1
        && item.str === ' ') {
        text_content += this.whitespace;
        continue;
      }
      text_content += item.str + "\n";
    }
    this.push(text_content);

    cb();
  }
};
