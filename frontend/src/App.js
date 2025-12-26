import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; 

// Admin Client Components
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard/Dashboard';
import Teams from './pages/admin/Team/Teams';
import Events from './pages/admin/Event/Events';
import Scoring from './pages/admin/Scoring/Scoring';
import ProtectedRoute from './components/ProtectedRoute';
import EditTeam from './pages/admin/Team/EditTeam';
import ViewTeam from './pages/admin/Team/ViewTeam';
import EditEvent from './pages/admin/Event/EditEvent';
import NewEvent from './pages/admin/Event/NewEvent';
import EventParticipants from './pages/admin/Event/EventParticipants';
import FacultyPage from './pages/admin/Faculty/FacultyPage';
import AdminManage from './pages/admin/AdminManage/AdminManage';
import StudentCoordinatorsPage from './pages/admin/StudentCoordinator/StudentCoordinatorsPage';
import SchedulePage from './pages/admin/Schedule/SchedulePage';
import EventDetails from './pages/admin/Event/EventDetails';
import FacultyLogin from './pages/admin/FacultyLogin/FacultyLogin';
import FacultyDashboard from './pages/admin/FacultyDashboard/FacultyDashboard';
import FacultyEventDetails from './pages/admin/FacultyEventDetails/FacultyEventDetails';
import FacultyEventScoring from './pages/admin/FacultyEventScoring/FacultyEventScoring';
import Leaderboard from './pages/admin/Leaderboard/Leaderboard';

// Client Components
import Home from './pages/Home';
import Register from './pages/Register';
import Payment from './pages/Payment'; // ✅ Added for Payment logic

import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  return (
    <Router>
      {/* ✅ Global Notifications */}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark" 
      />

      <Routes>
        {/* 🌐 Public/Registration Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        {/* 💳 Payment & Verification Route */}
        <Route path="/payment/:teamId" element={<Payment />} /> 

        {/* 🔐 Authentication Entry Points */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/faculty/login" element={<FacultyLogin />} />

        {/* 🧑‍⚖️ Faculty Portal Routes */}
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/event/:id/details" element={<FacultyEventDetails />} />
        <Route path="/faculty/event/:id/score" element={<FacultyEventScoring />} />

        {/* 🛡️ Admin Management Routes (Protected) */}
        <Route path="/admin/admin-manage" element={<ProtectedRoute><AdminManage /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* Team Management */}
        <Route path="/admin/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
        <Route path="/admin/teams/view/:id" element={<ProtectedRoute><ViewTeam /></ProtectedRoute>} />
        <Route path="/admin/teams/edit/:id" element={<ProtectedRoute><EditTeam /></ProtectedRoute>} />

        {/* Event Management */}
        <Route path="/admin/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
        <Route path="/admin/events/edit/:id" element={<ProtectedRoute><EditEvent /></ProtectedRoute>} />
        <Route path="/admin/events/new" element={<ProtectedRoute><NewEvent /></ProtectedRoute>} />
        <Route path="/admin/events/view/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
        <Route path="/admin/events/participants" element={<ProtectedRoute><EventParticipants /></ProtectedRoute>} />

        {/* Infrastructure & Scoring */}
        <Route path="/admin/faculty" element={<ProtectedRoute><FacultyPage /></ProtectedRoute>} />
        <Route path="/admin/student-coordinators" element={<ProtectedRoute><StudentCoordinatorsPage /></ProtectedRoute>} />
        <Route path="/admin/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
        <Route path="/admin/scoring" element={<ProtectedRoute><Scoring /></ProtectedRoute>} />

        {/* Analytics & Standings */}
        <Route path="/admin/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;