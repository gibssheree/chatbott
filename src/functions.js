import $ from "jquery";
import logobot from "./hermes.png";
import logouser from "./user.png";
//const fs = require("fs");
//// Save network state to JSON file.
//const networkState = model_network.toJSON();
//fs.writeFileSync("model_network_state.json",  JSON.stringify(networkState), "utf-8");
//// Load the trained network data from JSON file.
//const networkState = JSON.parse(fs.readFileSync("network_state.json", "utf-8"));
//model_network.fromJSON(networkState);

// function to create a dictionary
export function build_dictionary(json_data) {
  // combine string
  var str_data = json_data
    .map((dataSet) => {
      return dataSet.phrase;
    })
    .join(" ");
  // lowercase
  str_data = str_data.toLowerCase();
  // remove punctuation
  str_data = str_data.replace(/[^\w\s\']|_/g, "").replace(/\s+/g, " ");
  // remove dupliate items
  var arr_duplicate = str_data.split(" ");
  var str_fix = arr_duplicate
    .filter(function (value, index, self) {
      return self.indexOf(value) === index;
    })
    .join(" ");

  return str_fix.split(" ");
}

// clean text input
export function clean_input(txt_input) {
  // lowercase
  txt_input = txt_input.toLowerCase();
  // remove punctuation
  txt_input = txt_input.replace(/[^\w\s\']|_/g, "").replace(/\s+/g, " ");

  return txt_input;
}

// user chat replay
export function response_user(chat, date) {
  var html =
    "<div class='containerbot darker'> <img src='" +
    logouser +
    "' alt='Avatar' class='right' style='width:100%;'> <div class='row pt-0'> <div class='col-sm-2'><span class='time-left'>" +
    date +
    "</span></div> <div class='col-sm-10 text-end'>" +
    chat +
    "</div></div></div>";
  return html;
}

export function response_bot(chat, prob, date) {
  var html =
    "<div class='containerbot'> <img src='" +
    logobot +
    "' alt='Avatar' style='width:100%;'> <div class='row'> <div class='col-sm-8 pt-0'>" +
    chat +
    "</div> <div class='col-sm-4 pt-1'><span class='time-right'>" +
    prob +
    "%</br>" +
    date +
    "</span></div> </div> </div>";
  return html;
}

// get time date today
export function get_time(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  hours = hours < 10 ? "0" + hours : hours;
  // appending zero in the start if hours less than 10
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return hours + ":" + minutes + " " + ampm;
}

export function get_date(date) {
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Flatten categorized patterns ke format array biasa
 * @param {Object} categorizedData - Data patterns yang dikategorikan
 * @returns {Array} - Array of {phrase, result} objects
 */
export function flattenPatterns(categorizedData) {
  const flatData = [];
  
  // Fungsi rekursif untuk traverse nested object
  function traverse(obj) {
    if (obj.intents) {
      // Level dengan intents langsung (tanpa subcategories)
      Object.keys(obj.intents).forEach(intentName => {
        const patterns = obj.intents[intentName];
        patterns.forEach(pattern => {
          flatData.push({
            phrase: pattern.phrase,
            result: { [intentName]: 1 }
          });
        });
      });
    }
    
    if (obj.subcategories) {
      // Level dengan subcategories
      Object.keys(obj.subcategories).forEach(subcatKey => {
        traverse(obj.subcategories[subcatKey]);
      });
    }
  }
  
  // Traverse semua categories
  Object.keys(categorizedData).forEach(categoryKey => {
    const category = categorizedData[categoryKey];
    traverse(category);
  });
  
  return flatData;
}

/**
 * Flatten categorized responses ke format array biasa
 * @param {Object} categorizedData - Data responses yang dikategorikan
 * @returns {Array} - Array of {intentName: [responses]} objects
 */
export function flattenResponses(categorizedData) {
  const flatData = [];
  
  // Fungsi rekursif untuk traverse nested object
  function traverse(obj) {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      
      // Jika value adalah array, berarti ini adalah responses
      if (Array.isArray(value)) {
        flatData.push({ [key]: value });
      } 
      // Jika value adalah object, traverse lebih dalam
      else if (typeof value === 'object' && value !== null) {
        traverse(value);
      }
    });
  }
  
  traverse(categorizedData);
  
  return flatData;
}

/**
 * Get category path untuk intent tertentu
 * @param {Object} categorizedData - Data patterns yang dikategorikan
 * @param {String} intentName - Nama intent yang dicari
 * @returns {String} - Path kategori (contoh: "general-knowledge > geography")
 */
export function getCategoryPath(categorizedData, intentName) {
  let path = [];
  
  function traverse(obj, currentPath = []) {
    // Check di level intents
    if (obj.intents && obj.intents[intentName]) {
      path = [...currentPath];
      return true;
    }
    
    // Check di subcategories
    if (obj.subcategories) {
      for (const subcatKey in obj.subcategories) {
        const subcat = obj.subcategories[subcatKey];
        if (traverse(subcat, [...currentPath, subcat.description || subcatKey])) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  // Traverse semua categories
  for (const categoryKey in categorizedData) {
    const category = categorizedData[categoryKey];
    if (traverse(category, [category.description || categoryKey])) {
      break;
    }
  }
  
  return path.join(' > ');
}

/**
 * Get all intents grouped by category
 * @param {Object} categorizedData - Data patterns yang dikategorikan
 * @returns {Object} - Object dengan struktur {categoryName: [intentNames]}
 */
export function getIntentsByCategory(categorizedData) {
  const result = {};
  
  function traverse(obj, categoryName) {
    if (obj.intents) {
      if (!result[categoryName]) {
        result[categoryName] = [];
      }
      result[categoryName].push(...Object.keys(obj.intents));
    }
    
    if (obj.subcategories) {
      Object.keys(obj.subcategories).forEach(subcatKey => {
        const subcat = obj.subcategories[subcatKey];
        const subcatName = subcat.description || subcatKey;
        traverse(subcat, `${categoryName} > ${subcatName}`);
      });
    }
  }
  
  Object.keys(categorizedData).forEach(categoryKey => {
    const category = categorizedData[categoryKey];
    const categoryName = category.description || categoryKey;
    traverse(category, categoryName);
  });
  
  return result;
}

/**
 * Validate categorized data structure
 * @param {Object} patterns - Categorized patterns data
 * @param {Object} responses - Categorized responses data
 * @returns {Object} - {valid: boolean, errors: [], warnings: []}
 */
export function validateCategorizedData(patterns, responses) {
  const errors = [];
  const warnings = [];
  
  // Get all intents from patterns
  const patternsIntents = new Set();
  function extractIntents(obj) {
    if (obj.intents) {
      Object.keys(obj.intents).forEach(intent => patternsIntents.add(intent));
    }
    if (obj.subcategories) {
      Object.values(obj.subcategories).forEach(extractIntents);
    }
  }
  Object.values(patterns).forEach(extractIntents);
  
  // Get all intents from responses
  const responsesIntents = new Set();
  function extractResponseIntents(obj) {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (Array.isArray(value)) {
        responsesIntents.add(key);
      } else if (typeof value === 'object' && value !== null) {
        extractResponseIntents(value);
      }
    });
  }
  extractResponseIntents(responses);
  
  // Check for intents in patterns but not in responses
  patternsIntents.forEach(intent => {
    if (!responsesIntents.has(intent)) {
      errors.push(`Intent "${intent}" has patterns but no responses`);
    }
  });
  
  // Check for intents in responses but not in patterns
  responsesIntents.forEach(intent => {
    if (!patternsIntents.has(intent)) {
      warnings.push(`Intent "${intent}" has responses but no patterns`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}