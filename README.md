# Hermes AI Chatbot

Hermes AI is a React-based chatbot that uses Brain.js to classify user intents from a bag-of-words model. It flattens categorized intent/response JSON, trains a neural network at startup, and replies with context-aware responses, math answers, and time/date info through a chat UI.

## Features
- Intent classification with Brain.js over flattened pattern/response data
- Math expression handling (powers, roots, trig, logs, factorial) and time/date replies
- Profanity filtering and confidence threshold fallback responses
- Sidebar with history placeholders; routes for Home (chat), About, and Contact
- Bootstrap styling plus custom CSS; uses a small amount of jQuery for chat feed updates

## Tech Stack
- React (CRA), React Router, Bootstrap
- Brain.js for the neural network
- jQuery for some DOM updates, react-icons for UI icons

## Project Structure
- `src/App.js` — main chat experience with routing
- `src/components/` — Sidebar, Header, About, Contact, NavTabs, etc.
- `src/functions.js` — utilities for dictionary building, data flattening, validation, time/date, and response templating
- `src/data/` — categorized pattern/response JSON files used to build the training set

## Data & Training Flow
1) Categorized JSON in `src/data` is flattened to `{phrase, result}` pairs and intent → responses lists.  
2) A dictionary is built from all phrases to create one-hot vectors.  
3) Brain.js trains a simple network at app startup and predicts the highest-probability intent for each message.  
4) The UI renders random responses for the predicted intent (or fallback if confidence is low), plus math/time/date handling before intent classification.

## Running Locally
```bash
npm install
npm start
```
Then open http://localhost:3000.

## Testing
```bash
npm test
```
(Only a basic header render test is provided.)

## Known Limitations / Notes
- Model training runs on the client at startup; it can block the UI on slower devices. Pretraining or async init is recommended.
- Math evaluation currently relies on `eval`; replacing with a safe parser is advised.
- jQuery-driven DOM updates inside React components can conflict with React state. A React-only state approach is recommended.
