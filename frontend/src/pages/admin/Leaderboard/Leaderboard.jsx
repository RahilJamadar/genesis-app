import React, { useEffect, useState } from 'react';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';

const Leaderboard = () => {
  const [events, setEvents] = useState([]);
  const [overallLeaderboard, setOverallLeaderboard] = useState([]);
  const [eventLeaderboard, setEventLeaderboard] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setInitialLoading(true);
    try {
      /**
       * 🔄 SYNC: 
       * 1. Fetch all events for the filter dropdown
       * 2. Fetch the Overall Master standings (sorted by totalTrophyPoints)
       */
      const [eventRes, overallRes] = await Promise.all([
        adminApi.get('/events'),
        adminApi.get('/teams/leaderboard/overall')
      ]);
      setEvents(eventRes.data || []);
      setOverallLeaderboard(overallRes.data || []);
    } catch (err) {
      console.error("Leaderboard Sync Error:", err);
      toast.error('❌ Failed to synchronize master leaderboard');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleEventChange = async (e) => {
    const eventId = e.target.value;
    setSelectedEvent(eventId);
    
    if (!eventId) {
      setEventLeaderboard([]);
      return;
    }

    setLoading(true);
    try {
      /**
       * 🎯 TARGET:
       * Fetch normalized rankings for the specific event.
       * Logic: backend looks inside the Team.finalPoints Map for this eventId.
       */
      const res = await adminApi.get(`/teams/leaderboard/event/${eventId}`);
      setEventLeaderboard(res.data || []);
    } catch (err) {
      toast.error('❌ Failed to fetch event-specific rankings');
      setEventLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return { class: 'bg-warning text-dark shadow-gold', label: '1ST', icon: 'bi-trophy-fill' };
    if (rank === 2) return { class: 'bg-light text-dark shadow-silver', label: '2ND', icon: 'bi-award-fill' };
    if (rank === 3) return { class: 'bg-bronze text-white shadow-bronze', label: '3RD', icon: 'bi-award' };
    return { class: 'bg-secondary text-white opacity-50', label: rank + 'TH', icon: '' };
  };

  const renderTable = (list, isOverall = false) => (
    <div className="table-responsive">
      <table className="table table-dark table-hover align-middle border-secondary mb-0">
        <thead>
          <tr className="text-info small text-uppercase fw-bold border-secondary ls-1">
            <th style={{ width: '100px' }} className="ps-4">Rank</th>
            <th>College / Team</th>
            <th className="text-end pe-4">{isOverall ? 'Trophy Points' : 'Event Points'}</th>
          </tr>
        </thead>
        <tbody>
          {list.map((team, index) => {
            const rank = index + 1;
            const badge = getRankBadge(rank);
            return (
              <tr key={team.id || index} className="border-secondary animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <td className="ps-4 py-3">
                  <div className={`rank-badge ${badge.class} d-flex align-items-center justify-content-center gap-1`}>
                    {badge.icon && <i className={`bi ${badge.icon}`}></i>} 
                    <span className="fw-bold">{badge.label}</span>
                  </div>
                </td>
                <td>
                  <div className="fw-bold text-white fs-5 text-uppercase ls-1">{team.college}</div>
                  <div className="small text-light opacity-50 fst-italic">Leader: {team.leader}</div>
                </td>
                <td className="text-end pe-4">
                  <div className="d-flex flex-column align-items-end">
                    <span className="text-warning fw-bold fs-4">{team.score || 0}</span>
                    <small className="text-secondary x-small text-uppercase fw-bold">pts</small>
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
    <div className="d-flex bg-dark min-vh-100">
      <Navbar />

      <main className="dashboard-content flex-grow-1 p-4 p-lg-5">
        <ToastContainer theme="dark" position="top-right" autoClose={2000} />

        <header className="mb-5 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 className="fw-bold text-white mb-1">🏆 Hall of Fame</h2>
            <p className="text-light opacity-75">Real-time normalization and championship standings</p>
          </div>
          <button className="btn btn-outline-info btn-sm px-3" onClick={fetchInitialData}>
            <i className="bi bi-arrow-clockwise me-2"></i> Refresh Live
          </button>
        </header>

        <div className="row g-4">
          {/* Master Standings - Overall Championship */}
          <div className="col-xl-7">
            <div className="card bg-glass border-secondary shadow-lg h-100">
              <div className="card-body p-4">
                <h4 className="text-info fw-bold mb-4 d-flex align-items-center gap-2">
                  <i className="bi bi-globe2 text-info"></i> Master Standing (Overall)
                </h4>
                {initialLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-grow text-info" role="status"></div>
                  </div>
                ) : overallLeaderboard.length > 0 ? (
                  renderTable(overallLeaderboard, true)
                ) : (
                  <div className="text-center py-5 border border-secondary border-dashed rounded m-3">
                    <p className="text-light opacity-50 mb-0 italic">Master standings will appear once event scores are normalized.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Event Filter & Ranking */}
          <div className="col-xl-5">
            <div className="card bg-glass border-secondary shadow-lg">
              <div className="card-body p-4">
                <h4 className="text-info fw-bold mb-4 d-flex align-items-center gap-2">
                  <i className="bi bi-funnel-fill text-info"></i> Event-Specific Result
                </h4>
                
                <div className="bg-dark p-3 rounded border border-secondary mb-4">
                    <label className="x-small fw-bold text-uppercase text-info mb-2 d-block">Select Tournament Event</label>
                    <select
                      className="form-select bg-dark text-white border-secondary shadow-none py-2"
                      value={selectedEvent}
                      onChange={handleEventChange}
                    >
                      <option value="">-- Choose Category --</option>
                      {events.map(e => (
                        <option key={e._id} value={e._id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-info" role="status"></div>
                  </div>
                ) : selectedEvent ? (
                  eventLeaderboard.length > 0 ? (
                    renderTable(eventLeaderboard, false)
                  ) : (
                    <div className="text-center py-5 text-warning opacity-75">
                      <i className="bi bi-exclamation-triangle fs-2 d-block mb-2"></i>
                      Scores for this event are still pending judge finalization.
                    </div>
                  )
                ) : (
                  <div className="text-center py-5 text-light opacity-25">
                    <i className="bi bi-search fs-1 d-block mb-3"></i>
                    Select an event above to view individual standings.
                  </div>
                )}
              </div>
            </div>

            <div className="card bg-glass border-secondary shadow-lg mt-4">
                <div className="card-body p-4">
                    <h6 className="text-white fw-bold x-small text-uppercase ls-1 mb-3">Ranking Logic</h6>
                    <ul className="list-unstyled mb-0">
                        <li className="d-flex gap-2 x-small text-light opacity-50 mb-2">
                            <i className="bi bi-check-circle text-info"></i> 1st Place: 100 Trophy Pts
                        </li>
                        <li className="d-flex gap-2 x-small text-light opacity-50 mb-2">
                            <i className="bi bi-check-circle text-info"></i> 2nd Place: 50 Trophy Pts
                        </li>
                        <li className="d-flex gap-2 x-small text-light opacity-50">
                            <i className="bi bi-check-circle text-info"></i> Participation: 10 Trophy Pts
                        </li>
                    </ul>
                </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .dashboard-content { margin-left: 260px; transition: margin 0.3s ease; }
        .bg-glass { background: rgba(255, 255, 255, 0.03) !important; backdrop-filter: blur(12px); border-radius: 20px; }
        .bg-bronze { background-color: #cd7f32; }
        .border-dashed { border-style: dashed !important; }
        .ls-1 { letter-spacing: 1px; }
        .x-small { font-size: 0.65rem; }
        
        .rank-badge {
            width: 60px;
            height: 32px;
            border-radius: 8px;
            font-size: 0.75rem;
        }

        .shadow-gold { box-shadow: 0 0 10px rgba(255, 193, 7, 0.3); }
        .shadow-silver { box-shadow: 0 0 10px rgba(248, 249, 250, 0.2); }
        .shadow-bronze { box-shadow: 0 0 10px rgba(205, 127, 50, 0.3); }

        .animate-fade-in {
            opacity: 0;
            transform: translateY(10px);
            animation: fadeIn 0.4s ease forwards;
        }

        @keyframes fadeIn {
            to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 991.98px) { .dashboard-content { margin-left: 0; padding-top: 80px; } }
      `}</style>
    </div>
  );
};

export default Leaderboard;