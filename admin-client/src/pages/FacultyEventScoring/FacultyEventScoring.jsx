import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import facultyAPI from '../../api/facultyApi';
import FacultyNavbar from '../../components/FacultyNavbar';
import './FacultyEventScoring.css';

const FacultyEventScoring = () => {
  const { id: eventId } = useParams();
  const [teams, setTeams] = useState([]);
  const [round, setRound] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [score, setScore] = useState('');
  const [comment, setComment] = useState('');
  const [existingScore, setExistingScore] = useState(null);

  // 🔹 Fetch teams for event
  useEffect(() => {
    facultyAPI.get(`/event/${eventId}/teams`)
      .then(res => setTeams(res.data))
      .catch(err => {
        console.error('Team fetch failed:', err);
        setTeams([]);
      });
  }, [eventId]);

  // 🔍 Fetch existing score
  useEffect(() => {
    if (selectedTeam && round) {
      facultyAPI.get(`/event/${eventId}/scores/${selectedTeam}?round=${round}`)
        .then(res => {
          const byJudge = res.data[0]; // Your backend filters by judge already
          setExistingScore(byJudge || null);
          setScore(byJudge?.points || '');
          setComment(byJudge?.comment || '');
        })
        .catch(err => {
          console.error('Score fetch error:', err);
          setExistingScore(null);
        });
    }
  }, [selectedTeam, round, eventId]);

  // 💾 Submit score
  const handleSubmit = async () => {
    try {
      const payload = {
        teamId: selectedTeam,
        round,
        points: Number(score),
        comment
      };
      const res = await facultyAPI.post(`/event/${eventId}/score`, payload);
      alert(res.data.message);
      setExistingScore(res.data.score);
      console.log({ teamId: selectedTeam, round, points: score, comment });
    } catch (err) {
      console.log({ teamId: selectedTeam, round, points: score, comment });
      console.error('Score submit error:', err);
      alert('Failed to submit score');
    }
  };

  // 🗑️ Delete score
  const handleDelete = async () => {
    if (!window.confirm('Delete this score?')) return;
    try {
      await facultyAPI.delete(`/event/${eventId}/score/${selectedTeam}?round=${round}`);
      setScore('');
      setComment('');
      setExistingScore(null);
      alert('Score deleted');
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete score');
    }
  };

  return (
    <>
      <FacultyNavbar />
      <div className="event-scoring">
        <h2>Score Teams for Event</h2>

        <div className="form-row">
          <div className="form-group">
            <label>Select Round</label>
            <select value={round} onChange={e => setRound(e.target.value)}>
              <option value="">-- Select --</option>
              <option value="Round 1">Round 1</option>
              <option value="Final">Final</option>
            </select>
          </div>

          <div className="form-group">
            <label>Select Team</label>
            <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}>
              <option value="">-- Select --</option>
              {teams.map(team => (
                <option key={team._id} value={team._id}>
                  {team.name} ({team.college})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedTeam && round && (
          <>
            <label>Score (out of 100)</label>
            <input
              type="number"
              value={score}
              onChange={e => setScore(e.target.value)}
              placeholder="Enter score"
            />

            <label>Comment (optional)</label>
            <textarea
              rows="4"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write comment here..."
            ></textarea>

            <button onClick={handleSubmit}>Submit / Update Score</button>
            {existingScore && <button onClick={handleDelete}>Delete Score</button>}
          </>
        )}
      </div>
    </>
  );
};

export default FacultyEventScoring;