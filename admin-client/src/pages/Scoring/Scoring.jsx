import React, { useEffect, useState } from 'react';
import API from '../../api/adminApi';
import Navbar from '../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Scoring() {
  const [teams, setTeams] = useState([]);
  const [scores, setScores] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedRound, setSelectedRound] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchInitial() {
      try {
        const [teamRes, eventRes] = await Promise.all([
          API.get('/admin/teams'),
          API.get('/admin/events')
        ]);
        setTeams(teamRes.data);
        setEvents(eventRes.data);
      } catch (err) {
        console.error('❌ Initial data fetch failed:', err);
        toast.error('❌ Failed to load initial data');
      }
    }
    fetchInitial();
  }, []);

  const fetchTeamScores = async () => {
    if (!selectedTeamId || !selectedEventId || !selectedRound) {
      toast.warn('⚠️ Please select team, event, and round');
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.get(
        `/admin/scoring/admin/event/${selectedEventId}/scores/${selectedTeamId}?round=${selectedRound}`
      );

      if (!data || data.length === 0) {
        toast.info('ℹ️ No scores found for this team and round');
      }

      setScores(data);
    } catch (err) {
      console.error('❌ Error fetching scores:', err.response?.data || err.message);
      toast.error(`❌ ${err.response?.data?.error || 'Failed to fetch team scores'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <Navbar />
      <div className="container py-5" style={{ backgroundColor: '#0d0d15', minHeight: '100vh' }}>
        <h2 className="text-center text-info fw-bold mb-4">Scoring Overview</h2>

        <h4 className="text-info fw-bold mb-3">📊 View Team Scores</h4>
        <div className="row g-3 mb-4" style={{ maxWidth: '600px' }}>
          <div className="col-md-4">
            <select
              className="form-select bg-dark text-light border-secondary"
              value={selectedTeamId}
              onChange={e => setSelectedTeamId(e.target.value)}
            >
              <option value="">Select Team</option>
              {teams.map(t => (
                <option key={t._id} value={t._id}>
                  {t.leader} ({t.college})
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <select
              className="form-select bg-dark text-light border-secondary"
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value)}
            >
              <option value="">Select Event</option>
              {events.map(e => (
                <option key={e._id} value={e._id}>
                  {e.name} ({e.category})
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <select
              className="form-select bg-dark text-light border-secondary"
              value={selectedRound}
              onChange={e => setSelectedRound(e.target.value)}
            >
              <option value="">Select Round</option>
              <option value="Round 1">Round 1</option>
              <option value="Round 2">Round 2</option>
              <option value="Final">Final</option>
            </select>
          </div>
        </div>

        <div className="text-center mb-4">
          <button className="btn btn-info fw-semibold px-4" onClick={fetchTeamScores} disabled={loading}>
            {loading ? '⏳ Loading...' : '🔍 Load Scores'}
          </button>
        </div>

        {Array.isArray(scores) && scores.length > 0 && (
          <div className="table-responsive">
            <table className="table table-dark table-bordered align-middle">
              <thead className="table-secondary text-dark">
                <tr>
                  <th>Event</th>
                  <th>Round</th>
                  <th>Points</th>
                  <th>Recipient</th>
                  <th>Judge</th>
                  <th>Comment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {scores.map(s => (
                  <tr key={s._id}>
                    <td>{s.event?.name || '—'}</td>
                    <td>{s.round}</td>
                    <td><strong>{s.points} pts</strong></td>
                    <td>{s.participant || <span className="text-white">Team</span>}</td>
                    <td>{s.judge?.name || <span className="text-white">Unknown</span>}</td>
                    <td>{s.comment || <span className="text-muted">—</span>}</td>
                    <td>
                      {s.finalized ? (
                        <span className="badge bg-success">Finalized</span>
                      ) : (
                        <span className="badge bg-warning text-dark">Not Finalized</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {scores.length === 0 && selectedTeamId && selectedEventId && selectedRound && !loading && (
          <div className="text-center text-muted mt-4">
            No scores submitted yet for this team in {selectedRound}.
          </div>
        )}
      </div>
    </>
  );
}

export default Scoring;