// import { useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const [time, setTime] = useState(new Date());

//   useEffect(() => {
//     const timer = setInterval(() => setTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const quickActions = [
//     { 
//       label: "Send Notification", 
//       path: "/send-notification", 
//       color: "from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600",
//       icon: "📨"
//     },
//     { 
//       label: "View Students", 
//       path: "/view-students", 
//       color: "from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600",
//       icon: "👥"
//     },
//     { 
//       label: "Add New Student", 
//       path: "/add-student", 
//       color: "from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600",
//       icon: "➕"
//     },
//     { 
//       label: "Exam Register", 
//       path: "/exam/register", 
//       color: "from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700",
//       icon: "📝"
//     },
//     { 
//       label: "Give Exam", 
//       path: "/exam", 
//       color: "from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700",
//       icon: "✏️"
//     },
//     { 
//       label: "Add Questions (Exam)", 
//       path: "/admin/questions", 
//       color: "from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
//       icon: "❓"
//     },
//     { 
//       label: "Exam Dashboard", 
//       path: "/admin/exam-dashboard", 
//       color: "from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700",
//       icon: "📊"
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden">
//       {/* Animated Background */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
//         <div className="absolute top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
//       </div>

//       <div className="relative z-10">
//         {/* Header */}
//         <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="flex items-center justify-between h-16">
//               <div className="flex items-center gap-4">
//                 <div className="flex items-center gap-3">
//                   <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-lg">
//                     <span className="text-white font-bold text-sm">A</span>
//                   </div>
//                   <div>
//                     <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
//                     <p className="text-xs text-gray-500">Student Management System</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-center gap-4">
//                 <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
//                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                   <span className="text-sm font-medium text-gray-700">System Online</span>
//                 </div>
//                 <div className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl shadow-lg">
//                   <div className="text-sm font-medium">
//                     {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </header>

//         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           {/* Dashboard Content */}
//           <div className="flex flex-col lg:flex-row gap-8">
//             {/* Left Side - Main Content */}
//             <div className="lg:w-2/3">
//               {/* Main Card */}
//               <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
//                 {/* Top Gradient Header */}
//                 <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 text-center text-white">
//                   <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 animate-bounce">
//                     <span className="text-3xl">🎓</span>
//                   </div>
//                   <h1 className="text-2xl font-bold tracking-wide">Admin Dashboard</h1>
//                   <p className="text-sm text-blue-100 mt-2">Manage all student activities and exams</p>
//                 </div>

//                 {/* Action Buttons Grid */}
//                 <div className="p-6">
//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {quickActions.map((action, index) => (
//                       <button
//                         key={action.path}
//                         onClick={() => navigate(action.path)}
//                         className="group relative p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 text-left transition-all duration-300 hover:border-transparent hover:shadow-xl hover:-translate-y-1"
//                         style={{ animationDelay: `${index * 0.1}s` }}
//                       >
//                         <div className="flex items-center gap-4">
//                           <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
//                             <span className="text-xl text-white">{action.icon}</span>
//                           </div>
//                           <div className="flex-1">
//                             <h3 className="font-semibold text-gray-900 mb-1">{action.label}</h3>
//                           </div>
//                           <span className="text-gray-400 group-hover:text-gray-700 transform group-hover:translate-x-2 transition-all duration-300">
//                             →
//                           </span>
//                         </div>
//                         <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
//                       </button>
//                     ))}
//                   </div>

//                   {/* More Actions Button */}
//                   <div className="mt-8 text-center">
//                     <button className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2 mx-auto">
//                       <span>More Actions</span>
//                       <span className="text-lg">↓</span>
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Stats Cards */}
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
//                 <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100 p-5">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <div className="text-2xl font-bold text-gray-900">1,248</div>
//                       <div className="text-sm text-gray-600">Total Students</div>
//                     </div>
//                     <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
//                       <span className="text-white">👥</span>
//                     </div>
//                   </div>
//                   <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
//                     <span>↑ 12% this month</span>
//                   </div>
//                 </div>

//                 <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 p-5">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <div className="text-2xl font-bold text-gray-900">48</div>
//                       <div className="text-sm text-gray-600">Active Exams</div>
//                     </div>
//                     <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
//                       <span className="text-white">📝</span>
//                     </div>
//                   </div>
//                   <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
//                     <span>↑ 5 new this week</span>
//                   </div>
//                 </div>

//                 <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 p-5">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <div className="text-2xl font-bold text-gray-900">78.5%</div>
//                       <div className="text-sm text-gray-600">Avg Score</div>
//                     </div>
//                     <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
//                       <span className="text-white">📊</span>
//                     </div>
//                   </div>
//                   <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
//                     <span>↑ 3.2% improvement</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Right Side Panel */}
//             <div className="lg:w-1/3 space-y-8">
//               {/* Status Badges */}
//               <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
//                 <h3 className="text-lg font-bold text-gray-900 mb-4">Admin Status</h3>
//                 <div className="space-y-3">
//                   <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
//                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
//                       <span className="text-white text-sm">✓</span>
//                     </div>
//                     <div>
//                       <div className="font-medium text-green-800">Active</div>
//                       <div className="text-xs text-green-600">System running normally</div>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
//                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
//                       <span className="text-white text-sm">👤</span>
//                     </div>
//                     <div>
//                       <div className="font-medium text-blue-800">Admin Access</div>
//                       <div className="text-xs text-blue-600">Full permissions granted</div>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
//                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
//                       <span className="text-white text-sm">⚡</span>
//                     </div>
//                     <div>
//                       <div className="font-medium text-amber-800">Live Updates</div>
//                       <div className="text-xs text-amber-600">Real-time monitoring</div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Quick Info */}
//               <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-6">
//                 <h3 className="text-lg font-bold text-gray-900 mb-4">System Info</h3>
//                 <div className="space-y-3 text-sm">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Version</span>
//                     <span className="font-medium text-gray-900">v2.0</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Last Updated</span>
//                     <span className="font-medium text-gray-900">Today</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Server Status</span>
//                     <span className="font-medium text-green-600">✓ Online</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Database</span>
//                     <span className="font-medium text-green-600">Connected</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Copyright */}
//               <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
//                 <div className="text-xl font-bold text-gray-900 mb-2">The True Topper</div>
//                 <div className="text-sm text-gray-600">Student Management System</div>
//                 <div className="text-xs text-gray-400 mt-2">© 2026 • Roll System v1.0</div>
//               </div>
//             </div>
//           </div>
//         </main>

//         {/* Footer */}
//         <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//             <div className="flex flex-col md:flex-row justify-between items-center gap-4">
//               <div className="flex items-center gap-4">
//                 <div className="flex items-center gap-2">
//                   <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
//                     <span className="text-white font-bold text-sm">A</span>
//                   </div>
//                   <span className="font-medium text-gray-900">Admin Dashboard v2.0</span>
//                 </div>
//               </div>
              
//               <div className="flex items-center gap-6">
//                 <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-300">
//                   Help Center
//                 </button>
//                 <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-300">
//                   Documentation
//                 </button>
//                 <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-300">
//                   Report Issue
//                 </button>
//               </div>
//             </div>
//           </div>
//         </footer>
//       </div>
//     </div>
//   );
// }