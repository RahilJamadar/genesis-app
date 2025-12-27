import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; 

// Admin Components
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
import RegisterHub from './pages/RegisterHub'; 
import Register from './pages/Register';
import Payment from './pages/Payment'; 

import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  return (
    <Router>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        theme="dark" 
        // 🚀 Higher z-index to stay above the 'glass' layers
        style={{ zIndex: 99999 }} 
      />

      <Routes>
        {/* 🌐 Public/Client Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterHub />} />
        <Route path="/register-form/:mode" element={<Register />} /> 
        <Route path="/payment/:teamId" element={<Payment />} /> 

        {/* 🧑‍⚖️ Faculty Portal Routes */}
        <Route path="/faculty/login" element={<FacultyLogin />} />
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/event/:id/details" element={<FacultyEventDetails />} />
        <Route path="/faculty/event/:id/score" element={<FacultyEventScoring />} />

        {/* 🛡️ Admin Portal (Isolated Container to prevent Style Leak) */}
        <Route path="/admin/*" element={
          <div className="admin-portal-root">
            <Routes>
              <Route path="login" element={<Login />} />
              
              {/* Protected Sub-routes */}
              <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="admin-manage" element={<ProtectedRoute><AdminManage /></ProtectedRoute>} />
              <Route path="teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
              <Route path="teams/view/:id" element={<ProtectedRoute><ViewTeam /></ProtectedRoute>} />
              <Route path="teams/edit/:id" element={<ProtectedRoute><EditTeam /></ProtectedRoute>} />
              <Route path="events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
              <Route path="events/edit/:id" element={<ProtectedRoute><EditEvent /></ProtectedRoute>} />
              <Route path="events/new" element={<ProtectedRoute><NewEvent /></ProtectedRoute>} />
              <Route path="events/view/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
              <Route path="events/participants" element={<ProtectedRoute><EventParticipants /></ProtectedRoute>} />
              <Route path="faculty" element={<ProtectedRoute><FacultyPage /></ProtectedRoute>} />
              <Route path="student-coordinators" element={<ProtectedRoute><StudentCoordinatorsPage /></ProtectedRoute>} />
              <Route path="schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
              <Route path="scoring" element={<ProtectedRoute><Scoring /></ProtectedRoute>} />
              <Route path="leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            </Routes>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;