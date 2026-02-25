import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  questionsByExam: {},
};

const examSlice = createSlice({
  name: "exam",
  initialState,
  reducers: {
    setExamQuestions(state, action) {
      const { examCode, exam, questions, fetchedAt } = action.payload || {};
      const code = String(examCode || "").trim();
      if (!code) return;
      state.questionsByExam[code] = {
        exam: exam || null,
        questions: Array.isArray(questions) ? questions : [],
        fetchedAt: Number.isFinite(Number(fetchedAt)) ? Number(fetchedAt) : Date.now(),
      };
    },
    clearExamQuestions(state, action) {
      const code = String(action.payload || "").trim();
      if (!code) return;
      delete state.questionsByExam[code];
    },
  },
});

export const { setExamQuestions, clearExamQuestions } = examSlice.actions;
export default examSlice.reducer;
