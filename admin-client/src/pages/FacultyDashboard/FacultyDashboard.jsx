import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import facultyAPI from '../../api/facultyApi';
import FacultyNavbar from '../../components/FacultyNavbar';
import './FacultyDashboard.css';

const FacultyDashboard = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    facultyAPI.get('/events')
      .then(res => setEvents(res.data))
      .catch(err => console.error('Failed to fetch assigned events:', err));
  }, []);


  return (
    <>
      <FacultyNavbar />
      <div className="faculty-dashboard">
        <h2>Your Assigned Events</h2>
        <ul className="event-list">
          {events.map(event => (
            <li key={event._id} className="event-card">
              <div className="event-info">
                <strong>{event.name}</strong>
                <span className={`category-badge category-${event.category}`}>
                  {event.category}
                </span>
              </div>
              <div className="event-actions">
                <button onClick={() => navigate(`/faculty/event/${event._id}/score`)}>Score</button>
                <button onClick={() => navigate(`/faculty/event/${event._id}/details`)}>
                  View Details
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default FacultyDashboard;