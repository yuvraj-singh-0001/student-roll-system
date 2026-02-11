import { BrowserRouter, Routes, Route } from "react-router-dom";

// General
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Payment from "./pages/Payment";

// Student pages
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

// Layouts
import AdminLayout from "./components/adminlayout/AdminLayout";
import StudentLayout from "./components/Student-layout/StudentLayout";

// 🔐 Protected wrapper
import ProtectedRoute from "./protected/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/payment" element={<Payment />} />

        {/* 🔒 Student Protected + Layout */}
        <Route
          path="/student"
          element={
            <ProtectedRoute>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="exam" element={<Exam />} />
          <Route path="register" element={<ExamRegister />} />
          {/* ExamResult ko abhi direct use kar rahe ho (summary page) */}
          <Route path="result" element={<ExamResult />} />
        </Route>

        {/* Admin – sabhi routes AdminLayout ke andar */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="questions" element={<AdminQuestions />} />
          <Route path="exam-dashboard" element={<ExamDashboard />} />
          <Route path="add-student" element={<AddStudent />} />
          <Route path="view-students" element={<ViewStudents />} />
          <Route path="send-notification" element={<SendNotification />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
