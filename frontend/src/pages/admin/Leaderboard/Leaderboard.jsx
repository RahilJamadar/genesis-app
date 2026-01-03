import React, { useEffect, useState, useCallback } from 'react';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const Leaderboard = () => {
  const [events, setEvents] = useState([]);
  const [overallLeaderboard, setOverallLeaderboard] = useState([]);
  const [eventLeaderboard, setEventLeaderboard] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

 const fetchInitialData = useCallback(async () => {
    setInitialLoading(true);
    try {
      // 1. Fetch Events and Teams
      const [eventRes, teamRes] = await Promise.all([
        adminApi.get('/events'),
        adminApi.get('/teams') // Fetch all teams to filter them on frontend
      ]);

      const allEvents = eventRes.data || [];
      const allTeams = teamRes.data || [];

      // 2. Identify "Non-Open" (Trophy) Event IDs
      const trophyEventIds = allEvents
        .filter(e => e.isOpenEvent === false || e.isTrophyEvent === true)
        .map(e => e._id.toString());

      const requiredCount = trophyEventIds.length;

      // 3. Filter for teams that have registered for ALL of them
      const qualifiedTeams = allTeams
        .filter(team => {
          if (!team.registeredEvents) return false;
          
          const teamRegIds = team.registeredEvents.map(reg => 
            typeof reg === 'object' ? reg._id.toString() : reg.toString()
          );

          // Check if every trophyEventId exists in the team's registration list
          const matchCount = trophyEventIds.filter(id => teamRegIds.includes(id)).length;
          return matchCount >= requiredCount && requiredCount > 0;
        })
        .map(team => {
          // Robust calculation of live score from finalPoints Map/Object
          let liveScore = 0;
          if (team.finalPoints) {
            const values = team.finalPoints instanceof Map 
              ? Array.from(team.finalPoints.values()) 
              : Object.values(team.finalPoints);
            liveScore = values.reduce((sum, val) => sum + (Number(val) || 0), 0);
          }
          return { ...team, score: liveScore };
        })
        .sort((a, b) => b.score - a.score);

      setEvents(allEvents);
      setOverallLeaderboard(qualifiedTeams);
    } catch (err) {
      toast.error('❌ Failed to synchronize master leaderboard');
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // 🚀 FIXED: Added /admin to the path to match your backend routes
  const handleEventChange = async (e) => {
    const eventId = e.target.value;
    setSelectedEvent(eventId);
    if (!eventId) { setEventLeaderboard([]); return; }
    
    setLoading(true);
    try {
      // Path corrected from /teams/... to /admin/teams/...
      const res = await adminApi.get(`/teams/leaderboard/event/${eventId}`);
      setEventLeaderboard(res.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error('❌ Failed to fetch event rankings');
      setEventLeaderboard([]);
    } finally { 
      setLoading(false); 
    }
  };

 const handleExportReport = async () => {
    // 1. Safety Check: Ensure we have event definitions and qualified teams
    if (!events || events.length === 0) {
        toast.error("Event definitions not found. Please refresh.");
        return;
    }

    if (overallLeaderboard.length === 0) {
        toast.warn("Championship standings are empty. Cannot generate report.");
        return;
    }

    setIsExporting(true);
    const toastId = toast.loading("Fetching all event results... This may take a moment.");

    try {
        // --- SHEET 1: CHAMPIONSHIP MASTER STANDINGS ---
        const championshipData = overallLeaderboard.map((team, index) => ({
            "RANK": index + 1,
            "TEAM NAME": team.teamName || "N/A",
            "INSTITUTION / COLLEGE": team.college,
            "LEADER": team.leader || "N/A",
            "TOTAL TROPHY POINTS": team.score,
            "STATUS": "QUALIFIED"
        }));

        // --- SHEET 2: EVENT-WISE WINNERS BREAKDOWN ---
        const winnersBreakdown = [];

        // 2. Iterate through events and fetch results for each
        for (const event of events) {
            try {
                // Fetch the specific leaderboard for this event
                const res = await adminApi.get(`/teams/leaderboard/event/${event._id}`);
                const rankings = res.data || [];

                // Skip events that have no scores at all to keep the list clean
                if (rankings.length === 0) {
                    console.warn(`No scores found for: ${event.name}`);
                    continue;
                }

                const isPowerPair = event.name.toLowerCase().includes("power pair");
                const isDirectWin = event.isDirectWin === true;

                if (isPowerPair) {
                    // Logic for Genesis Power Pair (Individual Gender Winners)
                    const maleWinner = [...rankings].sort((a, b) => (b.mTotal || 0) - (a.mTotal || 0))[0];
                    const femaleWinner = [...rankings].sort((a, b) => (b.fTotal || 0) - (a.fTotal || 0))[0];

                    if (maleWinner) {
                        winnersBreakdown.push({
                            "EVENT CATEGORY": event.category.toUpperCase(),
                            "EVENT NAME": event.name,
                            "POSITION": "MR. GENESIS (Male Winner)",
                            "WINNER NAME": maleWinner.leader || maleWinner.mName || "N/A",
                            "TEAM IDENTITY": maleWinner.teamName || "N/A",
                            "COLLEGE NAME": maleWinner.college,
                            "FINAL SCORE": maleWinner.mTotal || 0
                        });
                    }

                    if (femaleWinner) {
                        winnersBreakdown.push({
                            "EVENT CATEGORY": event.category.toUpperCase(),
                            "EVENT NAME": event.name,
                            "POSITION": "MRS. GENESIS (Female Winner)",
                            "WINNER NAME": femaleWinner.leader || femaleWinner.fName || "N/A",
                            "TEAM IDENTITY": femaleWinner.teamName || "N/A",
                            "COLLEGE NAME": femaleWinner.college,
                            "FINAL SCORE": femaleWinner.fTotal || 0
                        });
                    }

                } else if (isDirectWin) {
                    // Logic for Direct Win (1st Place Only)
                    winnersBreakdown.push({
                        "EVENT CATEGORY": event.category.toUpperCase(),
                        "EVENT NAME": event.name,
                        "POSITION": "WINNER (1ST PLACE)",
                        "WINNER NAME": rankings[0].leader || "N/A",
                        "TEAM IDENTITY": rankings[0].teamName || "N/A",
                        "COLLEGE NAME": rankings[0].college,
                        "FINAL SCORE": "Direct Victory"
                    });

                } else {
                    // Logic for Standard Evaluation (1st and 2nd Place)
                    const limit = rankings.length >= 2 ? 2 : rankings.length;
                    for (let i = 0; i < limit; i++) {
                        winnersBreakdown.push({
                            "EVENT CATEGORY": event.category.toUpperCase(),
                            "EVENT NAME": event.name,
                            "POSITION": i === 0 ? "WINNER (1ST PLACE)" : "RUNNER UP (2ND PLACE)",
                            "WINNER NAME": rankings[i].leader || "N/A",
                            "TEAM IDENTITY": rankings[i].teamName || "N/A",
                            "COLLEGE NAME": rankings[i].college,
                            "FINAL SCORE": rankings[i].score || 0
                        });
                    }
                }

                // Add a grouping spacer row
                winnersBreakdown.push({});

            } catch (err) {
                console.error(`Failed to fetch results for ${event.name}:`, err);
                // We don't stop the whole loop if one event fails
            }
        }

        // 3. Final Verification: Is the list still empty?
        if (winnersBreakdown.length === 0) {
            toast.update(toastId, { render: "⚠️ No event results have been finalized by judges yet.", type: "warning", isLoading: false, autoClose: 4000 });
            setIsExporting(false);
            return;
        }

        // 4. Generate Excel Workbook
        const wb = XLSX.utils.book_new();
        const ws1 = XLSX.utils.json_to_sheet(championshipData);
        const ws2 = XLSX.utils.json_to_sheet(winnersBreakdown);

        // Column Width Formatting
        ws1['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];
        ws2['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 40 }, { wch: 15 }];

        XLSX.utils.book_append_sheet(wb, ws1, "MASTER STANDINGS");
        XLSX.utils.book_append_sheet(wb, ws2, "EVENT WINNERS LIST");

        const fileName = `Genesis_8_Final_Results_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);

        toast.update(toastId, { render: "✅ Official Results Exported!", type: "success", isLoading: false, autoClose: 3000 });

    } catch (globalErr) {
        console.error("Critical Export Error:", globalErr);
        toast.update(toastId, { render: "❌ Critical error during export.", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
        setIsExporting(false);
    }
};

  const getRankBadge = (rank) => {
    if (rank === 1) return { class: 'bg-warning text-dark shadow-gold', label: '1ST' };
    if (rank === 2) return { class: 'bg-light text-dark shadow-silver', label: '2ND' };
    if (rank === 3) return { class: 'bg-bronze text-white shadow-bronze', label: '3RD' };
    return { class: 'bg-secondary text-white opacity-50', label: rank + 'TH' };
  };

  const renderTable = (list, isOverall = false) => {
    const currentEvent = events.find(e => e._id === selectedEvent);
    const isPowerPair = !isOverall && currentEvent?.name?.toLowerCase().includes("power pair");

    return (
      <div className="table-responsive custom-table-container">
        <table className="table table-dark table-hover align-middle border-secondary mb-0">
          <thead>
            <tr className="text-info x-small text-uppercase fw-bold border-secondary ls-1">
              <th style={{ width: '80px' }} className="ps-3 ps-md-4">Rank</th>
              <th className="min-w-150">Team Identity / College</th>
              {isPowerPair && <th className="text-center">M / F Split</th>}
              <th className="text-end pe-3 pe-md-4">{isOverall ? 'Trophy' : 'Event'} Pts</th>
            </tr>
          </thead>
          <tbody className="border-top-0">
            {list.map((team, index) => {
              const badge = getRankBadge(index + 1);
              return (
                <tr key={team.id || team._id || index} className="border-secondary animate-fade-in">
                  <td className="ps-3 ps-md-4 py-3">
                    <div className={`rank-badge ${badge.class} d-flex align-items-center justify-content-center fw-bold`}>
                      {badge.label}
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
                  {/* 🚀 GENDER SPLIT UI */}
                  {isPowerPair && (
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-10 x-small-text">
                          M: {team.mTotal || 0}
                        </span>
                        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-10 x-small-text">
                          F: {team.fTotal || 0}
                        </span>
                      </div>
                    </td>
                  )}
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
  };

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
              REFRESH
            </button>
            <button className="btn btn-success btn-sm px-3 py-2 fw-bold flex-grow-1 shadow-sm" onClick={handleExportReport} disabled={isExporting || initialLoading}>
              {isExporting ? 'SYNCING...' : 'EXPORT RESULTS'}
            </button>
          </div>
        </header>

        <div className="row g-4">
          <div className="col-12 col-xl-7">
            <div className="card bg-glass border-secondary shadow-lg h-100 border-opacity-10">
              <div className="card-body p-3 p-md-4">
                <h4 className="text-info fw-bold mb-4 fs-5">Master Standing</h4>
                {initialLoading ? (
                  <div className="text-center py-5"><div className="spinner-grow text-info spinner-grow-sm"></div></div>
                ) : (
                  renderTable(overallLeaderboard, true)
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-5">
            <div className="card bg-glass border-secondary shadow-lg border-opacity-10 mb-4">
              <div className="card-body p-3 p-md-4">
                <h4 className="text-info fw-bold mb-4 fs-5">Event Result</h4>
                <div className="bg-black bg-opacity-25 p-3 rounded border border-secondary border-opacity-20 mb-4">
                    <label className="x-small fw-bold text-uppercase text-info mb-2 d-block tracking-widest">Select Category</label>
                    <select className="form-select bg-dark text-white border-secondary" value={selectedEvent} onChange={handleEventChange}>
                      <option value="">-- Choose Event --</option>
                      {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                    </select>
                </div>
                {loading ? (
                  <div className="text-center py-5"><div className="spinner-border text-info spinner-border-sm"></div></div>
                ) : selectedEvent ? (
                  renderTable(eventLeaderboard, false)
                ) : (
                  <div className="text-center py-5 text-light opacity-25 small">Select an institution to view category splits.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @media (min-width: 992px) { .dashboard-content { margin-left: 280px; } }
        .bg-glass { background: rgba(255, 255, 255, 0.03) !important; backdrop-filter: blur(20px); border-radius: 24px; }
        .bg-bronze { background-color: #cd7f32; }
        .rank-badge { width: 54px; height: 28px; border-radius: 8px; font-size: 0.65rem; }
        .x-small-text { font-size: 0.65rem; }
        .animate-fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default Leaderboard;