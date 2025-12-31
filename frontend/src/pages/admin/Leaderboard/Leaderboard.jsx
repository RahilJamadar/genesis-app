import React, { useEffect, useState } from 'react';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx'; // 🚀 Required: npm install xlsx

const Leaderboard = () => {
  const [events, setEvents] = useState([]);
  const [overallLeaderboard, setOverallLeaderboard] = useState([]);
  const [eventLeaderboard, setEventLeaderboard] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setInitialLoading(true);
    try {
      const [eventRes, overallRes] = await Promise.all([
        adminApi.get('/events'),
        adminApi.get('/teams/leaderboard/overall')
      ]);
      setEvents(eventRes.data || []);
      setOverallLeaderboard(overallRes.data || []);
    } catch (err) {
      toast.error('❌ Failed to synchronize master leaderboard');
    } finally {
      setInitialLoading(false);
    }
  };

  // 🚀 NEW: COMPREHENSIVE EXPORT LOGIC
  const handleExportReport = async () => {
    if (events.length === 0 || overallLeaderboard.length === 0) {
      toast.warn("No data available to export.");
      return;
    }

    setIsExporting(true);
    toast.info("Generating Final Results Report...");

    try {
      // 1. Prepare Championship Standings (Sheet 1)
      const championshipData = overallLeaderboard.map((team, index) => ({
        "Rank": index + 1,
        "Team Identity": team.teamName || "N/A",
        "College Name": team.college,
        "Team Leader": team.leader || "N/A",
        "Total Trophy Points": team.score
      }));

      // 2. Prepare Detailed Event Winners (Sheet 2)
      // We loop through all events to fetch their individual leaderboards
      const winnersBreakdown = [];

      for (const event of events) {
        try {
          const res = await adminApi.get(`/teams/leaderboard/event/${event._id}`);
          const rankings = res.data || [];
          
          // Get Top 2 (Winner and Runner Up)
          const topTwo = rankings.slice(0, 2);
          
          topTwo.forEach((team, idx) => {
            winnersBreakdown.push({
              "Event Name": event.name,
              "Category": event.category,
              "Position": idx === 0 ? "WINNER (1st)" : "RUNNER UP (2nd)",
              "Team Identity": team.teamName || "N/A",
              "College": team.college,
              "Team Leader": team.leader || "N/A",
              "Points": team.score
            });
          });
          
          // Add an empty row for spacing between events in Excel
          if (topTwo.length > 0) winnersBreakdown.push({}); 
        } catch (e) {
          console.error(`Skipping event ${event.name} - No scores found.`);
        }
      }

      // 3. Create Workbook
      const wb = XLSX.utils.book_new();
      
      const ws1 = XLSX.utils.json_to_sheet(championshipData);
      const ws2 = XLSX.utils.json_to_sheet(winnersBreakdown);

      // Auto-size columns for Sheet 1
      ws1['!cols'] = [{ wch: 8 }, { wch: 30 }, { wch: 40 }, { wch: 25 }, { wch: 20 }];
      // Auto-size columns for Sheet 2
      ws2['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 40 }, { wch: 25 }, { wch: 10 }];

      XLSX.utils.book_append_sheet(wb, ws1, "Championship Standings");
      XLSX.utils.book_append_sheet(wb, ws2, "Event Winners Breakdown");

      // 4. Download File
      XLSX.writeFile(wb, `Genesis_Final_Results_${new Date().toLocaleDateString()}.xlsx`);
      toast.success("✅ Results exported successfully!");
    } catch (err) {
      toast.error("❌ Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleEventChange = async (e) => {
    const eventId = e.target.value;
    setSelectedEvent(eventId);
    if (!eventId) { setEventLeaderboard([]); return; }
    setLoading(true);
    try {
      const res = await adminApi.get(`/teams/leaderboard/event/${eventId}`);
      setEventLeaderboard(res.data || []);
    } catch (err) {
      toast.error('❌ Failed to fetch rankings');
      setEventLeaderboard([]);
    } finally { setLoading(false); }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return { class: 'bg-warning text-dark shadow-gold', label: '1ST', icon: 'bi-trophy-fill' };
    if (rank === 2) return { class: 'bg-light text-dark shadow-silver', label: '2ND', icon: 'bi-award-fill' };
    if (rank === 3) return { class: 'bg-bronze text-white shadow-bronze', label: '3RD', icon: 'bi-award' };
    return { class: 'bg-secondary text-white opacity-50', label: rank + 'TH', icon: '' };
  };

  const renderTable = (list, isOverall = false) => (
    <div className="table-responsive custom-table-container">
      <table className="table table-dark table-hover align-middle border-secondary mb-0">
        <thead>
          <tr className="text-info x-small text-uppercase fw-bold border-secondary ls-1">
            <th style={{ width: '80px' }} className="ps-3 ps-md-4">Rank</th>
            <th className="min-w-150">Team Identity / College</th>
            <th className="text-end pe-3 pe-md-4">{isOverall ? 'Trophy' : 'Event'} Pts</th>
          </tr>
        </thead>
        <tbody className="border-top-0">
          {list.map((team, index) => {
            const rank = index + 1;
            const badge = getRankBadge(rank);
            return (
              <tr key={team.id || index} className="border-secondary animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <td className="ps-3 ps-md-4 py-3">
                  <div className={`rank-badge ${badge.class} d-flex align-items-center justify-content-center gap-1`}>
                    {badge.icon && <i className={`bi ${badge.icon} d-none d-sm-inline`}></i>} 
                    <span className="fw-bold">{badge.label}</span>
                  </div>
                </td>
                <td>
                  <div className="fw-black text-info small text-uppercase ls-1 text-truncate mb-0" style={{maxWidth: '220px'}}>
                    {team.teamName || team.college}
                  </div>
                  <div className="x-small text-light opacity-40 text-truncate" style={{maxWidth: '220px'}}>
                    {team.college}
                  </div>
                </td>
                <td className="text-end pe-3 pe-md-4">
                  <div className="d-flex flex-column align-items-end">
                    <span className="text-warning fw-bold fs-5">{team.score || 0}</span>
                    <small className="text-secondary x-small-text fw-bold">PTS</small>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="d-flex bg-dark min-vh-100 flex-column flex-lg-row">
      <Navbar />
      <main className="dashboard-content flex-grow-1 p-3 p-md-4 p-lg-5">
        <header className="mb-4 mb-lg-5 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="text-center text-sm-start">
            <h2 className="fw-bold text-white mb-1 fs-3 fs-md-2">🏆 Hall of Fame</h2>
            <p className="text-light opacity-75 small">Real-time championship standings & results</p>
          </div>
          <div className="d-flex gap-2 w-100 w-md-auto">
            <button className="btn btn-outline-info btn-sm px-3 py-2 fw-bold flex-grow-1" onClick={fetchInitialData}>
              <i className="bi bi-arrow-clockwise"></i> REFRESH
            </button>
            <button 
                className="btn btn-success btn-sm px-3 py-2 fw-bold flex-grow-1 shadow-sm" 
                onClick={handleExportReport}
                disabled={isExporting || initialLoading}
            >
              {isExporting ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                  <i className="bi bi-file-earmark-spreadsheet me-2"></i>
              )}
              EXPORT RESULTS
            </button>
          </div>
        </header>

        <div className="row g-4">
          <div className="col-12 col-xl-7">
            <div className="card bg-glass border-secondary shadow-lg h-100 border-opacity-10">
              <div className="card-body p-3 p-md-4">
                <h4 className="text-info fw-bold mb-4 d-flex align-items-center gap-2 fs-5">
                  <i className="bi bi-globe2"></i> Master Standing
                </h4>
                {initialLoading ? (
                  <div className="text-center py-5"><div className="spinner-grow text-info spinner-grow-sm"></div></div>
                ) : overallLeaderboard.length > 0 ? (
                  renderTable(overallLeaderboard, true)
                ) : (
                  <div className="text-center py-5 border border-secondary border-dashed rounded m-2">
                    <p className="text-light opacity-50 mb-0 small italic">Waiting for event scores...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-5">
            <div className="card bg-glass border-secondary shadow-lg border-opacity-10 mb-4">
              <div className="card-body p-3 p-md-4">
                <h4 className="text-info fw-bold mb-4 d-flex align-items-center gap-2 fs-5">
                  <i className="bi bi-funnel-fill"></i> Event Result
                </h4>
                <div className="bg-black bg-opacity-25 p-3 rounded border border-secondary border-opacity-20 mb-4">
                    <label className="x-small fw-bold text-uppercase text-info mb-2 d-block tracking-widest">Tournament Category</label>
                    <select className="form-select bg-dark text-white border-secondary shadow-none py-2 fs-7" value={selectedEvent} onChange={handleEventChange}>
                      <option value="">-- Select Event --</option>
                      {events.map(e => (
                        <option key={e._id} value={e._id}>{e.name}</option>
                      ))}
                    </select>
                </div>
                {loading ? (
                  <div className="text-center py-5"><div className="spinner-border text-info spinner-border-sm"></div></div>
                ) : selectedEvent ? (
                  eventLeaderboard.length > 0 ? renderTable(eventLeaderboard, false) : (
                    <div className="text-center py-5 text-warning opacity-75 small">Scores pending finalization.</div>
                  )
                ) : (
                  <div className="text-center py-5 text-light opacity-25 small">Pick an event to see rankings.</div>
                )}
              </div>
            </div>

            <div className="card bg-glass border-secondary shadow-lg border-opacity-10">
                <div className="card-body p-3 p-md-4">
                    <h6 className="text-white fw-bold x-small text-uppercase ls-1 mb-3">Ranking Logic</h6>
                    <ul className="list-unstyled mb-0">
                        <li className="d-flex align-items-center gap-2 x-small text-light opacity-50 mb-2">
                            <i className="bi bi-check-circle-fill text-info"></i> 1st: 100 Trophy Pts | 2nd: 50 Trophy Pts
                        </li>
                        <li className="d-flex align-items-center gap-2 x-small text-light opacity-50">
                            <i className="bi bi-check-circle-fill text-info"></i> Partic: 10 Trophy Pts
                        </li>
                    </ul>
                </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @media (min-width: 992px) { .dashboard-content { margin-left: 280px; } }
        @media (max-width: 991.98px) { .dashboard-content { margin-left: 0; padding-top: 10px; } }
        .bg-glass { background: rgba(255, 255, 255, 0.03) !important; backdrop-filter: blur(20px); border-radius: 24px; }
        .bg-bronze { background-color: #cd7f32; }
        .ls-1 { letter-spacing: 1px; }
        .x-small { font-size: 0.7rem; }
        .x-small-text { font-size: 0.6rem; }
        .min-w-150 { min-width: 150px; }
        .fw-black { font-weight: 900; }
        .rank-badge { width: 54px; height: 28px; border-radius: 8px; font-size: 0.65rem; }
        .shadow-gold { box-shadow: 0 4px 10px rgba(255, 193, 7, 0.2); }
        .animate-fade-in { opacity: 0; transform: translateY(10px); animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default Leaderboard;