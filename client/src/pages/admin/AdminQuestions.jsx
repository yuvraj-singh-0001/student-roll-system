// src/components/AdminQuestionBuilder.jsx
import React, { useState, useEffect } from "react";
import { questionApi } from "../../api";

const initialExamInfo = {
  title: "",
  examCode: "",
  totalTimeMinutes: "",
  registrationPrice: "",
};

const getInitialQuestionState = () => ({
  type: "simple", // simple | multiple | confidence | branch_parent | branch_child
  questionText: "",
  options: [
    { key: "A", text: "" },
    { key: "B", text: "" },
    { key: "C", text: "" },
    { key: "D", text: "" },
  ],
  correctAnswer: "",
  correctAnswers: [],
  parentQuestion: "",
  branchKey: "A",
});

const initialTypeCounts = {
  simple: 0,
  multiple: 0,
  confidence: 0,
  branch_parent: 0,
  branch_child: 0,
};

function AdminQuestionBuilder() {
  const [examInfo, setExamInfo] = useState(initialExamInfo);
  const [question, setQuestion] = useState(getInitialQuestionState);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [typeCounts, setTypeCounts] = useState(initialTypeCounts);
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [latestBranchParent, setLatestBranchParent] = useState(null);
  const [examCodeNotice, setExamCodeNotice] = useState("");
  const [message, setMessage] = useState("");

  const cardStyle = {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "16px 18px",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e5e7eb",
  };
  const labelStyle = {
    fontSize: "12px",
    color: "#4b5563",
    fontWeight: 600,
    display: "block",
    marginBottom: "4px",
  };
  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    fontSize: "13px",
  };

  useEffect(() => {
    setMessage("");
  }, [question.type, examInfo.examCode]);

  useEffect(() => {
    const code = examInfo.examCode.trim();
    let cancelled = false;

    if (!code) {
      setTotalQuestions(0);
      setTypeCounts(initialTypeCounts);
      setLatestBranchParent(null);
      setExamCodeNotice("");
      return () => {
        cancelled = true;
      };
    }

    setMetaLoading(true);
    setTotalQuestions(0);
    setTypeCounts(initialTypeCounts);
    setLatestBranchParent(null);
    setExamCodeNotice("");

    (async () => {
      try {
        const res = await questionApi.byExamCode(code);
        const data = res.data || res;
        const list = data?.questions || data?.data || [];
        if (cancelled) return;

        const counts = { ...initialTypeCounts };
        let latestParent = null;
        list.forEach((q) => {
          counts[q.type] = (counts[q.type] || 0) + 1;
          if (q.type === "branch_parent") {
            if (latestParent === null || q.questionNumber > latestParent) {
              latestParent = q.questionNumber;
            }
          }
        });

        setTypeCounts(counts);
        setTotalQuestions(list.length);
        setLatestBranchParent(latestParent);
        if (list.length > 0) {
          setExamCodeNotice(
            `Exam Code already taken. Existing questions: ${list.length}. New questions will be added to the same exam.`
          );
        } else {
          setExamCodeNotice("");
        }
      } catch (err) {
        if (!cancelled) {
          setLatestBranchParent(null);
          setExamCodeNotice("");
        }
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [examInfo.examCode]);

  const handleExamInfoChange = (e) => {
    const { name, value } = e.target;
    setExamInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionTextChange = (e) => {
    setQuestion((prev) => ({ ...prev, questionText: e.target.value }));
  };

  const handleOptionChange = (index, value) => {
    setQuestion((prev) => {
      const newOptions = prev.options.map((opt, i) =>
        i === index ? { ...opt, text: value } : opt
      );
      return { ...prev, options: newOptions };
    });
  };

  const handleTypeChange = (e) => {
    const value = e.target.value;
    setQuestion((prev) => ({
      ...getInitialQuestionState(),
      type: value,
      questionText: prev.questionText,
      options: prev.options.map((opt) => ({ ...opt })),
    }));
  };

  const handleCorrectAnswerChange = (key) => {
    setQuestion((prev) => ({
      ...prev,
      correctAnswer: key,
    }));
  };

  const handleMultipleCorrectToggle = (key) => {
    setQuestion((prev) => {
      const exists = prev.correctAnswers.includes(key);
      let updated;
      if (exists) {
        updated = prev.correctAnswers.filter((k) => k !== key);
      } else {
        updated = [...prev.correctAnswers, key];
      }
      return { ...prev, correctAnswers: updated };
    });
  };

  const handleBranchKeyChange = (e) => {
    setQuestion((prev) => ({
      ...prev,
      branchKey: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setMessage("");
    if (!examInfo.examCode) {
      setMessage("Please enter examCode in exam details first.");
      return;
    }

    if (!question.questionText.trim()) {
      setMessage("Please enter question text.");
      return;
    }
    const requiredOptionCount = question.type === "branch_parent" ? 2 : 4;
    const emptyOption = question.options
      .slice(0, requiredOptionCount)
      .find((opt) => !opt.text.trim());
    if (emptyOption) {
      setMessage(
        `Please fill all ${requiredOptionCount} options for this question type.`
      );
      return;
    }

    if (
      question.type === "simple" ||
      question.type === "confidence" ||
      question.type === "branch_child"
    ) {
      if (!question.correctAnswer) {
        setMessage("Please select one correct option.");
        return;
      }
    }

    if (question.type === "multiple") {
      if (!question.correctAnswers.length) {
        setMessage("Please select at least one correct option for multiple type.");
        return;
      }
    }

    if (question.type === "branch_child") {
      if (!latestBranchParent) {
        setMessage("Please add Branch Parent (X) question first.");
        return;
      }
      if (!question.branchKey) {
        setMessage("Please select branchKey (A/B) for branch_child.");
        return;
      }
    }

    const payloadOptions =
      question.type === "branch_parent"
        ? question.options.slice(0, 2)
        : question.options;

    const payload = {
      examCode: examInfo.examCode.trim(),
      examTitle: examInfo.title,
      totalTimeMinutes: examInfo.totalTimeMinutes,
      registrationPrice: examInfo.registrationPrice,
      type: question.type,
      questionText: question.questionText,
      options: payloadOptions,
    };

    if (question.type === "simple") {
      payload.correctAnswer = question.correctAnswer;
    }

    if (question.type === "multiple") {
      payload.correctAnswers = question.correctAnswers;
    }

    if (question.type === "confidence") {
      payload.correctAnswer = question.correctAnswer;
      payload.confidenceRequired = true;
    }

    if (question.type === "branch_parent") {
      // no correctAnswer / correctAnswers
    }

    if (question.type === "branch_child") {
      payload.correctAnswer = question.correctAnswer;
      payload.parentQuestion = Number(latestBranchParent);
      payload.branchKey = question.branchKey;
    }

    try {
      setLoading(true);
      const res = await questionApi.add(payload);
      setLoading(false);

      if (res.data && res.data.success) {
        setMessage(
          "Question added successfully. Question no: " +
            res.data.data.questionNumber
        );
        setTotalQuestions((prev) => prev + 1);

        setTypeCounts((prev) => ({
          ...prev,
          [question.type]: (prev[question.type] || 0) + 1,
        }));

        if (question.type === "branch_parent") {
          setLatestBranchParent(
            res.data.data?.questionNumber || latestBranchParent
          );
        }

        setQuestion((prev) => ({
          ...getInitialQuestionState(),
          type: prev.type,
        }));
      } else {
        setMessage(res.data.message || "Failed to add question.");
      }
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data && err.response.data.message) {
        setMessage("Error: " + err.response.data.message);
      } else {
        setMessage("Server error, please try again.");
      }
    }
  };

  const optionList =
    question.type === "branch_parent"
      ? question.options.slice(0, 2)
      : question.options;

  return (
    <div
      style={{
        maxWidth: "1200px",
        width: "100%",
        margin: "16px auto",
        padding: "16px",
        borderRadius: "16px",
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "16px" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: 700,
            color: "#111827",
          }}
        >
          Olympiad Exam Setup (Admin)
        </h2>
        <p
          style={{
            color: "#6b7280",
            marginTop: "4px",
            fontSize: "13px",
          }}
        >
          Step 1: Fill exam details. Step 2: Choose question type and add
          questions one by one.
        </p>
      </div>

      {/* Top grid: Exam info + summary */}
      <div
        style={{
          marginBottom: "18px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "14px",
        }}
      >
        {/* Exam details card */}
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                Exam Details
              </h3>
              <span
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                Required before adding questions
              </span>
            </div>
            <span
              style={{
                fontSize: "11px",
                color: "#047857",
                background: "#ecfdf3",
                padding: "2px 8px",
                borderRadius: "999px",
                border: "1px solid #bbf7d0",
              }}
            >
              Step 1
            </span>
          </div>

          <div style={{ display: "grid", gap: "10px" }}>
            <div>
              <label style={labelStyle}>Title of Olympiad Paper</label>
              <input
                type="text"
                name="title"
                value={examInfo.title}
                onChange={handleExamInfoChange}
                placeholder="e.g. FINAL EXAM V2"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Exam Code (Unique)</label>
              <input
                type="text"
                name="examCode"
                value={examInfo.examCode}
                onChange={handleExamInfoChange}
                placeholder="e.g. FINAL_EXAM_V2"
                style={inputStyle}
              />
              {examCodeNotice && (
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "12px",
                    color: "#b45309",
                    background: "#fffbeb",
                    padding: "6px 8px",
                    borderRadius: "6px",
                    border: "1px solid #fcd34d",
                  }}
                >
                  {examCodeNotice}
                </div>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gap: "10px",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(160px, 1fr))",
              }}
            >
              <div>
                <label style={labelStyle}>Total Time (minutes)</label>
                <input
                  type="number"
                  name="totalTimeMinutes"
                  value={examInfo.totalTimeMinutes}
                  onChange={handleExamInfoChange}
                  placeholder="e.g. 60"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Registration Price</label>
                <input
                  type="number"
                  name="registrationPrice"
                  value={examInfo.registrationPrice}
                  onChange={handleExamInfoChange}
                  placeholder="e.g. 299"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary card */}
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
              alignItems: "center",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "15px",
                fontWeight: 600,
                color: "#111827",
              }}
            >
              Question Summary
            </h3>
            <span
              style={{
                fontSize: "11px",
                color: "#2563eb",
                background: "#eff6ff",
                padding: "2px 8px",
                borderRadius: "999px",
                border: "1px solid #bfdbfe",
              }}
            >
              Live
            </span>
          </div>

          <div
            style={{
              fontSize: "13px",
              color: "#4b5563",
              marginBottom: "6px",
            }}
          >
            Exam Code:{" "}
            <b style={{ color: "#111827" }}>
              {examInfo.examCode || "Not set"}
            </b>
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#4b5563",
              marginBottom: "10px",
            }}
          >
            Latest Branch Parent (X):{" "}
            <b style={{ color: "#111827" }}>
              {latestBranchParent
                ? `Q${latestBranchParent}`
                : metaLoading
                ? "Loading..."
                : "Not added"}
            </b>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "8px",
              fontSize: "13px",
            }}
          >
            <div
              style={{
                padding: "8px",
                borderRadius: "8px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              Total Added
              <div
                style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}
              >
                {totalQuestions}
              </div>
            </div>
            <div
              style={{
                padding: "8px",
                borderRadius: "8px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              Simple
              <div style={{ fontSize: "18px", fontWeight: 700 }}>
                {typeCounts.simple}
              </div>
            </div>
            <div
              style={{
                padding: "8px",
                borderRadius: "8px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              Multiple
              <div style={{ fontSize: "18px", fontWeight: 700 }}>
                {typeCounts.multiple}
              </div>
            </div>
            <div
              style={{
                padding: "8px",
                borderRadius: "8px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              Confidence
              <div style={{ fontSize: "18px", fontWeight: 700 }}>
                {typeCounts.confidence}
              </div>
            </div>
            <div
              style={{
                padding: "8px",
                borderRadius: "8px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              Branch Parent
              <div style={{ fontSize: "18px", fontWeight: 700 }}>
                {typeCounts.branch_parent}
              </div>
            </div>
            <div
              style={{
                padding: "8px",
                borderRadius: "8px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              Branch Child
              <div style={{ fontSize: "18px", fontWeight: 700 }}>
                {typeCounts.branch_child}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Form */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            ...cardStyle,
            marginBottom: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
              alignItems: "center",
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                Step 2: Add Question
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                Choose question type, write question, fill options, then mark
                correct answer(s).
              </p>
            </div>
            <span
              style={{
                fontSize: "11px",
                color: "#0369a1",
                background: "#e0f2fe",
                padding: "2px 8px",
                borderRadius: "999px",
                border: "1px solid #7dd3fc",
              }}
            >
              Step 2
            </span>
          </div>

          {/* Type + Question text in 2-column layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 260px) minmax(0, 1fr)",
              gap: "14px",
              alignItems: "flex-start",
            }}
          >
            {/* Left: type and helper description */}
            <div>
              <label style={labelStyle}>Question Type</label>
              <select
                value={question.type}
                onChange={handleTypeChange}
                style={{
                  ...inputStyle,
                  padding: "8px 10px",
                }}
              >
                <option value="simple">
                  Set 1 - Simple (single correct)
                </option>
                <option value="multiple">
                  Set 2 - Multiple correct
                </option>
                <option value="confidence">
                  Set 3 - Confidence based
                </option>
                <option value="branch_parent">
                  Set 4 - Branch parent (X choice)
                </option>
                <option value="branch_child">
                  Set 4 - Branch child (A/B path question)
                </option>
              </select>

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "11px",
                  color: "#6b7280",
                  background: "#f9fafb",
                  borderRadius: "8px",
                  padding: "8px",
                  border: "1px dashed #e5e7eb",
                }}
              >
                {question.type === "simple" && (
                  <>
                    Simple: 1 correct option. Student gets +1 / -0.25 /
                    0 based on answer.
                  </>
                )}
                {question.type === "multiple" && (
                  <>
                    Multiple: 1–3 options correct. Total 2 marks, wrong
                    selection = -0.25.
                  </>
                )}
                {question.type === "confidence" && (
                  <>
                    Confidence: student chooses answer + confidence
                    level. Marks vary by confidence.
                  </>
                )}
                {question.type === "branch_parent" && (
                  <>
                    Branch parent (X): student chooses A or B only,
                    no direct marks.
                  </>
                )}
                {question.type === "branch_child" && (
                  <>
                    Branch child: appears after X, behaves like simple
                    question (+1 / -0.25).
                  </>
                )}
              </div>
            </div>

            {/* Right: Question text + branch child small section */}
            <div>
              <label style={labelStyle}>Question Text</label>
              <textarea
                value={question.questionText}
                onChange={handleQuestionTextChange}
                rows={4}
                placeholder="Enter your question here..."
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: "80px",
                }}
              />

              {question.type === "branch_child" && (
                <div
                  style={{
                    marginTop: "8px",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    alignItems: "center",
                    fontSize: "12px",
                    color: "#1e3a8a",
                  }}
                >
                  <span>
                    Linked Parent (X):{" "}
                    <b>
                      {latestBranchParent
                        ? `Q${latestBranchParent}`
                        : "Not found"}
                    </b>
                  </span>
                  <span style={{ marginLeft: "auto" }}>
                    Branch Key:{" "}
                    <select
                      value={question.branchKey}
                      onChange={handleBranchKeyChange}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "999px",
                        border: "1px solid #93c5fd",
                      }}
                    >
                      <option value="A">A path</option>
                      <option value="B">B path</option>
                    </select>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Options block */}
          <div
            style={{
              marginTop: "14px",
              padding: "10px 12px",
              borderRadius: "10px",
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "6px",
                alignItems: "center",
              }}
            >
              <label style={labelStyle}>
                Options (
                {question.type === "branch_parent" ? "A, B" : "A, B, C, D"})
              </label>
              <span
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                }}
              >
                Mark correct using radio / checkbox
              </span>
            </div>

            {question.type === "branch_parent" && (
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "6px",
                }}
              >
                Branch parent me sirf A/B options required hain.
              </div>
            )}

            {optionList.map((opt, index) => (
              <div
                key={opt.key}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "40px minmax(0,1fr) max-content",
                  gap: "8px",
                  alignItems: "center",
                  marginTop: "6px",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "#111827",
                  }}
                >
                  {opt.key}.
                </div>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${opt.key}`}
                  style={{
                    ...inputStyle,
                    padding: "6px 8px",
                    fontSize: "13px",
                  }}
                />

                {(question.type === "simple" ||
                  question.type === "confidence" ||
                  question.type === "branch_child") && (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                      color: "#374151",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <input
                      type="radio"
                      name="correctSingle"
                      checked={question.correctAnswer === opt.key}
                      onChange={() => handleCorrectAnswerChange(opt.key)}
                    />
                    Correct
                  </label>
                )}

                {question.type === "multiple" && (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                      color: "#374151",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={question.correctAnswers.includes(opt.key)}
                      onChange={() => handleMultipleCorrectToggle(opt.key)}
                    />
                    Correct
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom info + submit */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              flex: "1 1 260px",
              fontSize: "12px",
              color: "#4b5563",
              background: "#f9fafb",
              borderRadius: "10px",
              padding: "10px 12px",
              border: "1px solid #e5e7eb",
            }}
          >
            {question.type === "simple" && (
              <>
                Simple: 1 correct option. Marks: correct +1, wrong -0.25,
                skip 0.
              </>
            )}
            {question.type === "multiple" && (
              <>
                Multiple: total 2 marks. Har correct option ke marks
                equally split; koi bhi galat option select hua to -0.25.
              </>
            )}
            {question.type === "confidence" && (
              <>
                Confidence: High / Mid / Low confidence ke hisaab se
                marks change hote hain (admin ke note ke according).
              </>
            )}
            {question.type === "branch_parent" && (
              <>
                Branch parent: sirf A / B choose hota hai, is pe marks
                nahi milte. Ye bas path decide karta hai.
              </>
            )}
            {question.type === "branch_child" && (
              <>
                Branch child: simple jaisa behave karta hai, X ke baad
                show hota hai (A/B path ke according).
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "9px 18px",
              background:
                "linear-gradient(to right, #2563eb, #1d4ed8)",
              color: "#ffffff",
              border: "none",
              borderRadius: "999px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              boxShadow: "0 4px 10px rgba(37, 99, 235, 0.35)",
              opacity: loading ? 0.8 : 1,
              minWidth: "150px",
            }}
          >
            {loading ? "Saving..." : "Add Question"}
          </button>
        </div>
      </form>

      {message && (
        <div
          style={{
            marginTop: "12px",
            padding: "8px 10px",
            borderRadius: "8px",
            fontSize: "13px",
            color: message.startsWith("Error") ? "#b91c1c" : "#166534",
            background: message.startsWith("Error")
              ? "#fef2f2"
              : "#ecfdf3",
            border: `1px solid ${
              message.startsWith("Error") ? "#fecaca" : "#bbf7d0"
            }`,
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default AdminQuestionBuilder;
