import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Teams from './pages/Team/Teams';
import Events from './pages/Event/Events';
import Scoring from './pages/Scoring/Scoring';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/AdminTheme.css';
import EditTeam from './pages/Team/EditTeam';
import ViewTeam from './pages/Team/ViewTeam';
import EditEvent from './pages/Event/EditEvent';
import NewEvent from './pages/Event/NewEvent';
import EventParticipants from './pages/Event/EventParticipants';
import FacultyPage from './pages/Faculty/FacultyPage'; // Main Faculty Page
import AdminManage from './pages/AdminManage/AdminManage';
import StudentCoordinatorsPage from './pages/StudentCoordinator/StudentCoordinatorsPage'; // Main Student Coordinators Page
import SchedulePage from './pages/Schedule/SchedulePage';

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/teams/view/:id" element={<ViewTeam />} />
        <Route path="/teams/edit/:id" element={<EditTeam />} />
        <Route path="/events/edit/:id" element={<EditEvent />} />
        <Route path="/events/new" element={<NewEvent />} />
        <Route path="/events/participants" element={<EventParticipants />} />
        <Route path="/faculty" element={<FacultyPage />} />
        <Route path="/student-coordinators" element={<StudentCoordinatorsPage />} />
        <Route path="/schedule" element={<SchedulePage />} />

        <Route
          path="/admin-manage"
          element={
            <ProtectedRoute>
              <AdminManage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams"
          element={
            <ProtectedRoute>
              <Teams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scoring"
          element={
            <ProtectedRoute>
              <Scoring />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;