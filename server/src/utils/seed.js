const fs = require("fs");
const path = require("path");
const util = require("util");

const seedPath = path.join(__dirname, "../../data/sample-books.json");

// Callback version: the Node-style callback receives errors and parsed data.
function readSeedCallback(callback) {
  fs.readFile(seedPath, "utf8", (error, text) => {
    if (error) return callback(error);

    try {
      callback(null, JSON.parse(text));
    } catch (parseError) {
      callback(parseError);
    }
  });
}

// Promise version: async/await provides the same result with clearer flow.
async function readSeedPromise() {
  const text = await fs.promises.readFile(seedPath, "utf8");
  return JSON.parse(text);
}

const readSeedWithPromisify = util.promisify(readSeedCallback);
// A const arrow helper called before definition would throw ReferenceError due to the TDZ.

module.exports = { readSeedCallback, readSeedPromise };
