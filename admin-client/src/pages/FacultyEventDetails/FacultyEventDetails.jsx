import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import facultyAPI from '../../api/facultyApi';
import FacultyNavbar from '../../components/FacultyNavbar';
import './FacultyEventDetails.css';

const FacultyEventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    facultyAPI.get(`/event/${id}/details`)
      .then(res => setEvent(res.data))
      .catch(err => console.error('Event details error:', err));
  }, [id]);

  if (!event) return <p>Loading...</p>;

  const facultyNames = event.faculties?.map(f => f.name).join(', ') || 'N/A';
  const coordinatorNames = event.studentCoordinators?.join(', ') || 'N/A';

  return (
    <>
      <FacultyNavbar />
      <div className="event-details">
        <h2>{event.name}</h2>
        <span className={`category-badge category-${event.category}`}>
          {event.category}
        </span>

        <div className="faculty-inline">
          <strong>Faculty In-Charge:</strong> {facultyNames}
        </div>

        <div className="faculty-inline">
          <strong>Student Coordinators:</strong> {coordinatorNames}
        </div>

        {event.rules && (
          <div className="rules-block">
            <strong>Rules:</strong>
            <p>{event.rules}</p>
          </div>
        )}

        <button className="back-button" onClick={() => navigate('/faculty/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>
    </>
  );
};

export default FacultyEventDetails;