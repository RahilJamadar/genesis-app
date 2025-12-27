import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import getApiBase from '../../../utils/getApiBase';
import FacultyNavbar from '../../../components/FacultyNavbar';
import { toast } from 'react-toastify';
const FacultyDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const baseURL = getApiBase();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('facultyToken');
        if (!token) {
          navigate('/faculty/login');
          return;
        }

        const res = await axios.get(`${baseURL}/api/faculty/dashboard/events`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        
        /**
         * 🏆 MASSIVE STEP CHANGE: 
         * Filter out events that are not marked for the trophy championship.
         * Only events with isTrophyEvent === true will be shown to judges.
         */
        const judgingEvents = (res.data || []).filter(event => event.isTrophyEvent === true);
        setEvents(judgingEvents);

      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        toast.error('❌ Failed to fetch assigned events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [baseURL, navigate]);

  return (
    <div className="bg-dark min-vh-100">
      <FacultyNavbar />
      
      <main className="container py-5">
        <header className="mb-5 text-center text-lg-start animate-fade-in">
          <h2 className="fw-bold text-white mb-1">
            Judge <span className="text-info">Portal</span>
          </h2>
          <p className="text-light opacity-75">Tournament Category Evaluation & Winner Selection</p>
        </header>

        <div className="row g-3 mb-5">
          <div className="col-md-4">
            <div className="card bg-glass border-secondary p-3 shadow-sm hover-lift">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-info bg-opacity-10 p-3 rounded-4 text-info">
                  <i className="bi bi-trophy fs-3"></i>
                </div>
                <div>
                  <h4 className="text-white fw-bold mb-0">{events.length}</h4>
                  <small className="text-info text-uppercase fw-bold x-small ls-1">Trophy Events</small>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card bg-glass border-secondary p-3 shadow-sm hover-lift">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-warning bg-opacity-10 p-3 rounded-4 text-warning">
                  <i className="bi bi-shield-lock fs-3"></i>
                </div>
                <div>
                  <h4 className="text-white fw-bold mb-0">Direct Logic</h4>
                  <small className="text-warning text-uppercase fw-bold x-small ls-1">No Negative Pts Enabled</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info" role="status"></div>
            <p className="text-info mt-3 small fw-bold text-uppercase ls-1">Synchronizing Assignments...</p>
          </div>
        ) : (
          <div className="row g-4">
            {events.length > 0 ? (
              events.map((event, index) => (
                <div key={event._id} className="col-md-6 col-lg-4 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="card bg-glass border-secondary h-100 hover-lift shadow-lg">
                    <div className="card-body p-4 d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-2">
                          {event.category || 'Event'}
                        </span>
                        
                        {/* 🚀 NEW: Marker for Direct Win vs Standard Criteria */}
                        {event.isDirectWin ? (
                          <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-2 py-1 x-small">
                            <i className="bi bi-lightning-fill me-1"></i> DIRECT WIN
                          </span>
                        ) : (
                          <span className="badge bg-secondary bg-opacity-10 text-light border border-secondary border-opacity-25 px-2 py-1 x-small">
                            <i className="bi bi-sliders me-1"></i> CRITERIA
                          </span>
                        )}
                      </div>

                      <h4 className="card-title fw-bold text-white mb-2">{event.name}</h4>
                      <p className="text-light opacity-50 small flex-grow-1">
                        {event.description?.substring(0, 100) || "Submit results for this championship event."}...
                      </p>

                      <div className="bg-dark bg-opacity-50 rounded-3 p-3 mt-3 border border-secondary border-opacity-25">
                         <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="x-small text-uppercase text-secondary fw-bold">Evaluation Style</span>
                            <span className="x-small text-info fw-bold">{event.isDirectWin ? 'Selection' : 'Sliders'}</span>
                         </div>
                         <div className="progress bg-secondary bg-opacity-10" style={{ height: '6px' }}>
                            <div className="progress-bar bg-info" style={{ width: '100%' }}></div>
                         </div>
                      </div>

                      <div className="d-grid gap-2 mt-4">
                        <button
                          className="btn btn-info fw-bold d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm"
                          onClick={() => navigate(`/faculty/event/${event._id}/score`)}
                        >
                          <i className={`bi ${event.isDirectWin ? 'bi-check-circle' : 'bi-pencil-square'}`}></i> 
                          {event.isDirectWin ? 'CHOOSE WINNERS' : 'ENTER SCORES'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <div className="bg-glass p-5 rounded-4 border border-secondary border-dashed animate-fade-in">
                  <i className="bi bi-clipboard-x text-info fs-1 mb-3"></i>
                  <h4 className="text-white fw-bold">No Trophy Events Found</h4>
                  <p className="text-secondary">Only events contributing to the Trophy Championship are shown here.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        .bg-glass { background: rgba(255, 255, 255, 0.03) !important; backdrop-filter: blur(12px); border-radius: 24px; }
        .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 1rem 3rem rgba(0,0,0,0.6) !important; }
        .x-small { font-size: 0.65rem; }
        .ls-1 { letter-spacing: 1px; }
        .border-dashed { border-style: dashed !important; }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        .animate-slide-up { opacity: 0; transform: translateY(20px); animation: slideUp 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default FacultyDashboard;