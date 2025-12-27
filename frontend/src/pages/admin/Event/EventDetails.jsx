import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { toast } from 'react-toastify';
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
    <div className="d-flex bg-dark min-vh-100 flex-column flex-lg-row">
      <Navbar />

      <main className="dashboard-content flex-grow-1 p-3 p-md-4 p-lg-5">

        {/* Header Section */}
        <header className="mb-4 mb-lg-5 d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-start gap-3">
          <div className="text-center text-md-start">
            <div className="d-flex flex-column flex-md-row align-items-center gap-2 gap-md-3 mb-2">
              <h2 className="fw-bold text-white mb-0 fs-3 fs-md-2">{event.name}</h2>
              {event.isTrophyEvent && (
                <span className="badge bg-warning text-dark px-3 py-2 rounded-pill shadow-sm x-small-badge">
                  <i className="bi bi-trophy-fill me-1"></i> TROPHY EVENT
                </span>
              )}
            </div>
            <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-2 fs-7 text-uppercase">
              {event.category}
            </span>
          </div>
          <div className="d-flex gap-2 w-100 w-md-auto justify-content-center">
            <button className="btn btn-outline-warning fw-bold btn-sm flex-grow-1 flex-md-grow-0" onClick={() => navigate(`/admin/events/edit/${id}`)}>
              <i className="bi bi-pencil me-2"></i> EDIT
            </button>
            <button className="btn btn-outline-secondary fw-bold btn-sm flex-grow-1 flex-md-grow-0" onClick={() => navigate('/admin/events')}>
              <i className="bi bi-arrow-left me-2"></i> BACK
            </button>
          </div>
        </header>

        <div className="row g-4">
          {/* Main Info Card */}
          <div className="col-lg-8">
            <div className="card bg-glass border-secondary shadow-lg mb-4 border-opacity-10">
              <div className="card-body p-3 p-md-4">
                <h5 className="text-white fw-bold mb-4 border-bottom border-white border-opacity-10 pb-3 fs-6">Event Specifications</h5>
                
                <div className="row g-3 g-md-4">
                  <div className="col-6 col-md-4">
                    <label className="text-info x-small fw-bold mb-1 d-block text-uppercase">Rounds</label>
                    <h4 className="text-white fw-bold fs-5 fs-md-4">{event.rounds} Round{event.rounds > 1 ? 's' : ''}</h4>
                  </div>
                  
                  <div className="col-6 col-md-8">
                    <label className="text-info x-small fw-bold mb-1 d-block text-uppercase">Team Capacity</label>
                    <h4 className="text-white fw-bold fs-5 fs-md-4">
                      {event.minParticipants === event.maxParticipants 
                        ? `${event.minParticipants} Unit` 
                        : `${event.minParticipants}-${event.maxParticipants} Units`}
                    </h4>
                  </div>
                  
                  <div className="col-12 mt-4">
                    <label className="text-info x-small fw-bold mb-3 d-block text-uppercase">Judging Criteria (Weights C1-C3)</label>
                    <div className="d-flex flex-column gap-2">
                      {event.judgingCriteria?.length > 0 ? event.judgingCriteria.map((criteria, index) => (
                        <div key={index} className="d-flex align-items-center bg-black bg-opacity-40 p-3 rounded border border-secondary border-opacity-20 shadow-sm">
                          <span className="text-info fw-bold me-3">C{index + 1}</span>
                          <span className="text-white fs-6">{criteria}</span>
                        </div>
                      )) : <p className="text-secondary small fst-italic">No criteria defined for this event.</p>}
                    </div>
                  </div>

                  <div className="col-12 mt-4">
                    <label className="text-info x-small fw-bold mb-2 d-block text-uppercase">Rules & Guidelines</label>
                    <div className="bg-black bg-opacity-40 p-3 p-md-4 rounded border border-secondary border-opacity-20 text-light shadow-inner">
                      <p className="mb-0 whitespace-pre-wrap small leading-relaxed" style={{ lineHeight: '1.6' }}>
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
            <div className="card bg-glass border-secondary shadow-lg mb-4 border-opacity-10">
              <div className="card-body p-3 p-md-4">
                <h5 className="text-white fw-bold mb-4 border-bottom border-white border-opacity-10 pb-3 text-uppercase fs-6">Assignments</h5>
                
                <div className="mb-4">
                  <label className="text-info x-small fw-bold mb-3 d-block">FACULTY JUDGES</label>
                  {event.faculties?.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {event.faculties.map((f, i) => (
                        <div key={i} className="bg-black bg-opacity-30 p-2 rounded border border-secondary border-opacity-20 d-flex align-items-center gap-2">
                          <i className="bi bi-person-badge text-info"></i>
                          <span className="text-white small">{f.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-secondary x-small">No judges assigned.</p>}
                </div>

                <div>
                  <label className="text-info x-small fw-bold mb-3 d-block">STUDENT COORDINATORS</label>
                  {event.studentCoordinators?.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {event.studentCoordinators.map((sc, i) => (
                        <div key={i} className="bg-black bg-opacity-30 p-2 rounded border border-secondary border-opacity-20 d-flex flex-column">
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-person-circle text-info"></i>
                            <span className="text-white small fw-bold">{sc.name}</span>
                          </div>
                          <span className="text-secondary x-small ps-4">{sc.phone}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-secondary x-small">No coordinators assigned.</p>}
                </div>
              </div>
            </div>

            <div className="card bg-info bg-opacity-10 border-info border-opacity-25 shadow-lg">
              <div className="card-body p-4 text-center">
                <i className="bi bi-shield-lock text-info fs-2 mb-2"></i>
                <h6 className="text-info fw-bold mb-2 small uppercase tracking-wider">Dynamic Validation</h6>
                <p className="text-white x-small mb-0 opacity-75 leading-sm">
                  Wizard enforces a minimum of <b>{event.minParticipants}</b> and maximum of <b>{event.maxParticipants}</b> members for this event.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @media (min-width: 992px) {
          .dashboard-content { margin-left: 280px; }
        }

        @media (max-width: 991.98px) {
          .dashboard-content { margin-left: 0; padding-top: 10px; }
        }

        .bg-glass { 
          background: rgba(255, 255, 255, 0.03) !important; 
          backdrop-filter: blur(20px); 
          border-radius: 20px; 
        }

        .whitespace-pre-wrap { white-space: pre-wrap; }
        .x-small { font-size: 0.7rem; }
        .x-small-badge { font-size: 0.65rem; }
        .fs-7 { font-size: 0.8rem; }
        .leading-sm { line-height: 1.4; }
      `}</style>
    </div>
  );
};

export default EventDetails;