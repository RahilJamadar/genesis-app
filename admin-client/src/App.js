import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Teams from './pages/Team/Teams';
import Events from './pages/Event/Events';
import Scoring from './pages/Scoring/Scoring';
import ProtectedRoute from './components/ProtectedRoute';
import EditTeam from './pages/Team/EditTeam';
import ViewTeam from './pages/Team/ViewTeam';
import EditEvent from './pages/Event/EditEvent';
import NewEvent from './pages/Event/NewEvent';
import EventParticipants from './pages/Event/EventParticipants';
import FacultyPage from './pages/Faculty/FacultyPage';
import AdminManage from './pages/AdminManage/AdminManage';
import StudentCoordinatorsPage from './pages/StudentCoordinator/StudentCoordinatorsPage';
import SchedulePage from './pages/Schedule/SchedulePage';
import EventDetails from './pages/Event/EventDetails';
import FacultyLogin from './pages/FacultyLogin/FacultyLogin';
import FacultyDashboard from './pages/FacultyDashboard/FacultyDashboard';
import FacultyEventDetails from './pages/FacultyEventDetails/FacultyEventDetails';
import FacultyEventScoring from './pages/FacultyEventScoring/FacultyEventScoring';
import Leaderboard from './pages/Leaderboard/Leaderboard';

import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  return (
    <Router>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/faculty/login" element={<FacultyLogin />} />

        {/* Faculty Routes */}
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/event/:id/details" element={<FacultyEventDetails />} />
        <Route path="/faculty/event/:id/score" element={<FacultyEventScoring />} />

        {/* Admin Routes (Protected) */}
        <Route path="/admin-manage" element={
          <ProtectedRoute><AdminManage /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/teams" element={
          <ProtectedRoute><Teams /></ProtectedRoute>
        } />
        <Route path="/teams/view/:id" element={<ViewTeam />} />
        <Route path="/teams/edit/:id" element={<EditTeam />} />

        <Route path="/events" element={
          <ProtectedRoute><Events /></ProtectedRoute>
        } />
        <Route path="/events/edit/:id" element={<EditEvent />} />
        <Route path="/events/new" element={<NewEvent />} />
        <Route path="/events/view/:id" element={<EventDetails />} />
        <Route path="/events/participants" element={<EventParticipants />} />

        <Route path="/faculty" element={<FacultyPage />} />
        <Route path="/student-coordinators" element={<StudentCoordinatorsPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/scoring" element={
          <ProtectedRoute><Scoring /></ProtectedRoute>
        } />

        {/* Leaderboard */}
        <Route path="/leaderboard" element={<Leaderboard />} />

      </Routes>
    </Router>
  );
}

export default App;