require("dotenv").config();
const connectDB = require("../src/api/config/db");
const Question = require("../src/models/Question");

const QUESTIONS = [
  { questionNumber: 1, questionText: "What is the capital of India?", options: [{ key: "A", text: "Mumbai" }, { key: "B", text: "Delhi" }, { key: "C", text: "Kolkata" }, { key: "D", text: "Chennai" }], correctAnswer: "B" },
  { questionNumber: 2, questionText: "2 + 2 = ?", options: [{ key: "A", text: "3" }, { key: "B", text: "4" }, { key: "C", text: "5" }, { key: "D", text: "6" }], correctAnswer: "B" },
  { questionNumber: 3, questionText: "Which planet is known as the Red Planet?", options: [{ key: "A", text: "Venus" }, { key: "B", text: "Mars" }, { key: "C", text: "Jupiter" }, { key: "D", text: "Saturn" }], correctAnswer: "B" },
  { questionNumber: 4, questionText: "How many days are there in a leap year?", options: [{ key: "A", text: "364" }, { key: "B", text: "365" }, { key: "C", text: "366" }, { key: "D", text: "367" }], correctAnswer: "C" },
  { questionNumber: 5, questionText: "What is 10 × 5?", options: [{ key: "A", text: "40" }, { key: "B", text: "50" }, { key: "C", text: "55" }, { key: "D", text: "60" }], correctAnswer: "B" },
  { questionNumber: 6, questionText: "Which is the largest ocean on Earth?", options: [{ key: "A", text: "Atlantic" }, { key: "B", text: "Indian" }, { key: "C", text: "Pacific" }, { key: "D", text: "Arctic" }], correctAnswer: "C" },
  { questionNumber: 7, questionText: "Who wrote 'Romeo and Juliet'?", options: [{ key: "A", text: "Charles Dickens" }, { key: "B", text: "William Shakespeare" }, { key: "C", text: "Jane Austen" }, { key: "D", text: "Mark Twain" }], correctAnswer: "B" },
  { questionNumber: 8, questionText: "What is the chemical symbol for water?", options: [{ key: "A", text: "CO2" }, { key: "B", text: "H2O" }, { key: "C", text: "NaCl" }, { key: "D", text: "O2" }], correctAnswer: "B" },
  { questionNumber: 9, questionText: "How many continents are there?", options: [{ key: "A", text: "5" }, { key: "B", text: "6" }, { key: "C", text: "7" }, { key: "D", text: "8" }], correctAnswer: "C" },
  { questionNumber: 10, questionText: "Which animal is known as the 'King of the Jungle'?", options: [{ key: "A", text: "Elephant" }, { key: "B", text: "Lion" }, { key: "C", text: "Tiger" }, { key: "D", text: "Bear" }], correctAnswer: "B" },
  { questionNumber: 11, questionText: "What is 15 − 7?", options: [{ key: "A", text: "6" }, { key: "B", text: "7" }, { key: "C", text: "8" }, { key: "D", text: "9" }], correctAnswer: "C" },
  { questionNumber: 12, questionText: "Which country is the Taj Mahal located in?", options: [{ key: "A", text: "Pakistan" }, { key: "B", text: "Bangladesh" }, { key: "C", text: "India" }, { key: "D", text: "Nepal" }], correctAnswer: "C" },
  { questionNumber: 13, questionText: "What is the square root of 81?", options: [{ key: "A", text: "7" }, { key: "B", text: "8" }, { key: "C", text: "9" }, { key: "D", text: "10" }], correctAnswer: "C" },
  { questionNumber: 14, questionText: "Which gas do plants absorb from the air?", options: [{ key: "A", text: "Oxygen" }, { key: "B", text: "Nitrogen" }, { key: "C", text: "Carbon dioxide" }, { key: "D", text: "Hydrogen" }], correctAnswer: "C" },
  { questionNumber: 15, questionText: "How many sides does a hexagon have?", options: [{ key: "A", text: "5" }, { key: "B", text: "6" }, { key: "C", text: "7" }, { key: "D", text: "8" }], correctAnswer: "B" },
  { questionNumber: 16, questionText: "What is the capital of France?", options: [{ key: "A", text: "London" }, { key: "B", text: "Berlin" }, { key: "C", text: "Paris" }, { key: "D", text: "Madrid" }], correctAnswer: "C" },
  { questionNumber: 17, questionText: "Which organ pumps blood through the body?", options: [{ key: "A", text: "Lungs" }, { key: "B", text: "Liver" }, { key: "C", text: "Heart" }, { key: "D", text: "Kidney" }], correctAnswer: "C" },
  { questionNumber: 18, questionText: "What is 12 ÷ 3?", options: [{ key: "A", text: "2" }, { key: "B", text: "3" }, { key: "C", text: "4" }, { key: "D", text: "6" }], correctAnswer: "C" },
  { questionNumber: 19, questionText: "Which is the smallest prime number?", options: [{ key: "A", text: "0" }, { key: "B", text: "1" }, { key: "C", text: "2" }, { key: "D", text: "3" }], correctAnswer: "C" },
  { questionNumber: 20, questionText: "How many hours are there in a day?", options: [{ key: "A", text: "12" }, { key: "B", text: "20" }, { key: "C", text: "24" }, { key: "D", text: "48" }], correctAnswer: "C" },
];

async function run() {
  await connectDB();
  await Question.deleteMany({ questionNumber: { $gte: 1, $lte: 20 } });
  const docs = QUESTIONS.map((q) => ({
    questionNumber: q.questionNumber,
    questionText: q.questionText,
    options: q.options,
    correctAnswer: q.correctAnswer,
  }));
  await Question.insertMany(docs);
  console.log("Added 20 questions to database.");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
