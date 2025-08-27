import React, { useEffect, useState } from 'react';
import API from '../../api/adminApi';
import Navbar from '../../components/Navbar';
import './Scoring.css';

function Scoring() {
  const [teams, setTeams] = useState([]);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    teamId: '',
    eventId: '',
    points: ''
  });
  const [selectedRound, setSelectedRound] = useState('');
  const [scores, setScores] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    async function fetchInitial() {
      try {
        const [tRes, eRes, lRes] = await Promise.all([
          API.get('/admin/teams'),
          API.get('/admin/events'),
          API.get('/admin/scoring/leaderboard')
        ]);
        setTeams(tRes.data);
        setEvents(eRes.data);
        setLeaderboard(lRes.data);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    }
    fetchInitial();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/scoring', {
        teamId: form.teamId,
        eventId: form.eventId,
        points: parseInt(form.points)
      });
      alert('✅ Score updated!');
      setForm({ teamId: '', eventId: '', points: '' });
    } catch (err) {
      console.error('Failed to assign score:', err);
      alert('❌ Score assignment failed.');
    }
  };

  const finalizeScoring = async () => {
    if (!form.eventId || !selectedRound) {
      alert('⚠️ Please select both event and round before finalizing.');
      return;
    }
    try {
      await API.post(`/admin/scoring/finalize/${form.eventId}/${selectedRound}`);
      alert('✅ Final scoring completed');
      const lRes = await API.get('/admin/scoring/leaderboard');
      setLeaderboard(lRes.data);
    } catch (err) {
      console.error('Final scoring error:', err);
      alert('❌ Final scoring failed');
    }
  };

  const fetchTeamScores = async (id) => {
    try {
      const { data } = await API.get(`/admin/scoring/team/${id}`);
      setScores(data);
    } catch (err) {
      console.error('Failed to fetch team scores:', err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="scoring">
        <h2>Scoring Manager</h2>

        {/* 🔽 Assign Scores Form */}
        <form onSubmit={handleAssign}>
          <select
            value={form.teamId}
            onChange={e => setForm({ ...form, teamId: e.target.value })}
            required
          >
            <option value="">Select Team</option>
            {teams.map(t => (
              <option key={t._id} value={t._id}>
                {t.leader} ({t.college})
              </option>
            ))}
          </select>

          <select
            value={form.eventId}
            onChange={e => setForm({ ...form, eventId: e.target.value })}
            required
          >
            <option value="">Select Event</option>
            {events.map(e => (
              <option key={e._id} value={e._id}>
                {e.name} ({e.category})
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Points"
            value={form.points}
            onChange={e => setForm({ ...form, points: e.target.value })}
            required
          />

          <button type="submit">✅ Assign</button>
        </form>

        <hr />

        {/* 🧠 Finalize Scoring */}
        <h3>🧠 Finalize Scoring</h3>
        <select
          value={selectedRound}
          onChange={e => setSelectedRound(e.target.value)}
          required
        >
          <option value="">Select Round</option>
          <option value="Round 1">Round 1</option>
          <option value="Round 2">Round 2</option>
          <option value="Final">Final</option>
        </select>

        <button type="button" onClick={finalizeScoring}>
          🧠 Finalize Scores
        </button>

        <hr />

        {/* 📊 Team Scores */}
        <h3>📊 View Team Scores</h3>
        <select onChange={e => fetchTeamScores(e.target.value)}>
          <option value="">Select Team</option>
          {teams.map(t => (
            <option key={t._id} value={t._id}>
              {t.leader} ({t.college})
            </option>
          ))}
        </select>

        <ul>
          {scores.map(s => (
            <li key={s._id}>
              {s.event.name} — <strong>{s.points} pts</strong>
            </li>
          ))}
        </ul>

        <hr />

        {/* 🏆 Leaderboard */}
        <h3>🏆 Leaderboard</h3>
        <ol>
          {leaderboard.map((team, i) => (
            <li key={i}>
              <strong>{team.teamName}</strong> ({team.college}) — {team.total} pts
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

export default Scoring;