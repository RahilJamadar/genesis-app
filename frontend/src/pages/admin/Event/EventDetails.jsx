import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await adminApi.get(`/events/${id}`);
        setEvent(res.data);
      } catch (err) {
        toast.error('❌ Failed to fetch event details');
      }
    };
    fetchEvent();
  }, [id]);

  if (!event) {
    return (
      <div className="bg-dark min-vh-100 d-flex align-items-center justify-content-center text-white">
        <div className="spinner-border text-info" role="status"></div>
      </div>
    );
  }

  return (
    <div className="d-flex bg-dark min-vh-100">
      <Navbar />

      <main className="dashboard-content flex-grow-1 p-4 p-lg-5">
        <ToastContainer theme="dark" />

        {/* Header Section */}
        <header className="mb-5 d-flex justify-content-between align-items-start">
          <div>
            <div className="d-flex align-items-center gap-3 mb-2">
              <h2 className="fw-bold text-white mb-0">{event.name}</h2>
              {event.isTrophyEvent && (
                <span className="badge bg-warning text-dark px-3 py-2 rounded-pill shadow-sm">
                  <i className="bi bi-trophy-fill me-1"></i> TROPHY EVENT
                </span>
              )}
            </div>
            <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-2 fs-6 text-uppercase">
              {event.category}
            </span>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-warning fw-bold" onClick={() => navigate(`/admin/events/edit/${id}`)}>
              <i className="bi bi-pencil me-2"></i> EDIT
            </button>
            <button className="btn btn-outline-secondary fw-bold" onClick={() => navigate('/admin/events')}>
              <i className="bi bi-arrow-left me-2"></i> BACK
            </button>
          </div>
        </header>

        <div className="row g-4">
          {/* Main Info Card */}
          <div className="col-lg-8">
            <div className="card bg-glass border-secondary shadow-lg mb-4">
              <div className="card-body p-4">
                <h5 className="text-white fw-bold mb-4 border-bottom border-secondary pb-2">Event Specifications</h5>
                
                <div className="row g-4">
                  {/* Round & Capacity Stats */}
                  <div className="col-md-4">
                    <label className="text-info small fw-bold mb-1 d-block text-uppercase">Rounds</label>
                    <h4 className="text-white fw-bold">{event.rounds} Round{event.rounds > 1 ? 's' : ''}</h4>
                  </div>
                  
                  {/* NEW: Participant Limits */}
                  <div className="col-md-8">
                    <label className="text-info small fw-bold mb-1 d-block text-uppercase">Team Capacity</label>
                    <h4 className="text-white fw-bold">
                      {event.minParticipants === event.maxParticipants 
                        ? `${event.minParticipants} Member(s)` 
                        : `${event.minParticipants} to ${event.maxParticipants} Members`}
                    </h4>
                  </div>
                  
                  <div className="col-12 mt-4">
                    <label className="text-info small fw-bold mb-3 d-block text-uppercase">Judging Criteria (Weights C1-C3)</label>
                    <div className="d-flex flex-column gap-2">
                      {event.judgingCriteria?.map((criteria, index) => (
                        <div key={index} className="d-flex align-items-center bg-dark p-3 rounded border border-secondary">
                          <span className="text-info fw-bold me-3">C{index + 1}</span>
                          <span className="text-white fs-5">{criteria}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-12 mt-4">
                    <label className="text-info small fw-bold mb-2 d-block text-uppercase">Rules & Guidelines</label>
                    <div className="bg-dark p-4 rounded border border-secondary text-light">
                      <p className="mb-0 whitespace-pre-wrap" style={{ lineHeight: '1.6' }}>
                        {event.rules || "No specific rules defined for this event."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info Cards */}
          <div className="col-lg-4">
            {/* Assignments Card */}
            <div className="card bg-glass border-secondary shadow-lg mb-4">
              <div className="card-body p-4">
                <h5 className="text-white fw-bold mb-4 border-bottom border-secondary pb-2 text-uppercase">Assignments</h5>
                
                <div className="mb-4">
                  <label className="text-info small fw-bold mb-3 d-block">FACULTY JUDGES</label>
                  {/* Note: mapped to faculties per backend transformation */}
                  {event.faculties?.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {event.faculties.map((f, i) => (
                        <div key={i} className="bg-dark p-2 rounded border border-secondary d-flex align-items-center gap-2">
                          <i className="bi bi-person-badge text-info"></i>
                          <span className="text-white small">{f.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-secondary small">No judges assigned.</p>}
                </div>

                <div>
                  <label className="text-info small fw-bold mb-3 d-block">STUDENT COORDINATORS</label>
                  {event.studentCoordinators?.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {event.studentCoordinators.map((sc, i) => (
                        <div key={i} className="bg-dark p-2 rounded border border-secondary d-flex flex-column">
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-person-circle text-info"></i>
                            <span className="text-white small fw-bold">{sc.name}</span>
                          </div>
                          <span className="text-secondary x-small ps-4">{sc.phone}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-secondary small">No coordinators assigned.</p>}
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="card bg-info bg-opacity-10 border-info border-opacity-25 shadow-lg">
              <div className="card-body p-4 text-center">
                <i className="bi bi-shield-lock text-info fs-2 mb-2"></i>
                <h6 className="text-info fw-bold mb-2">DYNAMIC VALIDATION</h6>
                <p className="text-white x-small mb-0 opacity-75">
                  Registration Wizard will automatically enforce a minimum of <b>{event.minParticipants}</b> and maximum of <b>{event.maxParticipants}</b> members for this event.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .dashboard-content { margin-left: 260px; }
        .bg-glass { background: rgba(255, 255, 255, 0.05) !important; backdrop-filter: blur(12px); border-radius: 18px; }
        .whitespace-pre-wrap { white-space: pre-wrap; }
        .x-small { font-size: 0.75rem; }
        @media (max-width: 991.98px) { .dashboard-content { margin-left: 0; padding-top: 80px; } }
      `}</style>
    </div>
  );
};

export default EventDetails;