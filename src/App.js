import React, { useRef } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import logobot from "./hermes.png";
import "./App.css";
import {
  clean_input,
  response_user,
  response_bot,
  get_time,
  get_date,
} from "./functions.js";
import { initializeModel } from "./modelInit.js"; // async NN training, tidak block UI
import { parseMathExpression } from "./mathParser.js"; // replace eval dengan safe parser
import { containsProfanity } from "./profanityFilter.js"; // import profanity filter dari file terpisah
import { useChatSessions } from "./useChatSessions.js"; // chat history, persisted di localStorage
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ChatBubble from "./components/ChatBubble.jsx";
import TypingIndicator from "./components/TypingIndicator.jsx";
import { FiSend } from "react-icons/fi";
import Project from "./components/Project.jsx";
import About from "./components/About.jsx";

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

// Rendered inside <BrowserRouter> (see App() below) so it can use useNavigate -
// needed to jump back to "/" when a history item is clicked from another page.
function AppShell() {
  const navigate = useNavigate();
  // set current time
  const [currentTime, setCurrentTime] = React.useState(get_time(new Date()));
  // chat history - sessions persisted in localStorage, no backend
  const {
    sessions,
    activeSessionId,
    activeMessages,
    createNewSessionWithMessage,
    appendMessageToSession,
    startNewChat,
    selectSession,
    deleteSession,
  } = useChatSessions();
  // state untuk input field
  const [inputValue, setInputValue] = React.useState("");
  // status training model neural network (async, tidak block UI)
  const [modelStatus, setModelStatus] = React.useState("loading"); // loading | ready | error
  // status "Hermes sedang mengetik..."
  const [isTyping, setIsTyping] = React.useState(false);
  // ref untuk auto scroll ke bottom
  const chatFeedRef = useRef(null);
  // ref untuk trained model (network, dictionary, data_responses, encode)
  const modelRef = useRef(null);
  // ref untuk autofocus input chat
  const inputRef = useRef(null);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(get_time(new Date()));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Latih model secara async saat komponen mount, supaya UI tidak blocking
  React.useEffect(() => {
    let cancelled = false;

    initializeModel()
      .then((model) => {
        if (cancelled) return;
        modelRef.current = model;
        setModelStatus("ready");
      })
      .catch((error) => {
        console.error("❌ Gagal inisialisasi model:", error);
        if (cancelled) return;
        setModelStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Autofocus input chat begitu model siap
  React.useEffect(() => {
    if (modelStatus === "ready" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [modelStatus]);

  // Auto scroll ke bawah saat ada pesan baru / status typing berubah
  React.useEffect(() => {
    if (chatFeedRef.current) {
      chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
    }
  }, [activeMessages, isTyping]);

  // make a prediction - improved error handling
  function predict_bot(txt_chat_input) {
    try {
      const model = modelRef.current;
      if (!model) {
        throw new Error("Model belum siap");
      }

      // encode input text
      const encoded = model.encode(clean_input(txt_chat_input), model.dictionary);
      // predict the response
      const json_output = model.network.run(encoded);
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

      const pred_responses = model.data_responses.find(
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
    } catch (error) {
      // Log error details untuk debugging
      console.error("❌ Error dalam predict_bot:", error.message);
      console.error("Stack trace:", error.stack);
      // Return fallback response jika ada error
      return ["Maaf, terjadi kesalahan saat memproses respons. Coba lagi.", 0];
    }
  }

  // compile/execute chatbot
  function run_chatbot() {
    const input_chat = inputValue.trim();

    // Tracks which session this whole exchange belongs to. Starts as
    // whatever session is currently active (possibly null, for a fresh
    // "New Chat"). `sid` is a plain local variable (not React state), so it
    // stays correct across both the synchronous call below and the delayed
    // one from setTimeout, purely via normal JS closure semantics - no
    // dependency on React re-rendering in time, which is what made the
    // previous version (checking session existence against `sessions`
    // state) split a single exchange across two sessions.
    let sid = activeSessionId;

    const addMessage = (message) => {
      if (sid === null) {
        sid = createNewSessionWithMessage(message);
      } else {
        appendMessageToSession(sid, message);
      }
    };

    const addBotMessage = (message, delay = 450) => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        if (sid === null) {
          sid = createNewSessionWithMessage(message);
        } else {
          appendMessageToSession(sid, message);
        }
      }, delay);
    };

    if (modelStatus !== "ready" || input_chat.length === 0) {
      if (input_chat.length === 0 && modelStatus === "ready") {
        const emptyChatResponses = [
          "Ada yang bisa saya bantu?",
          "Apakah kamu tersesat?",
          "Saya ada disini, apa yang ingin kamu tanyakan?",
        ];
        const randomResponse =
          emptyChatResponses[
            Math.floor(Math.random() * emptyChatResponses.length)
          ];

        addBotMessage(response_bot(randomResponse, 100, get_time(new Date())));
        setInputValue("");
      }
      return;
    }

    if (containsProfanity(input_chat)) {
      setInputValue("");
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

      addBotMessage(
        response_bot(randomResponse, 100, get_time(new Date())),
        1000,
      );
      return;
    }

    // Tambahkan input user ke chat messages
    addMessage(response_user(input_chat, get_time(new Date())));
    setInputValue("");

    // Periksa apakah pertanyaan berkaitan dengan matematika
    if (isMathExpression(input_chat)) {
      try {
        const mathResult = parseMathExpression(input_chat); // use safe parser, bukan eval

        // Cek apakah parsing berhasil
        if (mathResult === "ERROR" || mathResult === undefined) {
          console.warn("⚠️ Math parsing returned ERROR for:", input_chat);
          addBotMessage(
            response_bot(
              "Maaf, format perhitungan tidak valid. Coba dengan format yang benar.",
              0,
              get_time(new Date()),
            ),
          );
        } else {
          const mathResponse = getMathResponse(input_chat, mathResult);
          addBotMessage(
            response_bot(mathResponse, 100, get_time(new Date())),
          );
        }
      } catch (error) {
        console.error("❌ Error processing math expression:", error.message);
        addBotMessage(
          response_bot(
            "Maaf, terjadi kesalahan saat menghitung. Silakan coba lagi.",
            0,
            get_time(new Date()),
          ),
        );
      }
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

      addBotMessage(response_bot(randomResponse, 100, get_time(new Date())));
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
      addBotMessage(response_bot(randomResponse, 100, get_date(new Date())));
    } else if (
      input_chat.toLowerCase().includes("bulan ini tanggal berapa")
    ) {
      const specificResponse = `Sekarang bulan ${new Date().toLocaleString(
        "default",
        { month: "long" },
      )}, tanggal: ${new Date().getDate()}`;
      addBotMessage(
        response_bot(specificResponse, 100, get_date(new Date())),
      );
    } else if (
      input_chat.toLowerCase().includes("tahun ini tanggal berapa")
    ) {
      const specificResponse = `Sekarang tahun ${new Date().getFullYear()}, tanggal: ${new Date().getDate()}`;
      addBotMessage(
        response_bot(specificResponse, 100, get_date(new Date())),
      );
    } else if (input_chat.toLowerCase().includes("hari ini hari apa")) {
      const dayOfWeek = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
      });
      const specificResponse = `Hari ini adalah ${dayOfWeek}, ${get_date(
        new Date(),
      )}`;
      addBotMessage(
        response_bot(specificResponse, 100, get_date(new Date())),
      );
    } else {
      // Jika tidak, melakukan prediksi respons chatbot seperti sebelumnya
      const [respond_bot, prob_bot] = predict_bot(input_chat);
      const prob_val = (parseFloat(prob_bot) * 100).toFixed(2);

      console.log("Response: " + respond_bot);

      const threshold = 50;
      if (prob_val > threshold) {
        addBotMessage(
          response_bot(respond_bot, prob_val, get_time(new Date())),
        );
      } else {
        addBotMessage(
          response_bot(
            "Maaf, Saya tidak mengerti, ada yang bisa saya bantu?",
            prob_val,
            get_time(new Date()),
          ),
        );
      }
    }
  }

  // handle button function
  const handleButtonSend = () => {
    run_chatbot();
  };

  // pressing Enter key
  const _handleKeyDown = (e) => {
    if (e.key === "Enter") {
      run_chatbot();
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const isInputDisabled = modelStatus !== "ready";
  const isSendDisabled = isInputDisabled || inputValue.trim().length === 0;

  return (
    <div className="App">
      <div className="card-side">
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onNewChat={() => {
            startNewChat();
            navigate("/");
          }}
          onSelectSession={(id) => {
            selectSession(id);
            navigate("/");
          }}
          onDeleteSession={deleteSession}
        />
      </div>
      <div className="card d-flex flex-column vh-100 overflow-hidden">
        <Header />
          <Routes>
            <Route
              path="/"
              element={
                <div
                  className="card-body"
                  id="content-chat-feed"
                  ref={chatFeedRef}
                >
                  {/* Initial welcome message */}
                  <ChatBubble
                    sender="bot"
                    text="Hi, selamat datang :)"
                    time={currentTime}
                  />

                  {activeMessages.map((message, index) => (
                    <ChatBubble key={index} {...message} />
                  ))}

                  {isTyping && <TypingIndicator />}

                  {modelStatus === "loading" && (
                    <div className="model-loading">
                      <img src={logobot} alt="Hermes" className="model-loading-avatar" />
                      <div className="model-loading-spinner" />
                      <p>Hermes AI sedang menyiapkan model neural network...</p>
                    </div>
                  )}

                  {modelStatus === "error" && (
                    <div className="model-loading model-error">
                      <p>
                        Gagal memuat model Hermes AI. Coba refresh halaman.
                      </p>
                    </div>
                  )}
                </div>
              }
            />
            <Route
              path="/project"
              element={
                <div className="page-scroll">
                  <Project />
                </div>
              }
            />
            <Route
              path="/about"
              element={
                <div className="page-scroll">
                  <About />
                </div>
              }
            />
          </Routes>
          <Routes>
            <Route
              path="/"
              element={
                <div className="card-footer">
                  <div className="input-group">
                    <input
                      ref={inputRef}
                      type="text"
                      className="form-control"
                      id="input-chat"
                      placeholder={
                        isInputDisabled
                          ? "Menyiapkan Hermes AI..."
                          : "Message Hermes"
                      }
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={_handleKeyDown}
                      disabled={isInputDisabled}
                    />
                    <div className="input-group-append">
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={handleButtonSend}
                        disabled={isSendDisabled}
                      >
                        <span>
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
  );
}

// Thin wrapper so AppShell renders below <BrowserRouter> and can use
// useNavigate() (required for sidebar history clicks to jump back to "/").
function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
