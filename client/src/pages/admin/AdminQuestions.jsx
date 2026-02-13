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
  correctAnswer: "", // simple / confidence / branch_child
  correctAnswers: [], // multiple
  parentQuestion: "", // branch_child
  branchKey: "A", // branch_child (A or B)
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
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "10px",
    padding: "12px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  };
  const labelStyle = { fontSize: "12px", color: "#555", fontWeight: 600 };
  const inputStyle = {
    width: "100%",
    padding: "7px 10px",
    marginTop: "6px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    outline: "none",
  };

  // jab examCode change ho, hum total question count fetch kar sakte the,
  // abhi simple rakh rahe hain, manual update karenge response se.

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

  // exam basic info change
  const handleExamInfoChange = (e) => {
    const { name, value } = e.target;
    setExamInfo((prev) => ({ ...prev, [name]: value }));
  };

  // question text change
  const handleQuestionTextChange = (e) => {
    setQuestion((prev) => ({ ...prev, questionText: e.target.value }));
  };

  // option text change
  const handleOptionChange = (index, value) => {
    setQuestion((prev) => {
      const newOptions = prev.options.map((opt, i) =>
        i === index ? { ...opt, text: value } : opt
      );
      return { ...prev, options: newOptions };
    });
  };

  // question type change
  const handleTypeChange = (e) => {
    const value = e.target.value;
    // type change karte hi type-specific fields reset
    setQuestion((prev) => ({
      ...getInitialQuestionState(),
      type: value,
      questionText: prev.questionText, // agar tum chaho to clear bhi kar sakte ho
      options: prev.options.map((opt) => ({ ...opt })),
    }));
  };

  // simple / confidence / branch_child → single correct
  const handleCorrectAnswerChange = (key) => {
    setQuestion((prev) => ({
      ...prev,
      correctAnswer: key,
    }));
  };

  // multiple → multi select correctAnswers
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

  // branch_child fields
  const handleBranchKeyChange = (e) => {
    setQuestion((prev) => ({
      ...prev,
      branchKey: e.target.value,
    }));
  };

  // submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setMessage("");
    if (!examInfo.examCode) {
      setMessage("Please enter examCode in exam details first.");
      return;
    }

    // basic validation frontend
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

    // type wise checks
    if (question.type === "simple" || question.type === "confidence" || question.type === "branch_child") {
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

    // body prepare
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
        setMessage("Question added successfully. Question no: " + res.data.data.questionNumber);
        setTotalQuestions((prev) => prev + 1);

        setTypeCounts((prev) => ({
          ...prev,
          [question.type]: (prev[question.type] || 0) + 1,
        }));

        if (question.type === "branch_parent") {
          setLatestBranchParent(res.data.data?.questionNumber || latestBranchParent);
        }

        // question text + options clear, type same rehne do
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
        margin: "12px auto",
        padding: "12px",
        border: "1px solid #e6e6e6",
        borderRadius: "10px",
        background: "#fff",
      }}
    >
      {/* Exam Info */}
      <h2>Olympiad Exam Setup (Admin)</h2>
      <p style={{ color: "#555", marginTop: "4px" }}>
        Pehle exam ka basic detail bharo, fir niche se 4 tarah ke questions add karo. Har submit ke baad question number auto increase hoga.
      </p>

      <div
        style={{
          marginBottom: "16px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "10px",
        }}
      >
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <h3 style={{ margin: 0 }}>Exam Details</h3>
            <span style={{ fontSize: "12px", color: "#888" }}>
              Required
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
                <div style={{ marginTop: "6px", fontSize: "12px", color: "#b45309" }}>
                  {examCodeNotice}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
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

        <div style={cardStyle}>
          <h3 style={{ margin: 0, marginBottom: "10px" }}>
            Question Summary
          </h3>
          <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
            Exam Code:{" "}
            <b style={{ color: "#222" }}>{examInfo.examCode || "Not set"}</b>
          </div>
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
            Latest Branch Parent (X):{" "}
            <b style={{ color: "#222" }}>
              {latestBranchParent ? `Q${latestBranchParent}` : metaLoading ? "Loading..." : "Not added"}
            </b>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "8px",
              fontSize: "13px",
            }}
          >
            <div style={{ padding: "8px", border: "1px solid #f0f0f0", borderRadius: "6px" }}>
              Total Added
              <div style={{ fontSize: "18px", fontWeight: 700 }}>{totalQuestions}</div>
            </div>
            <div style={{ padding: "8px", border: "1px solid #f0f0f0", borderRadius: "6px" }}>
              Simple
              <div style={{ fontSize: "18px", fontWeight: 700 }}>{typeCounts.simple}</div>
            </div>
            <div style={{ padding: "8px", border: "1px solid #f0f0f0", borderRadius: "6px" }}>
              Multiple
              <div style={{ fontSize: "18px", fontWeight: 700 }}>{typeCounts.multiple}</div>
            </div>
            <div style={{ padding: "8px", border: "1px solid #f0f0f0", borderRadius: "6px" }}>
              Confidence
              <div style={{ fontSize: "18px", fontWeight: 700 }}>{typeCounts.confidence}</div>
            </div>
            <div style={{ padding: "8px", border: "1px solid #f0f0f0", borderRadius: "6px" }}>
              Branch Parent
              <div style={{ fontSize: "18px", fontWeight: 700 }}>{typeCounts.branch_parent}</div>
            </div>
            <div style={{ padding: "8px", border: "1px solid #f0f0f0", borderRadius: "6px" }}>
              Branch Child
              <div style={{ fontSize: "18px", fontWeight: 700 }}>{typeCounts.branch_child}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Form */}
      <form onSubmit={handleSubmit}>
        <h3>Step 2: Add Questions</h3>

        {/* Question Type */}
        <div style={{ marginBottom: "12px" }}>
          <label>Question Type</label>
          <select
            value={question.type}
            onChange={handleTypeChange}
            style={{ display: "block", marginTop: "4px", padding: "6px" }}
          >
            <option value="simple">Set 1 - Simple (single correct)</option>
            <option value="multiple">Set 2 - Multiple correct</option>
            <option value="confidence">Set 3 - Confidence based</option>
            <option value="branch_parent">Set 4 - Branch parent (X choice)</option>
            <option value="branch_child">Set 4 - Branch child (A/B path question)</option>
          </select>

          <small style={{ color: "#777" }}>
            Simple: 1 right option. Multiple: 1–3 right options. Confidence: answer + confidence on student side. Branch: X se A/B path, phir child questions.
          </small>
        </div>

        {/* Question Text */}
        <div style={{ marginBottom: "12px" }}>
          <label>Question Text</label>
          <textarea
            value={question.questionText}
            onChange={handleQuestionTextChange}
            rows={3}
            placeholder="Enter your question here..."
            style={{ width: "100%", padding: "6px", marginTop: "4px" }}
          />
        </div>

        {/* Branch child extra fields */}
        {question.type === "branch_child" && (
          <div style={{ display: "flex", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
            <div style={{ fontSize: "12px", color: "#666" }}>
              Linked Parent (X):{" "}
              <b style={{ color: latestBranchParent ? "#222" : "#c00" }}>
                {latestBranchParent ? `Q${latestBranchParent}` : "Not found"}
              </b>
            </div>
            <div>
              <label>Branch Key</label>
              <select
                value={question.branchKey}
                onChange={handleBranchKeyChange}
                style={{ padding: "6px", marginTop: "4px" }}
              >
                <option value="A">A path</option>
                <option value="B">B path</option>
              </select>
            </div>
          </div>
        )}

        {/* Options */}
        <div style={{ marginBottom: "12px", padding: "10px", border: "1px solid #eee", borderRadius: "6px" }}>
          <label>
            Options ({question.type === "branch_parent" ? "A, B" : "A, B, C, D"})
          </label>
          {question.type === "branch_parent" && (
            <div style={{ fontSize: "12px", color: "#777", marginTop: "4px" }}>
              Branch parent me sirf A/B options required hain.
            </div>
          )}
          {optionList.map((opt, index) => (
            <div
              key={opt.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "6px",
              }}
            >
              <div style={{ width: "40px", fontWeight: "bold" }}>{opt.key}.</div>
              <input
                type="text"
                value={opt.text}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${opt.key}`}
                style={{ flex: 1, padding: "6px" }}
              />

              {/* Right answer selection UI */}
              {question.type === "simple" ||
              question.type === "confidence" ||
              question.type === "branch_child" ? (
                <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "14px" }}>
                  <input
                    type="radio"
                    name="correctSingle"
                    checked={question.correctAnswer === opt.key}
                    onChange={() => handleCorrectAnswerChange(opt.key)}
                  />
                  Correct
                </label>
              ) : null}

              {question.type === "multiple" && (
                <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "14px" }}>
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

        {/* Info about type behaviour for admin samajh ke liye */}
        <div
          style={{
            marginBottom: "12px",
            padding: "10px",
            background: "#f9f9f9",
            borderRadius: "6px",
            fontSize: "13px",
            color: "#444",
          }}
        >
          {question.type === "simple" && (
            <ul style={{ margin: 0, paddingLeft: "18px" }}>
              <li>Student ko 1 sahi option choose karna hoga.</li>
              <li>Marks: sahi = +1, galat = −0.25, skip = 0.</li>
            </ul>
          )}

          {question.type === "multiple" && (
            <ul style={{ margin: 0, paddingLeft: "18px" }}>
              <li>Yahan 1, 2, 3 jitne bhi options sahi ho sakte hain.</li>
              <li>Marks: total 2 marks. Har sahi option = 2 / (total correct).</li>
              <li>Agar koi galat option bhi tick hua to poora question = −0.25.</li>
            </ul>
          )}

          {question.type === "confidence" && (
            <ul style={{ margin: 0, paddingLeft: "18px" }}>
              <li>Student answer select karega, phir confidence (low/mid/high) choose karega.</li>
              <li>High: sahi +2, galat −0.5. Mid: sahi +1, galat −0.25. Low: sahi +0.25, galat −0.10.</li>
            </ul>
          )}

          {question.type === "branch_parent" && (
            <ul style={{ margin: 0, paddingLeft: "18px" }}>
              <li>Ye X type question hai. Student sirf A/B jaisa path choose karega.</li>
              <li>Is question par koi marks/negative nahi lagega, bas branch choose hogi.</li>
            </ul>
          )}

          {question.type === "branch_child" && (
            <ul style={{ margin: 0, paddingLeft: "18px" }}>
              <li>Ye X ke baad aane wale simple questions hain (A ya B path ke liye).</li>
              <li>Marks simple jaisa: sahi +1, galat −0.25.</li>
            </ul>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading ? "Saving..." : "Add Question"}
        </button>
      </form>

      {/* Message */}
      {message && (
        <div style={{ marginTop: "12px", color: message.startsWith("Error") ? "red" : "green" }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default AdminQuestionBuilder;
