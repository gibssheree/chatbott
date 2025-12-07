import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import logobot from "./hermes.png";
import logouser from "./user.png";
import "./App.css";
import {
  build_dictionary,
  clean_input,
  response_user,
  response_bot,
  get_time,
  get_date,
  flattenPatterns,
  flattenResponses,
  getCategoryPath,
  getIntentsByCategory,
  validateCategorizedData,
} from "./functions.js";
import $ from "jquery";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import { Card } from "react-bootstrap";
import { FiSend } from "react-icons/fi";
import ParentComponent from "./components/Toggle.jsx";
import Contact from "./components/Contact.jsx";
import About from "./components/About.jsx";

// get data
const brain = require("brain.js");

// Toggle between categorized or flat data
const USE_CATEGORIZED_DATA = true; // Set to true untuk gunakan data yang dikategorikan

let trainingPhrases, data_responses;

if (USE_CATEGORIZED_DATA) {
  // Load categorized data
  const categorizedPatterns = require("./data/data-patterns-categorized.json");
  const categorizedResponses = require("./data/data-responses-categorized.json");

  // Validate data
  const validation = validateCategorizedData(
    categorizedPatterns,
    categorizedResponses,
  );
  if (!validation.valid) {
    console.error("❌ Data validation errors:", validation.errors);
  }
  if (validation.warnings.length > 0) {
    console.warn("⚠️  Data validation warnings:", validation.warnings);
  }

  // Convert to flat format
  trainingPhrases = flattenPatterns(categorizedPatterns);
  data_responses = flattenResponses(categorizedResponses);

  // Log categories info
  console.log("📂 Categories structure:");
  const intentsByCategory = getIntentsByCategory(categorizedPatterns);
  Object.keys(intentsByCategory).forEach((category) => {
    console.log(`  ${category}: ${intentsByCategory[category].join(", ")}`);
  });
}

// build dictionary
const dictionary = build_dictionary(trainingPhrases);
//console.log(dictionary); // print dictionary
console.log("Input: Front End"); // test encoding text input
console.log("Encoded: " + encode("Front End")); // test encoding text input

// prepare your training data
const trainingSet = trainingPhrases.map((dataSet) => {
  const encodedValue = encode(dataSet.phrase);
  return { input: encodedValue, output: dataSet.result };
});

// train neural network
const model_network = new brain.NeuralNetwork();
model_network.train(trainingSet);

// encoding text to number format
function encode(phrase) {
  const phraseTokens = phrase.split(" ");
  const encodedPhrase = dictionary.map((word) =>
    phraseTokens.includes(word) ? 1 : 0,
  );

  return encodedPhrase;
}

function containsProfanity(input) {
  const profanityList = [
    "bangsat",
    "anjir",
    "bangke",
    "fuck",
    "bitch",
    "kontol",
    "babi",
    "bajingan",
  ];
  const lowerCaseInput = input.toLowerCase();

  return profanityList.some((profanity) => lowerCaseInput.includes(profanity));
}

// Fungsi untuk menghitung ekspresi matematika yang lebih kompleks
function calculateMathExpression(expression) {
  try {
    // Membersihkan input dari karakter yang tidak diinginkan
    const cleanExpression = expression.replace(/[a-zA-Z]/g, "").trim();

    // Menangani kasus khusus seperti akar kuadrat, pangkat, logaritma, dan trigonometri
    let processedExpression = cleanExpression;

    // Menangani akar kuadrat: sqrt(x) atau akar(x)
    if (
      expression.toLowerCase().includes("sqrt") ||
      expression.toLowerCase().includes("akar")
    ) {
      const sqrtRegex = /sqrt\(([^)]+)\)|akar\(([^)]+)\)|akar ([0-9.]+)/gi;
      processedExpression = processedExpression.replace(
        sqrtRegex,
        (match, p1, p2, p3) => {
          const value = p1 || p2 || p3;
          return Math.sqrt(eval(value));
        },
      );
    }

    // Menangani pangkat: x^y atau pow(x,y)
    if (expression.includes("^") || expression.toLowerCase().includes("pow")) {
      const powRegex1 = /([0-9.]+)\s*\^\s*([0-9.]+)/g;
      const powRegex2 = /pow\(([^,]+),([^)]+)\)/gi;

      processedExpression = processedExpression.replace(
        powRegex1,
        (match, base, exp) => {
          return Math.pow(parseFloat(base), parseFloat(exp));
        },
      );

      processedExpression = processedExpression.replace(
        powRegex2,
        (match, base, exp) => {
          return Math.pow(eval(base), eval(exp));
        },
      );
    }

    // Menangani logaritma: log(x) atau log10(x) atau ln(x)
    if (
      expression.toLowerCase().includes("log") ||
      expression.toLowerCase().includes("ln")
    ) {
      const logRegex = /log10\(([^)]+)\)|log\(([^)]+)\)/gi;
      const lnRegex = /ln\(([^)]+)\)/gi;

      processedExpression = processedExpression.replace(
        logRegex,
        (match, p1, p2) => {
          const value = p1 || p2;
          return Math.log10(eval(value));
        },
      );

      processedExpression = processedExpression.replace(
        lnRegex,
        (match, p1) => {
          return Math.log(eval(p1));
        },
      );
    }

    // Menangani fungsi trigonometri: sin(x), cos(x), tan(x)
    if (
      expression.toLowerCase().includes("sin") ||
      expression.toLowerCase().includes("cos") ||
      expression.toLowerCase().includes("tan")
    ) {
      const sinRegex = /sin\(([^)]+)\)/gi;
      const cosRegex = /cos\(([^)]+)\)/gi;
      const tanRegex = /tan\(([^)]+)\)/gi;

      processedExpression = processedExpression.replace(
        sinRegex,
        (match, p1) => {
          return Math.sin((eval(p1) * Math.PI) / 180); // konversi ke radian
        },
      );

      processedExpression = processedExpression.replace(
        cosRegex,
        (match, p1) => {
          return Math.cos((eval(p1) * Math.PI) / 180); // konversi ke radian
        },
      );

      processedExpression = processedExpression.replace(
        tanRegex,
        (match, p1) => {
          return Math.tan((eval(p1) * Math.PI) / 180); // konversi ke radian
        },
      );
    }

    // Menangani faktorial: x!
    if (expression.includes("!")) {
      const factRegex = /([0-9]+)!/g;
      processedExpression = processedExpression.replace(
        factRegex,
        (match, p1) => {
          return factorial(parseInt(p1));
        },
      );
    }

    // Evaluasi ekspresi final
    const result = eval(processedExpression);

    // Format hasil dengan baik (maksimal 4 decimal)
    return Number.isInteger(result) ? result : parseFloat(result.toFixed(4));
  } catch (error) {
    console.error("Error calculating math expression:", error);
    return "Maaf, saya tidak dapat menghitung ekspresi tersebut. Pastikan format perhitungan sudah benar.";
  }
}

// Fungsi helper untuk menghitung faktorial
function factorial(n) {
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// Fungsi untuk mendeteksi apakah input adalah persamaan matematika
function isMathExpression(input) {
  // Hanya angka saja tidak dianggap sebagai ekspresi matematika
  if (/^[0-9.]+$/.test(input.trim())) {
    return false;
  }

  const mathPatterns = [
    /[-+*/^()0-9.]+/, // Operasi dasar dan angka (harus ada operator)
    /sqrt\([^)]+\)|akar\([^)]+\)|akar [0-9.]+/i, // Akar kuadrat
    /[0-9.]+\s*\^\s*[0-9.]+|pow\([^)]+,[^)]+\)/i, // Pangkat
    /log10\([^)]+\)|log\([^)]+\)|ln\([^)]+\)/i, // Logaritma
    /sin\([^)]+\)|cos\([^)]+\)|tan\([^)]+\)/i, // Trigonometri
    /[0-9]+!/, // Faktorial
  ];

  // Harus ada operator matematika atau fungsi matematika
  const hasOperator = /[-+*/^]/.test(input);
  const hasFunction = /sqrt|akar|pow|log|ln|sin|cos|tan|!/.test(
    input.toLowerCase(),
  );
  const hasParentheses = /[()]/.test(input);

  return (
    (hasOperator || hasFunction || hasParentheses) &&
    mathPatterns.some((pattern) => pattern.test(input))
  );
}

// Fungsi untuk mendapatkan respons matematika yang lebih informatif
function getMathResponse(input, result) {
  // Deteksi tipe operasi untuk memberikan respons yang lebih personal
  if (typeof result === "number") {
    if (input.includes("sqrt") || input.includes("akar")) {
      return `Hasil akar kuadrat: ${result}`;
    } else if (input.includes("^") || input.includes("pow")) {
      return `Hasil perpangkatan: ${result}`;
    } else if (input.includes("log") || input.includes("ln")) {
      return `Hasil logaritma: ${result}`;
    } else if (
      input.includes("sin") ||
      input.includes("cos") ||
      input.includes("tan")
    ) {
      return `Hasil fungsi trigonometri: ${result}`;
    } else if (input.includes("!")) {
      return `Hasil faktorial: ${result}`;
    } else {
      return `Hasil perhitungan: ${result}`;
    }
  } else {
    return result; // Jika result adalah string error
  }
}

// component function
function App() {
  // set current time
  const [currentTime, setCurrentTime] = React.useState(get_time(new Date()));

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(get_time(new Date()));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // make a prediction
  function predict_bot(txt_chat_input) {
    // encode input text
    const encoded = encode(clean_input(txt_chat_input));
    // predict the response
    const json_output = model_network.run(encoded);
    console.log(
      "Max Categories: " + Object.values(json_output).length + " intents.",
    );
    console.log(json_output);

    // get max value using apply
    const max = Math.max.apply(null, Object.values(json_output));
    const index = Object.values(json_output).indexOf(max);
    // get probability and pred_label
    const pred_label = Object.keys(json_output)[index];
    const pred_prob = json_output["" + pred_label];

    const pred_responses = data_responses.find(
      (response) => response[pred_label] != null,
    );
    const responsesArray = pred_responses[pred_label];

    let pred_response = "Maaf, saya belum tahu cara merespons ini.";

    if (responsesArray) {
      // Randomly select a response
      const randomIndex = Math.floor(Math.random() * responsesArray.length);
      pred_response = responsesArray[randomIndex];
    }

    console.log(
      "Predicted label (" + pred_label + "), probability (" + pred_prob + ").",
    );
    return [pred_response, pred_prob];
  }

  // compile/execute chatbot
  function run_chatbot() {
    var input_chat = $("#input-chat").val(); // get input chat
    if (input_chat.length === 0) {
      const emptyChatResponses = [
        "Ada yang bisa saya bantu?",
        "Apakah kamu tersesat?",
        "Saya ada disini, apa yang ingin kamu tanyakan?",
      ];
      const randomResponse =
        emptyChatResponses[
          Math.floor(Math.random() * emptyChatResponses.length)
        ];

      $("#content-chat-feed").append(
        response_bot(randomResponse, 100, get_time(new Date())),
      );
      force_scroll_bottom();
    } else if (containsProfanity(input_chat)) {
      setTimeout(() => {
        $("#input-chat").val("");
        const profanityResponses = [
          "Hey, jangan ngomong kasar!!",
          "Saya hapus ya kamu ngomong kasar!!",
          "Tidak bagus ngomong kasar!",
          "iiii jangan ngomong kasarrr <3 awokoakwoaksaoksowakso",
        ];
        const randomResponse =
          profanityResponses[
            Math.floor(Math.random() * profanityResponses.length)
          ];

        $("#content-chat-feed").append(
          response_bot(randomResponse, 100, get_time(new Date())),
        );
        force_scroll_bottom();
      }, 1000);
    } else {
      // Tambahkan input user ke chat feed
      $("#content-chat-feed").append(
        response_user(input_chat, get_time(new Date())),
      );
      force_scroll_bottom();

      // Periksa apakah pertanyaan berkaitan dengan matematika
      if (isMathExpression(input_chat)) {
        const mathResult = calculateMathExpression(input_chat);
        const mathResponse = getMathResponse(input_chat, mathResult);

        // Tambahkan respons matematika ke chat feed
        $("#content-chat-feed").append(
          response_bot(mathResponse, 100, get_time(new Date())),
        );
        force_scroll_bottom();
        $("#input-chat").val("");
      }
      // Mengecek apakah pertanyaan berkaitan dengan waktu dan tanggal
      else if (
        input_chat.toLowerCase().includes("jam berapa sekarang") ||
        input_chat.toLowerCase().includes("waktu sekarang") ||
        input_chat.toLowerCase().includes("jam berapa") ||
        input_chat.toLowerCase().includes("jam sekarang") ||
        input_chat.toLowerCase().includes("waktu") ||
        input_chat.toLowerCase().includes("jam berapa ini")
      ) {
        const possibleResponses = [
          `Jam sekarang : ${get_time(new Date())}`,
          `Jam ${get_time(new Date())}`,
          `Waktu saat ini ${get_time(new Date())}`,
          `Waktu menunjukkan pukul ${get_time(new Date())}`,
        ];

        const randomResponse =
          possibleResponses[
            Math.floor(Math.random() * possibleResponses.length)
          ];

        $("#content-chat-feed").append(
          response_bot(randomResponse, 100, get_time(new Date())),
        );
      } else if (
        input_chat.toLowerCase().includes("tanggal sekarang") ||
        input_chat.toLowerCase().includes("hari ini tanggal berapa") ||
        input_chat.toLowerCase().includes("tanggal hari ini") ||
        input_chat.toLowerCase().includes("hari ini tanggal") ||
        input_chat.toLowerCase().includes("tanggal") ||
        input_chat.toLowerCase().includes("tanggal berapa") ||
        input_chat.toLowerCase().includes("hari ini tanggal berapa ya")
      ) {
        const possibleResponses = [
          `Tanggal hari ini: ${get_date(new Date())}`,
          `Hari ini tanggal: ${get_date(new Date())}`,
          `Tanggal saat ini: ${get_date(new Date())}`,
          `Tanggal ${get_date(new Date())}`,
        ];

        const randomResponse =
          possibleResponses[
            Math.floor(Math.random() * possibleResponses.length)
          ];
        $("#content-chat-feed").append(
          response_bot(randomResponse, 100, get_date(new Date())),
        );
      } else if (
        input_chat.toLowerCase().includes("bulan ini tanggal berapa")
      ) {
        const specificResponse = `Sekarang bulan ${new Date().toLocaleString(
          "default",
          { month: "long" },
        )}, tanggal: ${new Date().getDate()}`;
        $("#content-chat-feed").append(
          response_bot(specificResponse, 100, get_date(new Date())),
        );
      } else if (
        input_chat.toLowerCase().includes("tahun ini tanggal berapa")
      ) {
        const specificResponse = `Sekarang tahun ${new Date().getFullYear()}, tanggal: ${new Date().getDate()}`;
        $("#content-chat-feed").append(
          response_bot(specificResponse, 100, get_date(new Date())),
        );
      } else if (input_chat.toLowerCase().includes("hari ini hari apa")) {
        const dayOfWeek = new Date().toLocaleDateString("id-ID", {
          weekday: "long",
        });
        const specificResponse = `Hari ini adalah ${dayOfWeek}, ${get_date(
          new Date(),
        )}`;
        $("#content-chat-feed").append(
          response_bot(specificResponse, 100, get_date(new Date())),
        );
      } else {
        // Jika tidak, melakukan prediksi respons chatbot seperti sebelumnya
        const [respond_bot, prob_bot] = predict_bot(input_chat);
        const prob_val = (parseFloat(prob_bot) * 100).toFixed(2);

        console.log("Response: " + respond_bot);

        const threshold = 50;
        if (prob_val > threshold) {
          // Menambahkan respons chatbot tanpa waktu dan tanggal saat ini
          $("#content-chat-feed").append(
            response_bot(respond_bot, prob_val, get_time(new Date())),
          );
        } else {
          $("#content-chat-feed").append(
            response_bot(
              "Maaf, Saya tidak mengerti, ada yang bisa saya bantu?",
              prob_val,
              get_time(new Date()),
            ),
          );
        }
      }
      // scroll bottom
      force_scroll_bottom();
      // set empty input
      $("#input-chat").val("");
    }
  }

  // Force scrollbar to bottom
  function force_scroll_bottom() {
    const el = document.getElementById("content-chat-feed");
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }

  // handle button function
  const handleButtonSend = () => {
    // compile chatbot brain.js
    run_chatbot();
  };

  // pressing Enter key
  const _handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // compile chatbot brain.js
      run_chatbot();
    }
  };

  return (
    <BrowserRouter>
      <div className="App">
        <div className="card-side">
          <Sidebar />
        </div>
        <div className="card d-flex flex-column vh-100 overflow-hidden">
          <Header />
          <Routes>
            <Route
              path="/"
              element={
                <div
                  className="card-body"
                  style={{ overflowY: "scroll" }}
                  id="content-chat-feed"
                >
                  <div className="containerbot">
                    <img src={logobot} alt="Avatar" style={{ width: "100%" }} />
                    <div className="row">
                      <div className="col-sm-8 pt-1">Hi, selamat datang :)</div>
                      <div className="col-sm-4 pt-1">
                        <span className="time-right">{currentTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              }
            />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
          </Routes>
          <Routes>
            <Route
              path="/"
              element={
                <div className="card-footer">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      id="input-chat"
                      placeholder="Message Hermes"
                      onKeyDown={_handleKeyDown}
                    />
                    <div className="input-group-append">
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={handleButtonSend}
                      >
                        <span style={{ color: "black" }}>
                          <FiSend />
                        </span>
                      </button>
                    </div>
                  </div>
                  <p>
                    Hermes AI may make mistakes and provide inaccurate
                    information, for educational purposes see the source code in
                    About Hermes.
                  </p>
                </div>
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
export default App;
