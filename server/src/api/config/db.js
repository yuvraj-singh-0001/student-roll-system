const mongoose = require("mongoose");
const Question = require("../../models/Question");
const ExamConfig = require("../../models/ExamConfig");
const QuestionCounter = require("../../models/QuestionCounter");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected");

    // Fix legacy unique index on questionNumber (should be examCode+questionNumber)
    try {
      const collection = mongoose.connection.db.collection("questions");
      const indexes = await collection.indexes();
      const badIndex = indexes.find(
        (i) =>
          i.name === "questionNumber_1" ||
          (i.key &&
            i.key.questionNumber === 1 &&
            Object.keys(i.key).length === 1)
      );
      if (badIndex) {
        await collection.dropIndex(badIndex.name);
        console.log(`Dropped legacy index: ${badIndex.name}`);
      }
    } catch (idxErr) {
      console.warn("Index cleanup skipped:", idxErr.message);
    }

    // Ensure current indexes (examCode + questionNumber unique)
    try {
      await Question.syncIndexes();
      await ExamConfig.syncIndexes();
      await QuestionCounter.syncIndexes();
    } catch (syncErr) {
      console.warn("Index sync failed:", syncErr.message);
    }
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
// Export kiya hu ki dusre files me use kar saku
module.exports = connectDB;
