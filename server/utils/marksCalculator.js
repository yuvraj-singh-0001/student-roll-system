const MARKS = {
  correct: { full: 1, middle: 0.5, low: 0.25 },
  wrong: { full: -1, middle: -0.5, low: -0.25 }
};

function getMarks(isCorrect, confidenceLevel) {
  if (!confidenceLevel || confidenceLevel === "middle") confidenceLevel = "middle";
  const table = isCorrect ? MARKS.correct : MARKS.wrong;
  return table[confidenceLevel] ?? 0;
}

module.exports = { getMarks, MARKS };
