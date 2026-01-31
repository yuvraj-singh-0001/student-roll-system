import { BrowserRouter, Routes, Route } from "react-router-dom";

// General
import Home from "./pages/Home";

// Auth
import Login from "./pages/Login";
import Register from "./pages/Register";
import Payment from "./pages/Payment";

// Student
import StudentDashboard from "./pages/Student/StudentDashboard";
import ExamRegister from "./pages/Student/ExamRegister";
import Exam from "./pages/Student/Exam";
import ExamResult from "./pages/Student/ExamResult";

// Admin
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
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/payment" element={<Payment />} />

        {/* Student */}
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/register" element={<ExamRegister />} />
        <Route path="/student/exam" element={<Exam />} />
        <Route path="/student/result" element={<ExamResult />} />

        {/* Admin */}
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
