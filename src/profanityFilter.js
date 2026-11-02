// Profanity list - extracted to separate file for easy maintenance
// Indonesian dan English bad words

export const profanityList = [
  // Indonesian
  "bangsat",
  "anjir",
  "bangke",
  "kontol",
  "babi",
  "bajingan",
  "goblok",
  "idiot",
  "tolol",
  "kampret",
  "memek",
  
  // English
  "fuck",
  "bitch",
  "shit",
  "damn",
  "ass",
  "asshole",
  "bastard",
  "crap",
  "dick",
  "dickhead"
];

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Word-boundary match per kata, supaya "ass" tidak ke-flag di dalam kata
// seperti "grass"/"class"/"assassin" (Scunthorpe problem).
const profanityRegexes = profanityList.map(
  (word) => new RegExp(`\\b${escapeRegExp(word)}\\b`, "i"),
);

// Helper function untuk cek profanity
export function containsProfanity(input) {
  return profanityRegexes.some((regex) => regex.test(input));
}
