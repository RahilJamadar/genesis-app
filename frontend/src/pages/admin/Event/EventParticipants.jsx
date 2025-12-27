import React, { useEffect, useState } from 'react';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { toast } from 'react-toastify';
const EventParticipants = () => {
  const [events, setEvents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedEvent && !selectedCollege) {
        setParticipants([]);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedEvent) params.append('eventName', selectedEvent);
        if (selectedCollege) params.append('collegeName', selectedCollege);

        const res = await adminApi.get(`/teams/participation/filter?${params.toString()}`);
        const data = Array.isArray(res.data) ? res.data : [];
        setParticipants(data);
      } catch (err) {
        toast.error('❌ Participation sync failed');
        setParticipants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedEvent, selectedCollege]);

  return (
    <div className="d-flex bg-dark min-vh-100 flex-column flex-lg-row">
      <Navbar />

      <main className="dashboard-content flex-grow-1 p-3 p-md-4 p-lg-5">

        <header className="mb-4 mb-lg-5 text-center text-lg-start">
          <h2 className="fw-bold text-white mb-1 fs-3 fs-md-2">Participation Tracker</h2>
          <p className="text-light opacity-75 small">Filter by Event, College, or Both to audit registrations</p>
        </header>

        {/* Filter Section */}
        <div className="row g-3 g-md-4 mb-4 mb-lg-5">
          <div className="col-md-6">
            <div className="card bg-glass border-secondary shadow-sm border-opacity-10">
              <div className="card-body p-3 p-md-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="text-info x-small fw-bold text-uppercase ls-1">🎯 Event Filter</label>
                    {selectedEvent && (
                        <button className="btn btn-link text-danger p-0 x-small text-decoration-none fw-bold" onClick={() => setSelectedEvent('')}>CLEAR</button>
                    )}
                </div>
                <select
                  className="form-select bg-dark text-white border-secondary shadow-none py-2 py-md-2 fs-7"
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
            <div className="card bg-glass border-secondary shadow-sm border-opacity-10">
              <div className="card-body p-3 p-md-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="text-info x-small fw-bold text-uppercase ls-1">🏫 College Filter</label>
                    {selectedCollege && (
                        <button className="btn btn-link text-danger p-0 x-small text-decoration-none fw-bold" onClick={() => setSelectedCollege('')}>CLEAR</button>
                    )}
                </div>
                <select
                  className="form-select bg-dark text-white border-secondary shadow-none py-2 py-md-2 fs-7"
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
            <p className="text-info x-small fw-bold text-uppercase ls-1">Syncing Registry...</p>
          </div>
        ) : (
          <div className="participant-results">
            {(!selectedEvent && !selectedCollege) ? (
              <div className="card bg-glass border-secondary p-5 text-center border-opacity-10">
                <i className="bi bi-search text-secondary fs-1 mb-3"></i>
                <p className="text-light opacity-50 mb-0 fst-italic small">Select filters to generate reports.</p>
              </div>
            ) : participants.length === 0 ? (
              <div className="card bg-glass border-secondary p-5 text-center border-opacity-10">
                <i className="bi bi-exclamation-triangle text-warning fs-1 mb-3"></i>
                <p className="text-light opacity-50 mb-0 small">No active registrations match these filters.</p>
              </div>
            ) : (
              <div className="row g-3 g-md-4">
                {participants.map((block, i) => (
                  <div key={i} className="col-12 col-xl-6">
                    <div className="card bg-glass border-info border-opacity-20 h-100 shadow-sm overflow-hidden">
                      <div className="card-header bg-info bg-opacity-10 border-bottom border-info border-opacity-10 p-3 d-flex justify-content-between align-items-center">
                        <div className="overflow-hidden">
                            <h5 className="text-info fw-bold mb-0 fs-6 text-truncate">🏫 {block.college}</h5>
                            <span className="text-white opacity-50 x-small d-block text-truncate">Leader: {block.leader}</span>
                        </div>
                        <span className="badge bg-info bg-opacity-20 text-info border border-info border-opacity-25 ms-2 x-small-badge">
                          {block.participants?.length || 0}
                        </span>
                      </div>
                      <div className="card-body p-0">
                        <div className="participant-inner-list overflow-auto" style={{maxHeight: '400px'}}>
                        {block.participants?.length > 0 ? (
                            block.participants.map((p, idx) => (
                                <div key={idx} className="p-3 border-bottom border-white border-opacity-5 hover-bg transition-all">
                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                    <h6 className="text-white fw-bold mb-0 small">{p.name}</h6>
                                    {block.leader === p.name && (
                                      <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 x-small-badge">LEADER</span>
                                    )}
                                  </div>
                                  <div className="text-light opacity-75 x-small d-flex flex-wrap gap-2 mt-2">
                                    <span><i className="bi bi-telephone me-1 text-info"></i> {block.contact}</span>
                                    {!selectedEvent && (
                                      <div className="w-100 mt-1">
                                        <div className="d-flex flex-wrap gap-1">
                                          {p.events?.map((ev, eIdx) => (
                                            <span key={eIdx} className="badge bg-black bg-opacity-40 border border-secondary border-opacity-20 text-white x-small-badge fw-normal">{ev}</span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))
                        ) : (
                            <div className="p-3 text-muted x-small italic text-center">No matching students.</div>
                        )}
                        </div>
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

        .hover-bg:hover { background: rgba(255, 255, 255, 0.05) !important; }
        .ls-1 { letter-spacing: 1px; }
        .x-small { font-size: 0.7rem; }
        .x-small-badge { font-size: 0.65rem; }
        .fs-7 { font-size: 0.85rem; }
        .transition-all { transition: all 0.2s ease; }

        .participant-inner-list::-webkit-scrollbar { width: 4px; }
        .participant-inner-list::-webkit-scrollbar-thumb { 
          background: rgba(13, 202, 240, 0.2); 
          border-radius: 10px; 
        }
      `}</style>
    </div>
  );
};

export default EventParticipants;