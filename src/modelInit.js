// Model initialization module - loads the pre-trained network.
//
// The network used to be trained from scratch in the browser on every page
// load (slow, and blocked the chat input until it converged). It's now
// trained once at build time by scripts/trainModel.js, which writes the
// weights + dictionary to ./data/trained-model.json - this module just loads
// that JSON via network.fromJSON(), which is effectively instant.
// Run `npm run train` after editing data-patterns-categorized.json.

import {
  flattenResponses,
  validateCategorizedData,
  getIntentsByCategory,
} from "./functions.js";

const brain = require("brain.js");

// Store trained model globally so it can be shared
let trainedModel = null;
let modelInitialized = false;
let modelError = null;
// In-flight promise guard - mencegah training ganda jika initializeModel()
// dipanggil lagi sebelum training pertama selesai (misal React StrictMode
// yang memanggil effect dua kali secara berurutan di development)
let initPromise = null;

// Helper untuk encode phrase
function encode(phrase, dictionary) {
  const phraseTokens = phrase.split(" ");
  const encodedPhrase = dictionary.map((word) =>
    phraseTokens.includes(word) ? 1 : 0
  );
  return encodedPhrase;
}

// Initialize model secara async - tidak block UI
export async function initializeModel() {
  if (modelInitialized) {
    console.log("✅ Model sudah diinisialisasi");
    return trainedModel;
  }

  if (initPromise) {
    // Training sudah berjalan (misal dipanggil dua kali oleh StrictMode) -
    // tunggu promise yang sama, jangan mulai training baru
    return initPromise;
  }

  initPromise = new Promise((resolve, reject) => {
    try {
      console.log("🔄 Memuat model Neural Network yang sudah dilatih...");

      // Load categorized data (still needed for validation + category logging)
      const categorizedPatterns = require("./data/data-patterns-categorized.json");
      const categorizedResponses = require("./data/data-responses-categorized.json");
      // Pre-trained weights + dictionary, produced by scripts/trainModel.js
      const preTrainedModel = require("./data/trained-model.json");

      // Validate data
      const validation = validateCategorizedData(
        categorizedPatterns,
        categorizedResponses
      );
      if (!validation.valid) {
        console.error("❌ Data validation errors:", validation.errors);
        modelError = validation.errors;
        initPromise = null;
        reject(new Error("Data validation failed"));
        return;
      }
      if (validation.warnings.length > 0) {
        console.warn("⚠️ Data validation warnings:", validation.warnings);
      }

      const data_responses = flattenResponses(categorizedResponses);

      // Log categories info
      console.log("📂 Categories structure:");
      const intentsByCategory = getIntentsByCategory(categorizedPatterns);
      Object.keys(intentsByCategory).forEach((category) => {
        console.log(`  ${category}: ${intentsByCategory[category].join(", ")}`);
      });

      // Load pre-trained weights instead of training from scratch
      const model_network = new brain.NeuralNetwork();
      model_network.fromJSON(preTrainedModel.network);

      console.log(
        `✅ Model dimuat dari trained-model.json (dilatih ${preTrainedModel.meta.trainedAt}, ${preTrainedModel.meta.iterations} iterasi)`
      );

      trainedModel = {
        network: model_network,
        dictionary: preTrainedModel.dictionary,
        data_responses: data_responses,
        encode: encode,
      };

      modelInitialized = true;
      resolve(trainedModel);
    } catch (error) {
      console.error("❌ Error initializing model:", error);
      modelError = error.message;
      initPromise = null;
      reject(error);
    }
  });

  return initPromise;
}

// Get trained model (async-aware)
export async function getTrainedModel() {
  if (modelInitialized) {
    return trainedModel;
  }
  return await initializeModel();
}

// Check if model is ready
export function isModelReady() {
  return modelInitialized;
}

// Get model error jika ada
export function getModelError() {
  return modelError;
}
