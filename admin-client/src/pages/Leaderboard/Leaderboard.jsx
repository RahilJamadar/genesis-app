import React, { useEffect, useState } from 'react';
import API from '../../api/adminApi';
import Navbar from '../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventRes, boardRes] = await Promise.all([
          API.get('/admin/events'),
          API.get('/admin/scoring/leaderboard')
        ]);
        setEvents(eventRes.data);
        setLeaderboard(boardRes.data);
      } catch {
        toast.error('❌ Failed to load leaderboard');
      }
    }
    fetchData();
  }, []);

  const handleEventChange = async (e) => {
    const eventId = e.target.value;
    setSelectedEvent(eventId);
    try {
      const res = await API.get(`/admin/scoring/leaderboard?eventId=${eventId}`);
      setLeaderboard(res.data);
    } catch {
      toast.error('❌ Failed to fetch filtered leaderboard');
    }
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'border-warning text-warning fw-bold';
    if (rank === 2) return 'border-light text-light';
    if (rank === 3) return 'border-secondary text-secondary';
    return 'border-info';
  };

  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <Navbar />
      <div className="container py-5" style={{ backgroundColor: '#0D0D15', minHeight: '100vh' }}>
        <div className="mx-auto text-light" style={{ maxWidth: '800px' }}>
          <h2 className="text-center text-info fw-bold mb-4">🏆 Leaderboard</h2>

          <select
            className="form-select bg-dark text-light border-secondary mb-4"
            value={selectedEvent}
            onChange={handleEventChange}
          >
            <option value="">Overall Leaderboard</option>
            {events.map(e => (
              <option key={e._id} value={e._id}>
                {e.name} ({e.category})
              </option>
            ))}
          </select>

          <ol className="list-group list-group-numbered">
            {sortedLeaderboard.map((team, index) => (
              <li
                key={index}
                className={`list-group-item bg-dark text-light border-start ${getRankColor(index + 1)}`}
                style={{ borderLeftWidth: '6px' }}
              >
                <strong>{team.teamName}</strong> ({team.college}) — {team.totalPoints ?? 0} pts
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}

export default Leaderboard;