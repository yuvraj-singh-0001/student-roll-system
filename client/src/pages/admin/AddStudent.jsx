import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AddStudent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    course: "",
  });
// Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
// Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
// API call to add student
    try {
      const response = await axios.post("http://localhost:5000/api/student/add", formData);
      
      if (response.data.success) {
        setSuccess(`✓ Student added! Roll Number: ${response.data.data.rollNumber}`);
        setFormData({ name: "", email: "", course: "" });
        
        setTimeout(() => {
          navigate("/admin/view-students");
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error adding student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen admin-bg">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate("/admin")} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition">← Admin</button>
          <span className="text-slate-300">|</span>
          <h1 className="text-lg font-bold text-slate-800">Add New Student</h1>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in-up">
          <div className="h-1 bg-slate-700" />
          <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter student name" required className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email" required className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Course</label>
              <select name="course" value={formData.course} onChange={handleChange} required className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition bg-white">
                <option value="">Select a course</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Electrical">Electrical</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-800 transition shadow-md disabled:opacity-70">
              {loading ? "Adding…" : "Add student"}
            </button>
            <button type="button" onClick={() => navigate("/admin")} className="w-full py-3 px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition">
              ← Admin Panel
            </button>
          </form>
          </div>
        </div>
      </main>
    </div>
  );
}
