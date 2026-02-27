import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// General
import Home from "../pages/Home";
import Payment from "../pages/Payment";
import PaymentSuccess from "../pages/PaymentSuccess";
import RegisterFormB from "../pages/RegisterFormB";

// Student pages
import StudentDashboard from "../pages/Student/StudentDashboard";
import ExamRegister from "../pages/Student/ExamRegister";
import Exam from "../pages/Student/Exam";
import ExamResult from "../pages/Student/ExamResult";
import OlympiadExamPage from "../pages/Student/OlympiadExamPage";

// Admin
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminQuestions from "../pages/admin/AdminQuestions";
import ExamDashboard from "../pages/admin/ExamDashboard";
import AddStudent from "../pages/admin/AddStudent";
import ViewStudents from "../pages/admin/ViewStudents";
import SendNotification from "../pages/admin/SendNotification";

// Layouts
import AdminLayout from "../components/adminlayout/AdminLayout";
import StudentLayout from "../components/Student-layout/StudentLayout";

// Protected wrapper
import ProtectedRoute from "../protected/ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/register-form-b" element={<RegisterFormB />} />

        {/* Student + Layout (abhi ke liye always allowed) */}
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
          <Route path="olympiad/:examCode" element={<OlympiadExamPage />} />
          <Route path="register" element={<ExamRegister />} />
          <Route path="result" element={<ExamResult />} />
          <Route path="result/:attemptId" element={<ExamResult />} />
        </Route>

        {/* Admin routes inside AdminLayout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="questions" element={<AdminQuestions />} />
          <Route path="exam-dashboard" element={<ExamDashboard />} />
          <Route path="add-student" element={<AddStudent />} />
          <Route path="view-students" element={<ViewStudents />} />
          <Route path="send-notification" element={<SendNotification />} />
        </Route>

        {/* Fallback: unknown routes to admin dashboard */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
