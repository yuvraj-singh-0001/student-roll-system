import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";

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
      const response = await API.post("/student/add", formData);
      
      if (response.data.success) {
        setSuccess(`âœ“ Student added! Roll Number: ${response.data.data.rollNumber}`);
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
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden flex flex-col">
      {/* Animated Background - Same as Admin Dashboard */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header - Same Style as Admin Dashboard */}
        

        <main className="flex-1 overflow-hidden">
          <div className="h-full flex items-center justify-center p-4">
            <div className="max-w-4xl w-full h-full max-h-[600px] flex gap-8">
              {/* Left Side - Progress Steps */}
              <div className="w-2/5">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-full p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Student</h2>
                  <p className="text-sm text-gray-500 mb-8">Complete all steps to add a new student</p>
                  
                  {/* Progress Steps */}
                  <div className="space-y-8">
                    <div className="flex items-start gap-4 group cursor-pointer">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                        formData.name ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                      }`}>
                        <span className="text-white font-bold text-lg">1</span>
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          formData.name ? 'text-green-700' : 'text-gray-900'
                        }`}>Basic Information</h3>
                        <p className="text-sm text-gray-500 mt-1">Enter student's name and email</p>
                        {formData.name && formData.email && (
                          <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                            <span>âœ“ Completed</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-4 group cursor-pointer">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                        formData.course ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 
                        (formData.name && formData.email ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : 'bg-gray-200')
                      }`}>
                        <span className={`font-bold text-lg ${
                          formData.course ? 'text-white' : 
                          (formData.name && formData.email ? 'text-white' : 'text-gray-400')
                        }`}>2</span>
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          formData.course ? 'text-green-700' : 
                          (formData.name && formData.email ? 'text-gray-900' : 'text-gray-400')
                        }`}>Course Selection</h3>
                        <p className={`text-sm ${
                          formData.name && formData.email ? 'text-gray-500' : 'text-gray-400'
                        } mt-1`}>Choose the academic course</p>
                        {formData.course && (
                          <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                            <span>âœ“ Selected: {formData.course}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-4 group cursor-pointer">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                        loading ? 'bg-gradient-to-br from-orange-500 to-amber-500 animate-pulse' : 
                        (formData.name && formData.email && formData.course ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : 'bg-gray-200')
                      }`}>
                        <span className={`font-bold text-lg ${
                          loading ? 'text-white' : 
                          (formData.name && formData.email && formData.course ? 'text-white' : 'text-gray-400')
                        }`}>3</span>
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          loading ? 'text-orange-700' : 
                          (formData.name && formData.email && formData.course ? 'text-gray-900' : 'text-gray-400')
                        }`}>Registration</h3>
                        <p className={`text-sm ${
                          formData.name && formData.email && formData.course ? 'text-gray-500' : 'text-gray-400'
                        } mt-1`}>Submit and create account</p>
                        {loading && (
                          <div className="mt-2 text-xs text-orange-600 flex items-center gap-1">
                            <span>â³ Processing...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats Card */}
                  <div className="mt-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4">Registration Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Students</span>
                        <span className="font-semibold text-gray-900">1,248</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">This Month</span>
                        <span className="font-semibold text-green-600">+42</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Success Rate</span>
                        <span className="font-semibold text-blue-600">98.5%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="w-3/5">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-full overflow-hidden flex flex-col">
                  {/* Top Gradient Bar */}
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                  
                  <div className="flex-1 overflow-y-auto p-8">
                    {/* Success/Error Messages */}
                    {error && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-fade-in">
                        {error}
                      </div>
                    )}
                    
                    {success && (
                      <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm animate-fade-in">
                        {success}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Name Input */}
                      <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input 
                          type="text" 
                          name="name" 
                          value={formData.name} 
                          onChange={handleChange} 
                          placeholder="Enter student name" 
                          required 
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400 group-hover:shadow-sm"
                        />
                      </div>

                      {/* Email Input */}
                      <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input 
                          type="email" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleChange} 
                          placeholder="student@example.com" 
                          required 
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400 group-hover:shadow-sm"
                        />
                      </div>

                      {/* Course Select */}
                      <div className="group relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Course
                        </label>
                        <select 
                          name="course" 
                          value={formData.course} 
                          onChange={handleChange} 
                          required 
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400 group-hover:shadow-sm bg-white appearance-none"
                        >
                          <option value="">Select a course</option>
                          <option value="Computer Science">Computer Science</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Mechanical">Mechanical</option>
                          <option value="Civil">Civil</option>
                          <option value="Electrical">Electrical</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 pt-8">
                          <svg className="fill-current h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                          </svg>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100 p-4 mt-8">
                        <h4 className="font-semibold text-gray-900 mb-2">What happens next?</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Roll number generated automatically</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Login credentials sent via email</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Student can access all assigned exams</span>
                          </li>
                        </ul>
                      </div>
                    </form>
                  </div>

                  {/* Form Buttons - Fixed at Bottom */}
                  <div className="border-t border-gray-100 p-6 bg-gray-50/50">
                    <div className="flex gap-4">
                      <button 
                        type="button" 
                        onClick={() => navigate("/admin")}
                        className="group flex-1 py-3.5 px-4 bg-gradient-to-br from-white to-gray-50 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <span className="group-hover:-translate-x-1 transition-transform duration-300">â†</span>
                        <span>Back to Dashboard</span>
                      </button>

                      <button 
                        type="submit" 
                        onClick={handleSubmit}
                        disabled={loading || !formData.name || !formData.email || !formData.course}
                        className="group flex-1 py-3.5 px-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Adding Student...</span>
                          </>
                        ) : (
                          <>
                            <span>Register Student</span>
                            <span className="group-hover:translate-x-1 transition-transform duration-300">â†’</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

       
        
      </div>
    </div>
  );
}

