import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/adminApi';
import Navbar from '../../components/Navbar';
import './Events.css';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    API.get(`/admin/events/${id}`)
      .then(res => {
        const raw = res.data;

        const facultyNames = raw.faculties?.map(f => f.name) || [];
        const coordinatorNames = raw.studentCoordinators || [];

        setEvent({
          ...raw,
          faculties: facultyNames,
          studentCoordinators: coordinatorNames
        });
      })
      .catch(err => console.error('Event details fetch error:', err));
  }, [id]);

  if (!event) {
    return (
      <div className="events">
        <Navbar />
        <p>Loading event details...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="events event-details">
        <h2>{event.name}</h2>
        <span className={`category-badge category-${event.category}`}>
          {event.category}
        </span>

        {event.faculties?.length > 0 && (
          <div className="faculty-inline">
            <strong>Faculty In-Charge:</strong> {event.faculties.join(', ')}
          </div>
        )}

        {event.studentCoordinators?.length > 0 && (
          <div className="faculty-inline">
            <strong>Student Coordinators:</strong> {event.studentCoordinators.join(', ')}
          </div>
        )}

        {event.rules && (
          <div className="rules-block">
            <strong>Rules:</strong>
            <p>{event.rules}</p>
          </div>
        )}

        <button className="back-button" onClick={() => navigate('/events')}>
          ← Back to Events
        </button>
      </div>
    </>
  );
};

export default EventDetails;