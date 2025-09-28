import React, { useEffect, useState } from 'react';
import API from '../../api/adminApi';
import Navbar from '../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Leaderboard() {
  const [events, setEvents] = useState([]);
  const [overallLeaderboard, setOverallLeaderboard] = useState([]);
  const [eventLeaderboard, setEventLeaderboard] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [eventRes, overallRes] = await Promise.all([
          API.get('/admin/events'),
          API.get('/admin/scoring/leaderboard')
        ]);
        setEvents(eventRes.data);
        setOverallLeaderboard(overallRes.data);
      } catch {
        toast.error('❌ Failed to load leaderboard');
      }
    }
    fetchInitialData();
  }, []);

  const handleEventChange = async (e) => {
    const eventId = e.target.value;
    setSelectedEvent(eventId);
    if (!eventId) {
      setEventLeaderboard([]);
      return;
    }

    try {
      const res = await API.get(`/admin/scoring/leaderboard?eventId=${eventId}`);
      setEventLeaderboard(res.data);
    } catch {
      toast.error('❌ Failed to fetch event leaderboard');
    }
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'border-warning text-warning fw-bold';
    if (rank === 2) return 'border-light text-light';
    if (rank === 3) return 'border-secondary text-secondary';
    return 'border-info';
  };

  const renderLeaderboardList = (list) => {
    const sorted = [...list].sort((a, b) => b.finalPoints - a.finalPoints);
    return (
      <ol className="list-group list-group-numbered">
        {sorted.map((team, index) => (
          <li
            key={index}
            className={`list-group-item bg-dark text-light border-start ${getRankColor(index + 1)}`}
            style={{ borderLeftWidth: '6px' }}
          >
            <strong>{team.teamName}</strong> ({team.college}) —{' '}
            {typeof team.finalPoints === 'number' ? `${team.finalPoints} pts` : '—'}
          </li>
        ))}
      </ol>
    );
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <Navbar />
      <div className="container py-5" style={{ backgroundColor: '#0D0D15', minHeight: '100vh' }}>
        <div className="mx-auto text-light" style={{ maxWidth: '800px' }}>
          <h2 className="text-center text-info fw-bold mb-4">🏆 Leaderboard</h2>

          {/* 🟦 Overall Leaderboard */}
          <div className="mb-5">
            <h4 className="text-info fw-bold mb-3">🌐 Overall Leaderboard</h4>
            {overallLeaderboard.length > 0 ? (
              renderLeaderboardList(overallLeaderboard)
            ) : (
              <div className="text-center text-muted">No teams found.</div>
            )}
          </div>

          {/* 🟨 Event Leaderboard */}
          <div>
            <h4 className="text-info fw-bold mb-3">🎯 Filter by Event</h4>
            <select
              className="form-select bg-dark text-light border-secondary mb-4"
              value={selectedEvent}
              onChange={handleEventChange}
            >
              <option value="">-- Select Event --</option>
              {events.map(e => (
                <option key={e._id} value={e._id}>
                  {e.name} ({e.category})
                </option>
              ))}
            </select>

            {selectedEvent && (
              <>
                {eventLeaderboard.length > 0 ? (
                  renderLeaderboardList(eventLeaderboard)
                ) : (
                  <div className="text-center text-muted">No teams found for this event.</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Leaderboard;