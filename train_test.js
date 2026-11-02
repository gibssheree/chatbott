const brain = require("brain.js");

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
      Object.keys(obj.subcategories).forEach((k) => traverse(obj.subcategories[k]));
    }
  }
  Object.keys(categorizedData).forEach((k) => traverse(categorizedData[k]));
  return flatData;
}

function build_dictionary(json_data) {
  var str_data = json_data.map((d) => d.phrase).join(" ").toLowerCase();
  str_data = str_data.replace(/[^\w\s']|_/g, "").replace(/\s+/g, " ");
  var arr = str_data.split(" ");
  return arr.filter((v, i, self) => self.indexOf(v) === i);
}

function encode(phrase, dictionary) {
  const tokens = phrase.split(" ");
  return dictionary.map((w) => (tokens.includes(w) ? 1 : 0));
}

const patterns = require("./src/data/data-patterns-categorized.json");
const trainingPhrases = flattenPatterns(patterns);
const dictionary = build_dictionary(trainingPhrases);
console.log("Training phrases:", trainingPhrases.length, "Dictionary size:", dictionary.length);

const trainingSet = trainingPhrases.map((d) => ({ input: encode(d.phrase, dictionary), output: d.result }));

function testConfig(errorThresh, iterations, label) {
  const net = new brain.NeuralNetwork();
  const start = Date.now();
  const stats = net.train(trainingSet, { iterations, learningRate: 0.3, errorThresh });
  const elapsed = Date.now() - start;
  const encoded = encode("halo", dictionary);
  const output = net.run(encoded);
  const sorted = Object.entries(output).sort((a, b) => b[1] - a[1]).slice(0, 3);
  console.log(
    `[${label}] errorThresh=${errorThresh} iterations=${iterations} -> stopped at iter ${stats.iterations}, error ${stats.error.toFixed(5)}, took ${elapsed}ms`,
  );
  console.log(`  top3 for "halo":`, sorted.map(([k, v]) => `${k}=${(v * 100).toFixed(1)}%`).join(", "));
}

testConfig(0.005, 20000, "current-ish");
testConfig(0.002, 20000, "moderate");
testConfig(0.001, 20000, "stricter");
