import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import getApiBase from '../../utils/getApiBase';
import FacultyNavbar from '../../components/FacultyNavbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FacultyEventScoring = () => {
  const { id: eventId } = useParams();
  const [teams, setTeams] = useState([]);
  const [judges, setJudges] = useState([]);
  const [allScores, setAllScores] = useState([]);
  const [round, setRound] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [scoringMode, setScoringMode] = useState('team');
  const [teamScore, setTeamScore] = useState('');
  const [comment, setComment] = useState('');
  const [individualScores, setIndividualScores] = useState([]);
  const [finalized, setFinalized] = useState(false);

  const baseURL = getApiBase();

  useEffect(() => {
    axios.get(`${baseURL}/api/faculty/event/${eventId}/teams`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('facultyToken')}`
      },
      withCredentials: true
    })
      .then(res => setTeams(res.data))
      .catch(() => toast.error('❌ Failed to fetch teams'));

    axios.get(`${baseURL}/api/faculty/event/${eventId}/judges`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('facultyToken')}`
      },
      withCredentials: true
    })
      .then(res => setJudges(res.data))
      .catch(() => toast.error('❌ Failed to fetch judges'));
  }, [eventId, baseURL]);

  const fetchScoresForTeamAndRound = useCallback(async () => {
    try {
      const res = await axios.get(`${baseURL}/api/faculty/event/${eventId}/scores/${selectedTeam}?round=${round}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('facultyToken')}`
        },
        withCredentials: true
      });
      setAllScores(res.data);
      const myScores = res.data.filter(s => s.judge._id === localStorage.getItem('facultyId'));
      const locked = myScores.some(s => s.finalized);
      setFinalized(locked);
    } catch {
      toast.error('❌ Failed to fetch score');
    }
  }, [eventId, selectedTeam, round, baseURL]);

  useEffect(() => {
    if (selectedTeam && round) {
      fetchScoresForTeamAndRound();

      const team = teams.find(t => t._id === selectedTeam);
      setIndividualScores(team?.members.map(m => ({ name: m.name, score: '' })) || []);
    }
  }, [selectedTeam, round, teams, fetchScoresForTeamAndRound]);

  const handleIndividualScoreChange = (index, value) => {
    const updated = [...individualScores];
    updated[index].score = value;
    setIndividualScores(updated);
  };

  const handleSubmit = async () => {
    if (!selectedTeam || !round) {
      toast.warn('⚠️ Please select team and round');
      return;
    }

    if (finalized) {
      toast.warn('⚠️ Score already finalized. No edits allowed.');
      return;
    }

    const confirm = window.confirm('Do you want to finalize this score? You will not be able to edit it later.');
    if (!confirm) return;

    const headers = {
      Authorization: `Bearer ${localStorage.getItem('facultyToken')}`
    };

    if (scoringMode === 'team') {
      const numericScore = Number(teamScore);
      if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
        toast.warn('⚠️ Score must be between 0 and 100');
        return;
      }

      const payload = {
        teamId: selectedTeam,
        round,
        points: numericScore,
        comment,
        finalized: true
      };

      try {
        await axios.post(`${baseURL}/api/faculty/event/${eventId}/score`, payload, {
          headers,
          withCredentials: true
        });
        toast.success('✅ Team score finalized');
        setFinalized(true);
        await fetchScoresForTeamAndRound();
      } catch {
        toast.error('❌ Failed to submit score');
      }
    } else {
      const invalid = individualScores.some(s => isNaN(Number(s.score)) || Number(s.score) < 0 || Number(s.score) > 100);
      if (invalid) {
        toast.warn('⚠️ All scores must be between 0 and 100');
        return;
      }

      try {
        for (const s of individualScores) {
          const payload = {
            teamId: selectedTeam,
            round,
            points: Number(s.score),
            participant: s.name,
            comment,
            finalized: true
          };
          await axios.post(`${baseURL}/api/faculty/event/${eventId}/score`, payload, {
            headers,
            withCredentials: true
          });
        }
        toast.success('✅ Individual scores finalized');
        setFinalized(true);
        await fetchScoresForTeamAndRound();
      } catch {
        toast.error('❌ Failed to submit individual scores');
      }
    }
  };

  // JSX remains unchanged — your layout and scoring interface are already clean and compact

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <FacultyNavbar />
      <div className="container py-5" style={{ backgroundColor: '#0D0D15', minHeight: '100vh' }}>
        <div className="mx-auto p-4 rounded shadow-sm text-light" style={{ maxWidth: '800px', backgroundColor: '#161b22', border: '1px solid #2b2f3a' }}>
          <h2 className="text-center text-info fw-bold mb-4 border-bottom pb-2">Score Teams for Event</h2>

          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label text-light">Select Round</label>
              <select className="form-select bg-dark text-light border-secondary" value={round} onChange={e => setRound(e.target.value)} disabled={finalized}>
                <option value="">-- Select --</option>
                <option value="Round 1">Round 1</option>
                <option value="Round 2">Round 2</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label text-light">Select Team</label>
              <select className="form-select bg-dark text-light border-secondary" value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)} disabled={finalized}>
                <option value="">-- Select --</option>
                {teams.map(team => (
                  <option key={team._id} value={team._id}>
                    {team.college}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label text-light">Scoring Mode</label>
              <select className="form-select bg-dark text-light border-secondary" value={scoringMode} onChange={e => setScoringMode(e.target.value)} disabled={finalized}>
                <option value="team">Score Team</option>
                <option value="individual">Score Individuals</option>
              </select>
            </div>
          </div>

          {selectedTeam && round && (
            <>
              {scoringMode === 'team' ? (
                <div className="mb-3">
                  <label className="form-label text-light">Team Score (out of 100)</label>
                  <input
                    type="number"
                    className="form-control bg-dark text-light border-secondary"
                    value={teamScore}
                    onChange={e => setTeamScore(e.target.value)}
                    placeholder="Enter score"
                    disabled={finalized}
                  />
                </div>
              ) : (
                <>
                  <h5 className="text-info mb-3">Individual Scores</h5>
                  {individualScores.map((m, index) => (
                    <div key={index} className="mb-3">
                      <label className="form-label text-light">{m.name}</label>
                      <input
                        type="number"
                        className="form-control bg-dark text-light border-secondary"
                        value={m.score}
                        onChange={e => handleIndividualScoreChange(index, e.target.value)}
                        placeholder="Enter score"
                        disabled={finalized}
                      />
                    </div>
                  ))}
                </>
              )}

              <div className="mb-3">
                <label className="form-label text-light">Comment (optional)</label>
                <textarea
                  className="form-control bg-dark text-light border-secondary"
                  rows="4"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Write comment here..."
                  disabled={finalized}
                ></textarea>
              </div>

              <div className="d-flex flex-wrap gap-3 mt-3">
                <button className="btn btn-info fw-semibold" onClick={handleSubmit} disabled={finalized}>
                  {finalized ? 'Score Finalized' : 'Submit & Finalize'}
                </button>
              </div>

              <div className="mt-4">
                <h5 className="text-info mb-3">Judge Submission Status</h5>
                <table className="table table-dark table-bordered table-sm">
                  <thead>
                    <tr>
                      <th>Judge</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {judges.map(j => {
                      const hasScored = allScores.some(s => s.judge._id === j._id);
                      const isFinal = allScores.some(s => s.judge._id === j._id && s.finalized);
                      return (
                        <tr key={j._id}>
                          <td>{j.name}</td>
                          <td>
                            {isFinal ? (
                              <span className="text-success fw-bold">✅ Finalized</span>
                            ) : hasScored ? (
                              <span className="text-warning">⏳ Submitted</span>
                            ) : (
                              <span className="text-danger">❌ Pending</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default FacultyEventScoring;