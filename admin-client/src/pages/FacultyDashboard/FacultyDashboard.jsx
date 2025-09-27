import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import facultyAPI from '../../api/facultyApi';
import FacultyNavbar from '../../components/FacultyNavbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FacultyDashboard = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    facultyAPI.get('/events')
      .then(res => setEvents(res.data))
      .catch(() => toast.error('❌ Failed to fetch assigned events'));
  }, []);

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <FacultyNavbar />
      <div className="container-fluid py-5" style={{ backgroundColor: '#0D0D15', minHeight: '100vh' }}>
        <div className="container text-light">
          <h2 className="text-center fw-bold mb-4 border-bottom pb-2 text-info">Your Assigned Events</h2>

          <div className="row g-4">
            {events.map(event => (
              <div key={event._id} className="col-md-4">
                <div className="card bg-dark text-light border border-secondary shadow-sm h-100">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <h5 className="card-title fw-semibold text-info">{event.name}</h5>
                      <span className="badge bg-secondary">{event.category}</span>
                    </div>
                    <div className="mt-3 d-flex gap-2 flex-wrap justify-content-end">
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => navigate(`/faculty/event/${event._id}/score`)}
                      >
                        Score
                      </button>
                      <button
                        className="btn btn-sm btn-outline-light"
                        onClick={() => navigate(`/faculty/event/${event._id}/details`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default FacultyDashboard;