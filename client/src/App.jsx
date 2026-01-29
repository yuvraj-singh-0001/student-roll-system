import { BrowserRouter, Routes, Route } from "react-router-dom";
// General Imports
import Home from "./pages/Home";
// Student Imports
import StudentDashboard from "./pages/Student/StudentDashboard";
import ExamRegister from "./pages/Student/ExamRegister";
import Exam from "./pages/Student/Exam";
import ExamResult from "./pages/Student/ExamResult";

// Admin Imports
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminQuestions from "./pages/admin/AdminQuestions";
import ExamDashboard from "./pages/admin/ExamDashboard";
import AddStudent from "./pages/admin/AddStudent";
import ViewStudents from "./pages/admin/ViewStudents";
import SendNotification from "./pages/admin/SendNotification";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/register" element={<ExamRegister />} />
        <Route path="/student/exam" element={<Exam />} />
        <Route path="/student/result" element={<ExamResult />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/questions" element={<AdminQuestions />} />
        <Route path="/admin/exam-dashboard" element={<ExamDashboard />} />
        <Route path="/admin/add-student" element={<AddStudent />} />
        <Route path="/admin/view-students" element={<ViewStudents />} />
        <Route path="/admin/send-notification" element={<SendNotification />} />
      </Routes>
    </BrowserRouter>
  );
}
