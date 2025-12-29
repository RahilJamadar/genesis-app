import React, { useEffect, useState } from 'react';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx'; // Import XLSX for excel export

const EventParticipants = () => {
  const [events, setEvents] = useState([]);
  const [allTeams, setAllTeams] = useState([]); 
  const [filteredData, setFilteredData] = useState([]); 
  const [colleges, setColleges] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (!selectedEvent && !selectedCollege) {
      setFilteredData([]);
      return;
    }

    let results = [...allTeams];

    if (selectedCollege) {
      results = results.filter(team => team.college === selectedCollege);
    }

    if (selectedEvent) {
      results = results.filter(team => {
        const hasEventInTeam = team.registeredEvents?.some(ev => 
          ev.name?.toLowerCase() === selectedEvent.toLowerCase()
        );
        const hasEventInMembers = team.members?.some(member => 
          member.events?.some(e => e.toLowerCase() === selectedEvent.toLowerCase())
        );
        return hasEventInTeam || hasEventInMembers;
      });
    }

    const transformed = results.map(team => ({
      college: team.college,
      teamName: team.teamName, 
      leader: team.leader,
      contact: team.contact,
      participants: team.members?.filter(m => {
        if (!selectedEvent) return true;
        return m.events?.some(e => e.toLowerCase() === selectedEvent.toLowerCase());
      }) || []
    })).filter(item => item.participants.length > 0);

    setFilteredData(transformed);
  }, [selectedEvent, selectedCollege, allTeams]);

  // --- 🚀 NEW: EXPORT FUNCTIONALITY ---
  const handleExport = () => {
    if (!selectedEvent) {
      toast.warn("Please select an event first to export.");
      return;
    }

    if (filteredData.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    // Prepare data for Excel
    const excelRows = [];
    
    filteredData.forEach(block => {
      block.participants.forEach(p => {
        excelRows.push({
          "Team Name": block.teamName || "N/A",
          "Participant Name": p.name,
          "Contact Number": p.contact || "N/A"
        });
      });
    });

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");

    // Fix column widths for better readability
    const wscols = [
      { wch: 25 }, // Team Name width
      { wch: 30 }, // Participant Name width
      { wch: 20 }, // Contact width
    ];
    worksheet['!cols'] = wscols;

    // Trigger Download
    const fileName = `${selectedEvent.replace(/\s+/g, '_')}_Participants.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success(`📊 ${selectedEvent} report exported!`);
  };

  return (
    <div className="d-flex bg-dark min-vh-100 flex-column flex-lg-row">
      <Navbar />

      <main className="dashboard-content flex-grow-1 p-3 p-md-4 p-lg-5">
        <header className="mb-4 mb-lg-5 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="text-center text-lg-start">
            <h2 className="fw-bold text-white mb-1 fs-3 fs-md-2">Participation Tracker</h2>
            <p className="text-light opacity-75 small">Filter sector-wise registrations and audit crew lists</p>
          </div>
          
          {/* 🚀 EXPORT BUTTON */}
          {selectedEvent && (
            <button 
                onClick={handleExport}
                className="btn btn-info fw-bold d-flex align-items-center gap-2 shadow-sm"
            >
                <i className="bi bi-file-earmark-excel-fill"></i>
                EXPORT DATA
            </button>
          )}
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
                          <div className="overflow-hidden">
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <span className="badge bg-info text-black fw-black x-small-badge ls-1">TEAM: {block.teamName || "PENDING"}</span>
                            </div>
                            <h6 className="text-white fw-bold mb-0 text-truncate">{block.college}</h6>
                          </div>
                          <span className="badge bg-info bg-opacity-20 text-black border border-info border-opacity-25 py-2 px-3">
                            {block.participants.length} Units
                          </span>
                        </div>
                        <div className="x-small text-white opacity-50 mt-2 font-mono">
                          LEADER: {block.leader} | 📞 {block.contact}
                        </div>
                      </div>
                      <div className="card-body p-0">
                        <div className="participant-inner-list overflow-auto" style={{maxHeight: '350px'}}>
                          {block.participants.map((p, idx) => (
                            <div key={idx} className="p-3 border-bottom border-white border-opacity-5 hover-bg">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-white fw-bold small">{p.name}</span>
                                <div className="d-flex gap-1 flex-wrap justify-content-end">
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
        .x-small-badge { font-size: 0.6rem; font-weight: 700; }
        .ls-1 { letter-spacing: 1px; }
        .fw-black { font-weight: 900; }
      `}</style>
    </div>
  );
};

export default EventParticipants;