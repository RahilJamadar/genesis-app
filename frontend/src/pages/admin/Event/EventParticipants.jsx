import React, { useEffect, useState } from 'react';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';

const EventParticipants = () => {
  const [events, setEvents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Initial Load: Fetch all Events and unique College names for the dropdowns
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [eventRes, teamRes] = await Promise.all([
          adminApi.get('/events'),
          adminApi.get('/teams')
        ]);
        
        setEvents(eventRes.data || []);
        
        const collegeSet = new Set(teamRes.data?.map(team => team.college) || []);
        setColleges([...collegeSet].sort());
      } catch (err) {
        toast.error('❌ Failed to load dropdown filter options');
      }
    };
    fetchFilters();
  }, []);

  // 2. Data Fetching: Handles Single or Combined filtering
  useEffect(() => {
    const fetchData = async () => {
      // If no filters are selected, reset state and don't call API
      if (!selectedEvent && !selectedCollege) {
        setParticipants([]);
        return;
      }

      setLoading(true);
      try {
        /**
         * 🛠️ UNIFIED FILTER LOGIC:
         * Constructs a query string based on what is selected.
         * Route matches: /api/admin/teams/participation/filter?eventName=...&collegeName=...
         */
        const params = new URLSearchParams();
        if (selectedEvent) params.append('eventName', selectedEvent);
        if (selectedCollege) params.append('collegeName', selectedCollege);

        const res = await adminApi.get(`/teams/participation/filter?${params.toString()}`);
        
        // Ensure data is sorted by college for better UI grouping
        const data = Array.isArray(res.data) ? res.data : [];
        setParticipants(data);
      } catch (err) {
        console.error("Filter Error:", err);
        toast.error('❌ Participation sync failed');
        setParticipants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedEvent, selectedCollege]);

  return (
    <div className="d-flex bg-dark min-vh-100">
      <Navbar />

      <main className="dashboard-content flex-grow-1 p-4 p-lg-5">
        <ToastContainer theme="dark" position="top-right" autoClose={3000} />

        <header className="mb-5">
          <h2 className="fw-bold text-white mb-1">Participation Tracker</h2>
          <p className="text-light opacity-75">Filter by Event, College, or Both to audit registrations</p>
        </header>

        {/* Filter Section - Persists selections for combined filtering */}
        <div className="row g-4 mb-5">
          <div className="col-md-6">
            <div className="card bg-glass border-secondary shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="text-info small fw-bold text-uppercase ls-1">🎯 Event Filter</label>
                    {selectedEvent && (
                        <button className="btn btn-link text-danger p-0 x-small text-decoration-none" onClick={() => setSelectedEvent('')}>Clear</button>
                    )}
                </div>
                <select
                  className="form-select bg-dark text-white border-secondary shadow-none py-2"
                  value={selectedEvent}
                  onChange={e => setSelectedEvent(e.target.value)}
                >
                  <option value="">-- All Events --</option>
                  {events?.map((ev, i) => (
                    <option key={i} value={ev.name}>{ev.name} ({ev.category})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card bg-glass border-secondary shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="text-info small fw-bold text-uppercase ls-1">🏫 College Filter</label>
                    {selectedCollege && (
                        <button className="btn btn-link text-danger p-0 x-small text-decoration-none" onClick={() => setSelectedCollege('')}>Clear</button>
                    )}
                </div>
                <select
                  className="form-select bg-dark text-white border-secondary shadow-none py-2"
                  value={selectedCollege}
                  onChange={e => setSelectedCollege(e.target.value)}
                >
                  <option value="">-- All Colleges --</option>
                  {colleges?.map((name, i) => (
                    <option key={i} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info mb-3" role="status"></div>
            <p className="text-info small fw-bold text-uppercase ls-1">Syncing Registry...</p>
          </div>
        ) : (
          <div className="participant-results">
            {(!selectedEvent && !selectedCollege) ? (
              <div className="card bg-glass border-secondary p-5 text-center">
                <i className="bi bi-search text-secondary fs-1 mb-3"></i>
                <p className="text-light opacity-50 mb-0 fst-italic">Select Event or College to generate audit reports.</p>
              </div>
            ) : participants.length === 0 ? (
              <div className="card bg-glass border-secondary p-5 text-center">
                <i className="bi bi-exclamation-triangle text-warning fs-1 mb-3"></i>
                <p className="text-light opacity-50 mb-0">No active student registrations match this filter combination.</p>
              </div>
            ) : (
              <div className="row g-4">
                {participants.map((block, i) => (
                  <div key={i} className="col-xl-6">
                    <div className="card bg-glass border-info border-opacity-25 h-100 shadow-sm transition-all">
                      <div className="card-header bg-info bg-opacity-10 border-bottom border-info border-opacity-25 p-3 d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="text-info fw-bold mb-0">🏫 {block.college}</h5>
                            <span className="text-white opacity-50 x-small">Leader: {block.leader}</span>
                        </div>
                        <span className="badge bg-info bg-opacity-20 text-info border border-info border-opacity-25">
                          {block.participants?.length || 0} Members
                        </span>
                      </div>
                      <div className="card-body p-0">
                        {block.participants?.length > 0 ? (
                            block.participants.map((p, idx) => (
                                <div key={idx} className="p-3 border-bottom border-secondary border-opacity-50 hover-bg transition-all">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="text-white fw-bold mb-1">{p.name}</h6>
                                    {block.leader === p.name && (
                                      <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 x-small">LEADER</span>
                                    )}
                                  </div>
                                  <div className="text-light opacity-75 small d-flex flex-wrap gap-3 mt-1">
                                    <span><i className="bi bi-telephone me-1 text-info"></i> {block.contact}</span>
                                    {/* Show specific student events ONLY if event filter is NOT active */}
                                    {!selectedEvent && (
                                      <div className="w-100 mt-2">
                                        <div className="d-flex flex-wrap gap-1">
                                          {p.events?.map((ev, eIdx) => (
                                            <span key={eIdx} className="badge bg-dark border border-secondary text-white x-small fw-normal">{ev}</span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))
                        ) : (
                            <div className="p-3 text-muted x-small italic text-center">No matching students in this event selection.</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        .dashboard-content { margin-left: 260px; transition: 0.3s; }
        .bg-glass { background: rgba(255, 255, 255, 0.03) !important; backdrop-filter: blur(12px); border-radius: 18px; }
        .hover-bg:hover { background: rgba(255, 255, 255, 0.06) !important; }
        .ls-1 { letter-spacing: 1px; }
        .x-small { font-size: 0.65rem; }
        .transition-all { transition: all 0.2s ease; }
        @media (max-width: 991.98px) { .dashboard-content { margin-left: 0; padding-top: 80px; } }
      `}</style>
    </div>
  );
};

export default EventParticipants;