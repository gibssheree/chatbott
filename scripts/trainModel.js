// Build-time training script.
//
// The app used to train the intent-classification network in the browser on
// every page load, which is why opening the site showed "menyiapkan model
// neural network..." for several seconds (or, after errorThresh was
// tightened to 0.0005, for minutes - see git history of src/modelInit.js).
//
// This script trains the network once here in Node and writes the resulting
// weights + dictionary to src/data/trained-model.json. The browser then just
// calls network.fromJSON() on load, which is effectively instant.
//
// Run manually with `npm run train` after editing
// src/data/data-patterns-categorized.json, or automatically via the
// prestart/prebuild npm hooks.

const fs = require("fs");
const path = require("path");
const brain = require("brain.js");

// Mirrors flattenPatterns/build_dictionary/encode in src/functions.js.
// Duplicated here (rather than imported) because functions.js uses ES module
// export syntax and this script runs directly under plain Node, not webpack.
function flattenPatterns(categorizedData) {
  const flatData = [];
  function traverse(obj) {
    if (obj.intents) {
      Object.keys(obj.intents).forEach((intentName) => {
        obj.intents[intentName].forEach((pattern) => {
          flatData.push({ phrase: pattern.phrase, result: { [intentName]: 1 } });
        });
      });
    }
    if (obj.subcategories) {
      Object.keys(obj.subcategories).forEach((key) => traverse(obj.subcategories[key]));
    }
  }
  Object.keys(categorizedData).forEach((key) => traverse(categorizedData[key]));
  return flatData;
}

function build_dictionary(json_data) {
  var str_data = json_data.map((dataSet) => dataSet.phrase).join(" ").toLowerCase();
  str_data = str_data.replace(/[^\w\s']|_/g, "").replace(/\s+/g, " ");
  var arr_duplicate = str_data.split(" ");
  return arr_duplicate.filter((value, index, self) => self.indexOf(value) === index);
}

function encode(phrase, dictionary) {
  const phraseTokens = phrase.split(" ");
  return dictionary.map((word) => (phraseTokens.includes(word) ? 1 : 0));
}

const patternsPath = path.join(__dirname, "..", "src", "data", "data-patterns-categorized.json");
const outPath = path.join(__dirname, "..", "src", "data", "trained-model.json");

const patterns = JSON.parse(fs.readFileSync(patternsPath, "utf-8"));
const trainingPhrases = flattenPatterns(patterns);
const dictionary = build_dictionary(trainingPhrases);
const trainingSet = trainingPhrases.map((dataSet) => ({
  input: encode(dataSet.phrase, dictionary),
  output: dataSet.result,
}));

console.log(`🧠 Training on ${trainingSet.length} phrases, dictionary size ${dictionary.length}...`);

const network = new brain.NeuralNetwork();
const start = Date.now();
const stats = network.train(trainingSet, {
  iterations: 20000,
  learningRate: 0.3,
  errorThresh: 0.005, // brain.js default - converges in ~80 iterations on this dataset
});
const elapsed = Date.now() - start;

console.log(
  `✅ Done in ${elapsed}ms (stopped at iteration ${stats.iterations}, error ${stats.error.toFixed(5)})`
);

fs.writeFileSync(
  outPath,
  JSON.stringify({
    network: network.toJSON(),
    dictionary,
    meta: {
      trainedAt: new Date().toISOString(),
      trainingSetSize: trainingSet.length,
      dictionarySize: dictionary.length,
      iterations: stats.iterations,
      error: stats.error,
    },
  })
);

console.log(`📝 Wrote ${path.relative(process.cwd(), outPath)}`);
