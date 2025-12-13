import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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

import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Registration Frontend Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Frontend Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/faculty/login" element={<FacultyLogin />} />

        {/* Faculty Routes */}
        <Route path="/admin/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/admin/faculty/event/:id/details" element={<FacultyEventDetails />} />
        <Route path="/admin/faculty/event/:id/score" element={<FacultyEventScoring />} />

        {/* Admin Routes (Protected) */}
        <Route path="/admin/admin-manage" element={
          <ProtectedRoute><AdminManage /></ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/admin/teams" element={
          <ProtectedRoute><Teams /></ProtectedRoute>
        } />
        <Route path="/admin/teams/view/:id" element={<ViewTeam />} />
        <Route path="/admin/teams/edit/:id" element={<EditTeam />} />

        <Route path="/admin/events" element={
          <ProtectedRoute><Events /></ProtectedRoute>
        } />
        <Route path="/admin/events/edit/:id" element={<EditEvent />} />
        <Route path="/admin/events/new" element={<NewEvent />} />
        <Route path="/admin/events/view/:id" element={<EventDetails />} />
        <Route path="/admin/events/participants" element={<EventParticipants />} />

        <Route path="/admin/faculty" element={<FacultyPage />} />
        <Route path="/admin/student-coordinators" element={<StudentCoordinatorsPage />} />
        <Route path="/admin/schedule" element={<SchedulePage />} />
        <Route path="/admin/scoring" element={
          <ProtectedRoute><Scoring /></ProtectedRoute>
        } />

        {/* Leaderboard */}
        <Route path="/admin/leaderboard" element={<Leaderboard />} />
      </Routes>
    </Router>
  );
}

export default App;
