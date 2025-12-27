import React, { useEffect, useState } from 'react';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { toast } from 'react-toastify';

const EventParticipants = () => {
  const [events, setEvents] = useState([]);
  const [allTeams, setAllTeams] = useState([]); // Store master list
  const [filteredData, setFilteredData] = useState([]); // Store what we show
  const [colleges, setColleges] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [loading, setLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [eventRes, teamRes] = await Promise.all([
          adminApi.get('/events'),
          adminApi.get('/teams')
        ]);
        
        setEvents(eventRes.data || []);
        setAllTeams(teamRes.data || []);
        
        // Extract unique colleges
        const collegeSet = new Set(teamRes.data?.map(team => team.college) || []);
        setColleges([...collegeSet].sort());
      } catch (err) {
        toast.error('❌ Failed to sync with database');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Filter Logic - This replaces the broken /filter API call
  useEffect(() => {
    if (!selectedEvent && !selectedCollege) {
      setFilteredData([]);
      return;
    }

    let results = [...allTeams];

    // 1. Filter by College if selected
    if (selectedCollege) {
      results = results.filter(team => team.college === selectedCollege);
    }

    // 2. Filter by Event if selected
    if (selectedEvent) {
      results = results.filter(team => {
        // Check if event is in team's registeredEvents names or IDs
        // and also check members list for specific event names
        const hasEventInTeam = team.registeredEvents?.some(ev => 
          ev.name?.toLowerCase() === selectedEvent.toLowerCase()
        );
        const hasEventInMembers = team.members?.some(member => 
          member.events?.some(e => e.toLowerCase() === selectedEvent.toLowerCase())
        );
        return hasEventInTeam || hasEventInMembers;
      });
    }

    // 3. Transform data for display (only show members belonging to selected event)
    const transformed = results.map(team => ({
      college: team.college,
      leader: team.leader,
      contact: team.contact,
      participants: team.members?.filter(m => {
        if (!selectedEvent) return true; // Show all if no event filter
        return m.events?.some(e => e.toLowerCase() === selectedEvent.toLowerCase());
      }) || []
    })).filter(item => item.participants.length > 0);

    setFilteredData(transformed);
  }, [selectedEvent, selectedCollege, allTeams]);

  return (
    <div className="d-flex bg-dark min-vh-100 flex-column flex-lg-row">
      <Navbar />

      <main className="dashboard-content flex-grow-1 p-3 p-md-4 p-lg-5">
        <header className="mb-4 mb-lg-5 text-center text-lg-start">
          <h2 className="fw-bold text-white mb-1 fs-3 fs-md-2">Participation Tracker</h2>
          <p className="text-light opacity-75 small">Filter sector-wise registrations and audit crew lists</p>
        </header>

        {/* Filter Section */}
        <div className="row g-3 g-md-4 mb-4 mb-lg-5">
          <div className="col-md-6">
            <div className="card bg-glass border-secondary shadow-sm border-opacity-10">
              <div className="card-body p-3 p-md-4">
                <label className="text-info x-small fw-bold text-uppercase ls-1 mb-2 d-block">🎯 Event Filter</label>
                <select
                  className="form-select bg-dark text-white border-secondary shadow-none"
                  value={selectedEvent}
                  onChange={e => setSelectedEvent(e.target.value)}
                >
                  <option value="">-- All Events --</option>
                  {events?.map((ev, i) => (
                    <option key={i} value={ev.name}>{ev.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card bg-glass border-secondary shadow-sm border-opacity-10">
              <div className="card-body p-3 p-md-4">
                <label className="text-info x-small fw-bold text-uppercase ls-1 mb-2 d-block">🏫 College Filter</label>
                <select
                  className="form-select bg-dark text-white border-secondary shadow-none"
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
            <div className="spinner-border text-info mb-3"></div>
            <p className="text-info x-small fw-bold uppercase">Syncing Registry...</p>
          </div>
        ) : (
          <div className="participant-results">
            {(!selectedEvent && !selectedCollege) ? (
              <div className="card bg-glass border-secondary p-5 text-center border-opacity-10">
                <i className="bi bi-search text-secondary fs-1 mb-3"></i>
                <p className="text-light opacity-50 mb-0">Select a filter to generate the participation report.</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="card bg-glass border-secondary p-5 text-center border-opacity-10">
                <i className="bi bi-exclamation-triangle text-warning fs-1 mb-3"></i>
                <p className="text-light opacity-50 mb-0">No active registrations found for this selection.</p>
              </div>
            ) : (
              <div className="row g-3 g-md-4">
                {filteredData.map((block, i) => (
                  <div key={i} className="col-12 col-xl-6">
                    <div className="card bg-glass border-info border-opacity-20 h-100 shadow-sm overflow-hidden">
                      <div className="card-header bg-info bg-opacity-10 border-bottom border-info border-opacity-10 p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="text-info fw-bold mb-0 text-truncate">{block.college}</h6>
                          <span className=" text-black badge bg-info bg-opacity-20 text-info border border-info border-opacity-25">
                            {block.participants.length} Units
                          </span>
                        </div>
                        <div className="x-small text-white opacity-50 mt-1">
                          Leader: {block.leader} | 📞 {block.contact}
                        </div>
                      </div>
                      <div className="card-body p-0">
                        <div className="participant-inner-list overflow-auto" style={{maxHeight: '350px'}}>
                          {block.participants.map((p, idx) => (
                            <div key={idx} className="p-3 border-bottom border-white border-opacity-5 hover-bg">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-white fw-bold small">{p.name}</span>
                                <div className="d-flex gap-1">
                                  {p.events?.map((evName, eIdx) => (
                                    <span key={eIdx} className="badge bg-black border border-secondary text-info x-small-badge">
                                      {evName}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
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
        @media (min-width: 992px) { .dashboard-content { margin-left: 280px; } }
        .bg-glass { background: rgba(255, 255, 255, 0.03) !important; backdrop-filter: blur(15px); border-radius: 15px; }
        .hover-bg:hover { background: rgba(255, 255, 255, 0.05); }
        .x-small { font-size: 0.7rem; }
        .x-small-badge { font-size: 0.6rem; }
        .ls-1 { letter-spacing: 1px; }
      `}</style>
    </div>
  );
};

export default EventParticipants;