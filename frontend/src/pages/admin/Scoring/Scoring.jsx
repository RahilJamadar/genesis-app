import React, { useEffect, useState, useCallback } from 'react';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const Scoring = () => {
  const [teams, setTeams] = useState([]);
  const [events, setEvents] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

  // Selection States
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedRound, setSelectedRound] = useState('');
  const [availableRounds, setAvailableRounds] = useState([]);

  // 1. Initial Load: Fetch Team and Event metadata
  useEffect(() => {
    let isMounted = true;
    const fetchInitial = async () => {
      try {
        const [teamRes, eventRes] = await Promise.all([
          adminApi.get('/teams'),
          adminApi.get('/events')
        ]);
        if (isMounted) {
          setTeams(teamRes.data || []);
          setEvents(eventRes.data || []);
        }
      } catch (err) {
        toast.error('❌ Failed to load system filters');
      }
    };
    fetchInitial();
    return () => { isMounted = false; };
  }, []);

  // 2. Dynamic Rounds: Populate based on the selected event
  useEffect(() => {
    if (selectedEventId) {
      const eventObj = events.find(e => e._id === selectedEventId);
      if (eventObj) {
        const roundsCount = eventObj.rounds || 1;
        const roundsArray = Array.from({ length: roundsCount }, (_, i) => `Round ${i + 1}`);
        setAvailableRounds(roundsArray);

        if (!selectedRound || !roundsArray.includes(selectedRound)) {
          setSelectedRound('Round 1');
        }
      }
    } else {
      setAvailableRounds([]);
      setSelectedRound('');
    }
  }, [selectedEventId, events, selectedRound]);

  // 3. Fetch Data Logic
  const fetchAuditData = useCallback(async () => {
    if (!selectedEventId || !selectedRound) {
      toast.warn('⚠️ Please select both an Event and a Round');
      return;
    }

    setLoading(true);
    setDataFetched(true);
    try {
      let path = `/scoring/admin/event/${selectedEventId}/scores`;
      if (selectedTeamId) {
        path += `/${selectedTeamId}`;
      }

      const res = await adminApi.get(`${path}?round=${encodeURIComponent(selectedRound)}`);
      setScores(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error('❌ Score retrieval failed.');
      setScores([]);
    } finally {
      setLoading(false);
    }
  }, [selectedEventId, selectedRound, selectedTeamId]);

  // 🚀 NEW: Export to Excel Function
  const exportScores = () => {
    if (scores.length === 0) {
      toast.info("No scores available to export. Fetch data first.");
      return;
    }

    const eventName = events.find(e => e._id === selectedEventId)?.name || "Event";

    // Prepare Data for Excel
    const excelData = scores.map(s => {
      const criteriaData = {};
      // Map individual criteria if they exist
      if (s.criteriaScores) {
        s.criteriaScores.forEach((val, idx) => {
          criteriaData[`Criteria ${idx + 1}`] = val;
        });
      }

      return {
        "College/Institution": s.team?.college || 'N/A',
        "Team Identity": s.team?.teamName || 'N/A',
        "Participant": s.participant || 'Full Team',
        "Round": s.round || selectedRound,
        "Judge": s.judge?.name || 'Manual/Direct',
        ...criteriaData,
        "Total Points": s.totalPoints || s.points,
        "Verification Status": s.finalized ? "VERIFIED" : "PENDING"
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Scores");

    // Column width adjustment
    const wscols = [
      { wch: 30 }, { wch: 20 }, { wch: 25 }, { wch: 10 }, { wch: 20 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 20 }
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, `Genesis_Audit_${eventName}_${selectedRound}.xlsx`);
    toast.success("🚀 Audit Report Downloaded");
  };

  const handleFinalize = async (scoreId) => {
    if (!window.confirm("Verify points? This will lock the score and update the Master Leaderboard.")) return;
    try {
      await adminApi.patch(`/scoring/finalize/${scoreId}`);
      toast.success('✅ Points Verified & Standings Updated');
      fetchAuditData();
    } catch (err) {
      toast.error('❌ Finalization failed');
    }
  };

  const filteredTeams = teams.filter(t => {
    if (!selectedEventId) return true;
    return t.registeredEvents?.some(re => {
      const id = typeof re === 'object' ? re._id : re;
      return id === selectedEventId;
    });
  });

  return (
    <div className="d-flex bg-dark min-vh-100 flex-column flex-lg-row">
      <Navbar />

      <main className="dashboard-content flex-grow-1 p-3 p-md-4 p-lg-5">

        <header className="mb-4 mb-lg-5 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="text-white text-center text-md-start">
            <h2 className="fw-bold mb-1 fs-3 fs-md-2">Scoring Audit</h2>
            <p className="opacity-75 small">Review judge point breakdowns and finalize event standings</p>
          </div>
          <button
            className="btn btn-success fw-bold px-4 py-2 shadow-sm"
            onClick={exportScores}
            disabled={scores.length === 0}
          >
            <i className="bi bi-file-earmark-spreadsheet me-2"></i> EXPORT REPORT
          </button>
        </header>

        {/* Filter Section */}
        <div className="card bg-glass border-secondary shadow-lg mb-4 mb-lg-5 border-opacity-10">
          <div className="card-body p-3 p-md-4">
            <div className="row g-3">
              <div className="col-12 col-md-6 col-lg-3">
                <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Target Event</label>
                <select className="form-select bg-dark text-white border-secondary shadow-none py-2"
                  value={selectedEventId} onChange={e => {
                    setSelectedEventId(e.target.value);
                    setSelectedTeamId('');
                  }}>
                  <option value="">-- Choose Event --</option>
                  {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                </select>
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Competition Round</label>
                <select className="form-select bg-dark text-white border-secondary shadow-none py-2"
                  value={selectedRound} onChange={e => setSelectedRound(e.target.value)}
                  disabled={!selectedEventId}>
                  {availableRounds.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Institution Filter</label>
                <select className="form-select bg-dark text-white border-secondary shadow-none py-2"
                  value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)}>
                  <option value="">All Participating Colleges</option>
                  {filteredTeams.map(t => <option key={t._id} value={t._id}>{t.college}</option>)}
                </select>
              </div>

              <div className="col-12 col-md-6 col-lg-3 d-flex align-items-end">
                <button className="btn btn-info w-100 fw-bold py-2 shadow-glow text-black" onClick={fetchAuditData} disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-search me-2"></i>}
                  FETCH SCORES
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="card bg-glass border-secondary shadow-lg overflow-hidden border-opacity-10">
          <div className="card-body p-0">
            {!dataFetched ? (
              <div className="text-center py-5 opacity-50 text-white">
                <i className="bi bi-funnel fs-1 d-block mb-2 text-secondary"></i>
                <p className="small">Select parameters and click Fetch to display submissions.</p>
              </div>
            ) : loading ? (
              <div className="text-center py-5 text-info">
                <div className="spinner-border mb-3" role="status"></div>
                <p className="x-small fw-bold text-uppercase ls-1">Accessing Score Registry...</p>
              </div>
            ) : scores.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0">
                  <thead className="bg-white bg-opacity-5 border-bottom border-secondary">
                    <tr className="text-info x-small text-uppercase fw-bold ls-1">
                      <th className="ps-4 py-3 min-w-200">Institution / Identity</th>
                      <th className="py-3 min-w-200">Points Breakdown</th>
                      <th className="py-3 min-w-150">Assigned Judge</th>
                      <th className="py-3">Total Points</th>
                      <th className="pe-4 py-3 text-center">Status / Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scores.map(s => {
                      // 1. Identify if this is a Direct Win record
                      const isDirect = !!s.directWinners;

                      // 2. Resolve the displayed team
                      // For Direct wins, we find the team object matching the firstPlace ID
                      const winnerTeam = isDirect
                        ? teams.find(t => t._id === (s.directWinners?.firstPlace?._id || s.directWinners?.firstPlace))
                        : s.team;

                      return (
                        <tr key={s._id} className="border-bottom border-secondary border-opacity-10 transition-all">
                          <td className="ps-4 py-3">
                            <div className="fw-bold text-white small">
                              {winnerTeam?.college || 'N/A'}
                            </div>
                            <div className="x-small text-info opacity-75 text-truncate" style={{ maxWidth: '180px' }}>
                              {winnerTeam?.teamName || (isDirect ? 'WINNER SELECTION' : 'Full Team')}
                            </div>
                          </td>
                          <td className="py-3">
                            {isDirect ? (
                              <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 py-2 px-3 x-small-badge">
                                🏆 DIRECT WINNER ASSIGNED
                              </span>
                            ) : (
                              <div className="d-flex flex-wrap gap-1">
                                {s.criteriaScores?.map((val, idx) => (
                                  <span key={idx} className="badge bg-black bg-opacity-40 border border-secondary border-opacity-30 text-light x-small-badge fw-normal">
                                    <span className="text-info opacity-75">C{idx + 1}:</span> {val}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-3 text-white x-small">
                            <i className="bi bi-person-check me-2 text-warning"></i>
                            {s.judge?.name || 'Manual/Head'}
                          </td>
                          <td className="py-3">
                            {/* For direct wins, the points are usually 100 */}
                            <span className="fs-5 fw-bold text-warning">{isDirect ? '100' : (s.totalPoints || s.points || 0)}</span>
                            <small className="text-secondary ms-1 x-small">pts</small>
                          </td>
                          <td className="pe-4 py-3 text-center">
                            {s.finalized ? (
                              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 x-small-badge">
                                <i className="bi bi-patch-check-fill me-1"></i> VERIFIED
                              </span>
                            ) : (
                              <button className="btn btn-outline-success btn-sm px-3 x-small-badge fw-bold" onClick={() => handleFinalize(s._id)}>
                                Finalize
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-clipboard-x fs-1 text-danger opacity-50 mb-3 d-block"></i>
                <h5 className="text-white fs-6">Standings Not Recorded</h5>
                <p className="text-light opacity-50 x-small">No score submissions found for this selection.</p>
              </div>
            )}
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

        .min-w-200 { min-width: 200px; }
        .min-w-150 { min-width: 150px; }
        
        .transition-all { transition: all 0.2s ease; }
        .x-small { font-size: 0.7rem; }
        .x-small-badge { font-size: 0.65rem; padding: 0.4em 0.8em; }
        .ls-1 { letter-spacing: 1px; }
        .shadow-glow { box-shadow: 0 0 15px rgba(13, 202, 240, 0.1); }
        
        .table-responsive {
          scrollbar-width: thin;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </div>
  );
};

export default Scoring;