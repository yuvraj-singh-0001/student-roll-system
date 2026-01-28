import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SendNotification from "./pages/SendNotification";
import AddStudent from "./pages/AddStudent";
import ViewStudents from "./pages/ViewStudents";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/send-notification" element={<SendNotification />} />
        <Route path="/add-student" element={<AddStudent />} />
        <Route path="/view-students" element={<ViewStudents />} />
      </Routes>
    </BrowserRouter>
  );
}
