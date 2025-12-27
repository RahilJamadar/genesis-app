import React, { useEffect, useState } from 'react';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { toast } from 'react-toastify';
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
    <div className="table-responsive custom-table-container">
      <table className="table table-dark table-hover align-middle border-secondary mb-0">
        <thead>
          <tr className="text-info x-small text-uppercase fw-bold border-secondary ls-1">
            <th style={{ width: '80px' }} className="ps-3 ps-md-4">Rank</th>
            <th className="min-w-150">College / Team</th>
            <th className="text-end pe-3 pe-md-4">{isOverall ? 'Trophy' : 'Event'} Pts</th>
          </tr>
        </thead>
        <tbody className="border-top-0">
          {list.map((team, index) => {
            const rank = index + 1;
            const badge = getRankBadge(rank);
            return (
              <tr key={team.id || index} className="border-secondary animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <td className="ps-3 ps-md-4 py-3">
                  <div className={`rank-badge ${badge.class} d-flex align-items-center justify-content-center gap-1`}>
                    {badge.icon && <i className={`bi ${badge.icon} d-none d-sm-inline`}></i>} 
                    <span className="fw-bold">{badge.label}</span>
                  </div>
                </td>
                <td>
                  <div className="fw-bold text-white small text-uppercase ls-1 text-truncate" style={{maxWidth: '180px'}}>{team.college}</div>
                  <div className="x-small text-light opacity-50 fst-italic text-truncate" style={{maxWidth: '180px'}}>Ldr: {team.leader}</div>
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
          <div className="text-center text-md-start">
            <h2 className="fw-bold text-white mb-1 fs-3 fs-md-2">🏆 Hall of Fame</h2>
            <p className="text-light opacity-75 small">Real-time normalization and championship standings</p>
          </div>
          <button className="btn btn-outline-info btn-sm px-4 py-2 w-100 w-md-auto fw-bold" onClick={fetchInitialData}>
            <i className="bi bi-arrow-clockwise me-2"></i> REFRESH LIVE
          </button>
        </header>

        <div className="row g-4">
          {/* Master Standings - Overall Championship */}
          <div className="col-12 col-xl-7">
            <div className="card bg-glass border-secondary shadow-lg h-100 border-opacity-10">
              <div className="card-body p-3 p-md-4">
                <h4 className="text-info fw-bold mb-4 d-flex align-items-center gap-2 fs-5">
                  <i className="bi bi-globe2"></i> Master Standing
                </h4>
                {initialLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-grow text-info spinner-grow-sm" role="status"></div>
                  </div>
                ) : overallLeaderboard.length > 0 ? (
                  renderTable(overallLeaderboard, true)
                ) : (
                  <div className="text-center py-5 border border-secondary border-dashed rounded m-2">
                    <p className="text-light opacity-50 mb-0 small italic">Waiting for event normalization...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Event Filter & Ranking */}
          <div className="col-12 col-xl-5">
            <div className="card bg-glass border-secondary shadow-lg border-opacity-10 mb-4">
              <div className="card-body p-3 p-md-4">
                <h4 className="text-info fw-bold mb-4 d-flex align-items-center gap-2 fs-5">
                  <i className="bi bi-funnel-fill"></i> Event Result
                </h4>
                
                <div className="bg-black bg-opacity-25 p-3 rounded border border-secondary border-opacity-20 mb-4">
                    <label className="x-small fw-bold text-uppercase text-info mb-2 d-block tracking-widest">Tournament Category</label>
                    <select
                      className="form-select bg-dark text-white border-secondary shadow-none py-2 fs-7"
                      value={selectedEvent}
                      onChange={handleEventChange}
                    >
                      <option value="">-- Select Event --</option>
                      {events.map(e => (
                        <option key={e._id} value={e._id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-info spinner-border-sm" role="status"></div>
                  </div>
                ) : selectedEvent ? (
                  eventLeaderboard.length > 0 ? (
                    renderTable(eventLeaderboard, false)
                  ) : (
                    <div className="text-center py-5 text-warning opacity-75">
                      <i className="bi bi-exclamation-triangle fs-3 d-block mb-2"></i>
                      <p className="small mb-0">Scores pending finalization.</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-5 text-light opacity-25">
                    <i className="bi bi-search fs-1 d-block mb-3"></i>
                    <p className="small mb-0">Pick an event to see rankings.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="card bg-glass border-secondary shadow-lg border-opacity-10">
                <div className="card-body p-3 p-md-4">
                    <h6 className="text-white fw-bold x-small text-uppercase ls-1 mb-3">Ranking Logic</h6>
                    <ul className="list-unstyled mb-0">
                        <li className="d-flex align-items-center gap-2 x-small text-light opacity-50 mb-2">
                            <i className="bi bi-check-circle-fill text-info"></i> 1st Place: 100 Trophy Pts
                        </li>
                        <li className="d-flex align-items-center gap-2 x-small text-light opacity-50 mb-2">
                            <i className="bi bi-check-circle-fill text-info"></i> 2nd Place: 50 Trophy Pts
                        </li>
                        <li className="d-flex align-items-center gap-2 x-small text-light opacity-50">
                            <i className="bi bi-check-circle-fill text-info"></i> Participation: 10 Trophy Pts
                        </li>
                    </ul>
                </div>
            </div>
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
          border-radius: 24px; 
        }

        .bg-bronze { background-color: #cd7f32; }
        .border-dashed { border-style: dashed !important; }
        .ls-1 { letter-spacing: 1px; }
        .x-small { font-size: 0.7rem; }
        .x-small-text { font-size: 0.6rem; }
        .fs-7 { font-size: 0.85rem; }
        .min-w-150 { min-width: 150px; }

        .rank-badge {
            width: 54px;
            height: 28px;
            border-radius: 8px;
            font-size: 0.65rem;
        }

        .shadow-gold { box-shadow: 0 4px 10px rgba(255, 193, 7, 0.2); }
        .shadow-silver { box-shadow: 0 4px 10px rgba(248, 249, 250, 0.1); }
        .shadow-bronze { box-shadow: 0 4px 10px rgba(205, 127, 50, 0.2); }

        .animate-fade-in {
            opacity: 0;
            transform: translateY(10px);
            animation: fadeIn 0.4s ease forwards;
        }

        @keyframes fadeIn {
            to { opacity: 1; transform: translateY(0); }
        }

        .custom-table-container::-webkit-scrollbar { height: 4px; }
        .custom-table-container::-webkit-scrollbar-thumb {
            background: rgba(13, 202, 240, 0.2);
            border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default Leaderboard;