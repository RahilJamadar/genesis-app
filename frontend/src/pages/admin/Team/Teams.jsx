import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [events, setEvents] = useState([]); 
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🚀 1. Robust ID Extraction
  // We convert everything to strings and trim them to avoid whitespace or type mismatches
  const trophyEventIds = useMemo(() => {
    return events
      .filter(e => e.isTrophyEvent === true)
      .map(e => e._id.toString());
  }, [events]);

  const trophyEventCount = trophyEventIds.length;

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [teamRes, eventRes] = await Promise.all([
        adminApi.get('/teams'),
        adminApi.get('/events')
      ]);
      
      // Safety check: ensure we always have arrays
      const teamData = teamRes.data || [];
      const eventData = eventRes.data || [];
      
      setTeams(teamData);
      setEvents(eventData);
      setFilteredTeams(teamData);
    } catch (err) {
      toast.error('❌ Failed to synchronize data');
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/teams');
      setTeams(res.data || []);
    } catch (e) {
      toast.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const results = teams.filter(team => 
      (team.college?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (team.leader?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (team.teamName?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
    setFilteredTeams(results);
  }, [searchTerm, teams]);

  const exportToExcel = () => {
    if (teams.length === 0) {
        toast.info("No data available to export");
        return;
    }
    const masterData = teams.map(team => {
        // Use the same robust counting logic for the excel report
        const count = team.registeredEvents?.filter(item => {
            const id = typeof item === 'object' ? item._id : item;
            return trophyEventIds.includes(id?.toString());
        }).length || 0;

        return {
            "Assigned Name": team.teamName || "N/A",
            "College": team.college,
            "Leader": team.leader,
            "Participation": `${count} / ${trophyEventCount}`,
            "Status": team.paymentStatus?.toUpperCase()
        };
    });
    const ws = XLSX.utils.json_to_sheet(masterData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Teams");
    XLSX.writeFile(wb, `Genesis_Teams_Eligibility.xlsx`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('🚨 Purge this team?')) return;
    try {
      await adminApi.delete(`/teams/${id}`);
      setTeams(prev => prev.filter(t => t._id !== id));
      toast.success('Purged');
    } catch (err) {
      toast.error('Failed');
    }
  };

  const renderPaymentBadge = (status) => {
    switch (status) {
      case 'verified':
        return <span className="badge bg-success border border-success bg-opacity-10 text-success px-2 py-1"><i className="bi bi-shield-check me-1"></i>VERIFIED</span>;
      case 'paid':
        return <span className="badge bg-info border border-info bg-opacity-10 text-info px-2 py-1"><i className="bi bi-cash-stack me-1"></i>PAID</span>;
      default:
        return <span className="badge bg-warning border border-warning bg-opacity-10 text-warning px-2 py-1"><i className="bi bi-clock-history me-1"></i>PENDING</span>;
    }
  };

  return (
    <div className="d-flex bg-dark min-vh-100 flex-column flex-lg-row">
      <Navbar />

      <main className="dashboard-content flex-grow-1 p-3 p-md-4 p-lg-5">
        <header className="mb-4 mb-lg-5 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
          <div className="text-center text-sm-start flex-grow-1">
            <h2 className="fw-bold text-white mb-1">Team Hub</h2>
            <div className="d-flex flex-wrap gap-2 mt-3 justify-content-center justify-content-sm-start">
                <div className="input-group input-group-sm mb-0" style={{ maxWidth: '300px' }}>
                    <span className="input-group-text bg-black border-secondary text-secondary"><i className="bi bi-search"></i></span>
                    <input type="text" className="form-control bg-dark border-secondary text-white shadow-none" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <button className="btn btn-sm btn-outline-info fw-bold px-3" onClick={fetchTeams}><i className="bi bi-arrow-clockwise"></i></button>
                <button className="btn btn-sm btn-success fw-bold px-3" onClick={exportToExcel} disabled={loading}><i className="bi bi-file-earmark-excel me-2"></i>Export</button>
            </div>
          </div>
          <div className="bg-glass px-4 py-2 rounded border border-secondary text-center">
            <div className="text-info fw-bold fs-3 leading-none">{filteredTeams.length}</div>
            <div className="text-white x-small text-uppercase ls-1">Registrations</div>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-info" role="status"></div></div>
        ) : (
          <div className="row g-3 g-lg-4">
            {filteredTeams.map(team => {
              // 🚀 2. REFINED MATCHING LOGIC
              // Works even if team.registeredEvents is populated (objects) or unpopulated (strings)
              const teamTrophyParticipations = team.registeredEvents?.filter(item => {
                const eventId = typeof item === 'object' ? item._id : item;
                return trophyEventIds.includes(eventId?.toString());
              }).length || 0;

              const isEligible = teamTrophyParticipations >= trophyEventCount && trophyEventCount > 0;

              return (
                <div key={team._id} className="col-12 col-xl-6">
                  <div className={`card bg-glass team-card h-100 ${!isEligible ? 'border-danger border-opacity-40' : 'border-secondary'}`}>
                    <div className="card-body p-3 p-md-4">
                      
                      {/* Eligibility Banner */}
                      <div className={`mb-3 p-2 rounded border d-flex justify-content-between align-items-center ${isEligible ? 'bg-success bg-opacity-10 border-success border-opacity-20' : 'bg-danger bg-opacity-10 border-danger border-opacity-20'}`}>
                        <div className="d-flex align-items-center gap-2">
                           <i className={`bi ${isEligible ? 'bi-trophy-fill text-warning' : 'bi-exclamation-triangle-fill text-danger'}`}></i>
                           <span className={`fw-bold x-small ls-1 ${isEligible ? 'text-success' : 'text-danger'}`}>
                             {isEligible ? 'ELIGIBLE FOR CHAMPIONSHIP' : 'NOT ELIGIBLE'}
                           </span>
                        </div>
                        <span className={`badge ${isEligible ? 'bg-success' : 'bg-danger'} border border-secondary text-white x-small-badge`}>
                          {teamTrophyParticipations} / {trophyEventCount} EVENTS
                        </span>
                      </div>

                      {!isEligible && trophyEventCount > 0 && (
                        <div className="mb-3 animate-fade-in bg-danger bg-opacity-10 p-2 rounded border border-danger border-opacity-10">
                          <p className="text-danger x-small fw-bold mb-0 italic">
                             MISSING {trophyEventCount - teamTrophyParticipations} COMPULSORY EVENTS.
                          </p>
                        </div>
                      )}

                      <div className="mb-3 pb-2 border-bottom border-white border-opacity-10">
                        <span className="text-secondary x-small fw-bold text-uppercase ls-1">Assigned Identity</span>
                        <h4 className="text-white fw-black mb-0 tracking-tight">{team.teamName || <span className="opacity-25 fw-normal small italic">Pending...</span>}</h4>
                      </div>

                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-2 mb-3">
                        <div className="flex-grow-1 overflow-hidden">
                          <h5 className="text-info fw-bold mb-1 text-truncate">{team.college}</h5>
                          <div className="d-flex flex-wrap align-items-center gap-2 text-white opacity-75 x-small">
                            <span><i className="bi bi-person-badge text-warning me-1"></i>{team.leader}</span>
                            <span className="opacity-25">|</span>
                            <span><i className="bi bi-telephone text-warning me-1"></i>{team.contact}</span>
                          </div>
                        </div>
                        <div className="d-flex flex-row flex-md-column align-items-center align-items-md-end gap-2 w-100 w-md-auto justify-content-between">
                          {renderPaymentBadge(team.paymentStatus)}
                          <span className="text-white opacity-50 x-small-badge">{team.isOutstation ? 'OUTSTATION' : 'LOCAL'}</span>
                        </div>
                      </div>

                      <div className="bg-black bg-opacity-40 rounded p-3 mb-4 border border-secondary border-opacity-50">
                        <div className="row text-center text-white g-0">
                          <div className="col-4 border-end border-secondary border-opacity-30">
                            <div className="text-secondary x-small fw-bold uppercase">Units</div>
                            <div className="fw-bold">{team.members?.length || 0}</div>
                          </div>
                          <div className="col-4 border-end border-secondary border-opacity-30">
                            <div className="text-success x-small fw-bold uppercase">Veg</div>
                            <div className="fw-bold">{team.vegCount || 0}</div>
                          </div>
                          <div className="col-4">
                            <div className="text-danger x-small fw-bold uppercase">Non</div>
                            <div className="fw-bold">{team.nonVegCount || 0}</div>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        <button className="btn btn-info btn-sm flex-grow-1 fw-bold text-black" onClick={() => navigate(`/admin/teams/view/${team._id}`)}>
                          <i className="bi bi-eye me-2"></i>Profile
                        </button>
                        <button className="btn btn-outline-warning btn-sm" onClick={() => navigate(`/admin/teams/edit/${team._id}`)}><i className="bi bi-pencil-square"></i></button>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(team._id)}><i className="bi bi-trash3"></i></button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <style>{`
        @media (min-width: 992px) { .dashboard-content { margin-left: 280px; } }
        .bg-glass { background: rgba(255, 255, 255, 0.03) !important; backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); }
        .team-card { transition: all 0.3s ease; }
        .team-card:hover { border-color: #0dcaf0 !important; transform: translateY(-3px); }
        .x-small { font-size: 0.7rem; }
        .x-small-badge { font-size: 0.65rem; font-weight: 800; border: 1px solid rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 4px; }
        .ls-1 { letter-spacing: 1px; }
        .fw-black { font-weight: 900; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default Teams;