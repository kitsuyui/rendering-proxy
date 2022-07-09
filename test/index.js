const assert = require('assert');
const utils = require('../src/utils.js');

const testIsContentTypeHTML = () => {
  const testCases = {
    'text/html': true,
    'text/plain': false,
    'text/html; charset=UTF-8': true,
    'text/plain; charset=UTF-8': false,
    'application/xhtml+xml': true,
    'application/xhtml+xml; UTF-8': true,
    'text/javascript': false,
    'application/json': false,
    'audio/midi': false,
  };

  for (let key of Object.keys(testCases)) {
    let contentType = key;
    let expectResult = testCases[key];
    assert.strictEqual(utils.isContentTypeHTML(contentType), expectResult);
  }
};

const main = () => {
  testIsContentTypeHTML();
};

if (require.main === module) {
  main();
}
