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
  const [categoryFilter, setCategoryFilter] = useState('all'); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const trophyEventIds = useMemo(() => {
    return events
      .filter(e => e.isTrophyEvent === true)
      .map(e => e._id.toString());
  }, [events]);

  const trophyEventCount = trophyEventIds.length;

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [teamRes, eventRes] = await Promise.all([
        adminApi.get('/teams'),
        adminApi.get('/events')
      ]);
      setTeams(teamRes.data || []);
      setEvents(eventRes.data || []);
    } catch (err) {
      toast.error('❌ Failed to synchronize data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Updated Filter Logic for hackathon, football, valorant, college team
  useEffect(() => {
    let results = teams.filter(team =>
      (team.college?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (team.leader?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (team.teamName?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    if (categoryFilter !== 'all') {
      results = results.filter(team => {
        const eventNames = team.registeredEvents?.map(e => (typeof e === 'object' ? e.name : "").toLowerCase()) || [];
        
        switch (categoryFilter) {
          case 'main':
            return team.registeredEvents?.length > 1;
          case 'hackathon':
            return eventNames.some(name => name.includes('hackathon'));
          case 'football':
            return eventNames.some(name => name.includes('football'));
          case 'valorant':
            return eventNames.some(name => name.includes('valorant'));
          default:
            return true;
        }
      });
    }

    setFilteredTeams(results);
  }, [searchTerm, categoryFilter, teams]);

  const exportToExcel = () => {
    if (filteredTeams.length === 0) {
      toast.info("No data in current view to export");
      return;
    }
    const masterData = filteredTeams.map(team => {
      const count = team.registeredEvents?.filter(item => {
        const id = typeof item === 'object' ? item._id : item;
        return trophyEventIds.includes(id?.toString());
      }).length || 0;

      return {
        "Assigned Name": team.teamName || "N/A",
        "College": team.college,
        "Leader": team.leader,
        "Type": team.registeredEvents?.length > 1 ? "Main College" : "Individual",
        "Participation": `${count} / ${trophyEventCount}`,
        "Payment": team.paymentStatus?.toUpperCase()
      };
    });
    const ws = XLSX.utils.json_to_sheet(masterData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Filtered_Teams");
    XLSX.writeFile(wb, `Genesis_Teams_Report_${categoryFilter}.xlsx`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('🚨 Purge this team? This cannot be undone.')) return;
    try {
      await adminApi.delete(`/teams/${id}`);
      setTeams(prev => prev.filter(t => t._id !== id));
      toast.success('Team records purged successfully');
    } catch (err) {
      toast.error('Failed to delete team');
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

      <main className="dashboard-content flex-grow-1 p-3 p-md-4">
        <header className="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="text-center text-md-start w-100">
            <h2 className="fw-bold text-white mb-1">Sector Management</h2>
            <div className="d-flex flex-wrap gap-2 mt-3 justify-content-center justify-content-md-start">
              <div className="input-group input-group-sm" style={{ maxWidth: '300px' }}>
                <span className="input-group-text bg-black border-secondary text-secondary"><i className="bi bi-search"></i></span>
                <input type="text" className="form-control bg-dark border-secondary text-white shadow-none" placeholder="Search team or college..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>

              <select 
                className="form-select form-select-sm bg-dark text-info border-secondary shadow-none fw-bold" 
                style={{ maxWidth: '200px' }}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">📁 All Units</option>
                <option value="main">🏆 College Teams</option>
                <option value="hackathon">💻 Hackathon</option>
                <option value="football">⚽ Football</option>
                <option value="valorant">🔫 Valorant</option>
              </select>

              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-info fw-bold" onClick={fetchInitialData} title="Refresh"><i className="bi bi-arrow-clockwise"></i></button>
                <button className="btn btn-sm btn-success fw-bold px-3" onClick={exportToExcel} disabled={loading}><i className="bi bi-file-earmark-excel me-1"></i>Export</button>
              </div>
            </div>
          </div>
          <div className="bg-glass px-4 py-2 rounded border border-secondary text-center min-w-[120px] d-none d-sm-block">
            <div className="text-info fw-bold fs-3 leading-none">{filteredTeams.length}</div>
            <div className="text-white x-small text-uppercase ls-1">Active Nodes</div>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-info" role="status"></div></div>
        ) : (
          <div className="row g-3">
            {filteredTeams.length > 0 ? (
              filteredTeams.map((team) => {
                const teamTrophyParticipations = team.registeredEvents?.filter(item => {
                  const eventId = typeof item === 'object' ? item._id : item;
                  return trophyEventIds.includes(eventId?.toString());
                }).length || 0;

                const isMainCollegeTeam = (team.registeredEvents?.length || 0) > 1;
                const isEligible = teamTrophyParticipations >= trophyEventCount && trophyEventCount > 0;
                const standaloneEvent = !isMainCollegeTeam && (typeof team.registeredEvents?.[0] === 'object' ? team.registeredEvents?.[0]?.name : 'OPEN EVENT');

                return (
                  <div key={team._id} className="col-12 col-xl-6 animate-fade-in">
                    <div className={`card bg-glass team-card h-100 ${isMainCollegeTeam && !isEligible ? 'border-danger' : 'border-secondary border-opacity-20'}`}>
                      <div className="card-body p-3 p-md-4">
                        
                        {/* Status Header */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          {isMainCollegeTeam ? (
                             <span className={`badge ${isEligible ? 'bg-success' : 'bg-danger'} bg-opacity-10 ${isEligible ? 'text-success' : 'text-danger'} border ${isEligible ? 'border-success' : 'border-danger'} border-opacity-20 x-small-badge`}>
                               {isEligible ? '🏆 TROPHY ELIGIBLE' : '⚠️ INELIGIBLE'}
                             </span>
                          ) : (
                             <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-20 x-small-badge">
                               {standaloneEvent}
                             </span>
                          )}
                          <div className="d-flex gap-2">
                             {renderPaymentBadge(team.paymentStatus)}
                          </div>
                        </div>

                        {/* Team Name / College Section */}
                        <div className="mb-3">
                          <span className="text-secondary x-small fw-bold text-uppercase ls-1 d-block mb-1">Node Identity</span>
                          <h4 className="text-white fw-black mb-1 text-wrap break-word">{team.teamName || <span className="opacity-25 fw-normal small italic">ID_NOT_SET</span>}</h4>
                          <h6 className="text-info fw-bold text-wrap break-word m-0" style={{ lineHeight: '1.4' }}>{team.college}</h6>
                        </div>

                        <div className="row g-2 mb-4">
                            <div className="col-12 col-sm-6">
                                <div className="p-2 bg-black bg-opacity-30 rounded border border-white border-opacity-5">
                                    <div className="text-secondary x-small fw-bold uppercase mb-1">Commander</div>
                                    <div className="text-white small text-truncate"><i className="bi bi-person-fill text-warning me-2"></i>{team.leader}</div>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6">
                                <div className="p-2 bg-black bg-opacity-30 rounded border border-white border-opacity-5">
                                    <div className="text-secondary x-small fw-bold uppercase mb-1">Comms Link</div>
                                    <div className="text-white small text-truncate"><i className="bi bi-telephone-fill text-warning me-2"></i>{team.contact}</div>
                                </div>
                            </div>
                        </div>

                        {/* Logistics Grid */}
                        <div className="bg-dark bg-opacity-50 rounded p-2 mb-4 border border-secondary border-opacity-20">
                          <div className="row text-center text-white g-0">
                            <div className="col-4 border-end border-white border-opacity-10">
                              <div className="text-secondary x-small fw-bold">UNITS</div>
                              <div className="fw-bold">{team.members?.length || 0}</div>
                            </div>
                            <div className="col-4 border-end border-white border-opacity-10">
                              <div className="text-success x-small fw-bold">VEG</div>
                              <div className="fw-bold">{team.vegCount || 0}</div>
                            </div>
                            <div className="col-4">
                              <div className="text-danger x-small fw-bold">NV</div>
                              <div className="fw-bold">{team.nonVegCount || 0}</div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="d-flex flex-wrap gap-2 mt-auto">
                          <button className="btn btn-info btn-sm flex-grow-1 fw-bold text-black" onClick={() => navigate(`/admin/teams/view/${team._id}`)}>
                            <i className="bi bi-cpu-fill me-2"></i>VIEW DATA
                          </button>
                          <button className="btn btn-outline-warning btn-sm" onClick={() => navigate(`/admin/teams/edit/${team._id}`)}><i className="bi bi-pencil-square"></i></button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(team._id)}><i className="bi bi-trash3-fill"></i></button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-12 text-center py-5">
                <i className="bi bi-search fs-1 text-secondary opacity-25"></i>
                <p className="text-secondary mt-3">No neural signatures match your query.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        @media (min-width: 992px) { .dashboard-content { margin-left: 280px; } }
        .bg-glass { background: rgba(15, 15, 20, 0.9) !important; backdrop-filter: blur(12px); border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); }
        .team-card { transition: all 0.3s ease; }
        .team-card:hover { border-color: #0dcaf0 !important; transform: translateY(-4px); box-shadow: 0 12px 40px -10px rgba(0, 255, 255, 0.15); }
        .x-small { font-size: 0.65rem; }
        .x-small-badge { font-size: 0.65rem; font-weight: 800; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.5px; }
        .ls-1 { letter-spacing: 0.8px; }
        .fw-black { font-weight: 900; }
        .break-word { word-wrap: break-word; overflow-wrap: break-word; white-space: normal; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        /* Mobile-specific adjustments */
        @media (max-width: 576px) {
            .dashboard-content { padding: 1rem !important; }
            h4 { font-size: 1.1rem; }
            h6 { font-size: 0.9rem; }
        }
      `}</style>
    </div>
  );
};

export default Teams;