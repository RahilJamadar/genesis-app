import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import getApiBase from '../../../utils/getApiBase';
import FacultyNavbar from '../../../components/FacultyNavbar';
import { toast } from 'react-toastify';

const FacultyEventScoring = () => {
  const { id: eventId } = useParams();
  const [eventData, setEventData] = useState(null);
  const [teams, setTeams] = useState([]);
  const [judges, setJudges] = useState([]);
  const [allScores, setAllScores] = useState([]);
  
  // Selection States
  const [round, setRound] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState('');
  
  // 🥇 Direct Win States
  const [firstPlace, setFirstPlace] = useState('');

  // 📊 Standard Evaluation States
  const [criteria, setCriteria] = useState([]);
  const [comment, setComment] = useState('');
  const [finalized, setFinalized] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🚀 Promotion States
  const [promotionCount, setPromotionCount] = useState(2);
  const [isPromoting, setIsPromoting] = useState(false);

  const baseURL = getApiBase();
  const facultyId = localStorage.getItem('facultyId');
  
  const headers = useMemo(() => ({
    Authorization: `Bearer ${localStorage.getItem('facultyToken')}`
  }), []);

  const getDisplayName = (team) => {
    if (!team) return "";
    return team.teamName || `TEAM_${team._id.substring(team._id.length - 4).toUpperCase()}`;
  };

  const fetchInitialMeta = useCallback(async () => {
    try {
      const [eventRes, judgeRes] = await Promise.all([
        axios.get(`${baseURL}/api/faculty/dashboard/event/${eventId}/details`, { headers, withCredentials: true }),
        axios.get(`${baseURL}/api/faculty/dashboard/event/${eventId}/judges`, { headers, withCredentials: true })
      ]);
      
      setEventData(eventRes.data);
      setJudges(judgeRes.data);

      if (eventRes.data?.judgingCriteria && !eventRes.data.isDirectWin) {
        setCriteria(new Array(eventRes.data.judgingCriteria.length).fill(0));
      }
    } catch (err) {
      toast.error('❌ Failed to sync event metadata');
    }
  }, [eventId, baseURL, headers]);

  const fetchTeamsForRound = useCallback(async () => {
    try {
      const res = await axios.get(`${baseURL}/api/faculty/scoring/event/${eventId}/teams?round=${round}`, { 
        headers, 
        withCredentials: true 
      });
      setTeams(res.data);
      setSelectedTeam(''); 
    } catch (err) {
      toast.error('❌ Failed to fetch teams');
    }
  }, [eventId, round, baseURL, headers]);

  useEffect(() => { fetchInitialMeta(); }, [fetchInitialMeta]);
  useEffect(() => { fetchTeamsForRound(); }, [fetchTeamsForRound]);

  const fetchCurrentScores = useCallback(async () => {
    const isDirect = eventData?.isDirectWin;
    const url = isDirect 
      ? `${baseURL}/api/faculty/scoring/event/${eventId}/scores/null?round=1`
      : `${baseURL}/api/faculty/scoring/event/${eventId}/scores/${selectedTeam}?round=${round}`;

    if (!isDirect && (!selectedTeam || !round)) return;

    try {
      const res = await axios.get(url, { headers, withCredentials: true });
      setAllScores(res.data);
      
      const myScore = res.data.find(s => s.judge._id === facultyId);
      if (myScore) {
        setFinalized(myScore.finalized);
        if (isDirect) {
          setFirstPlace(myScore.directWinners?.firstPlace || '');
        } else {
          setCriteria(myScore.criteriaScores || []);
          setComment(myScore.comment || '');
        }
      } else {
        setFinalized(false);
        if (!isDirect) {
          setCriteria(new Array(eventData?.judgingCriteria?.length || 3).fill(0));
          setComment('');
        }
      }
    } catch (err) {
      console.error("Score fetch error");
    }
  }, [eventId, selectedTeam, round, baseURL, facultyId, headers, eventData]);

  useEffect(() => { fetchCurrentScores(); }, [fetchCurrentScores]);

  const handleSliderChange = (index, value) => {
    const updated = [...criteria];
    updated[index] = parseInt(value);
    setCriteria(updated);
  };

  const handlePromotion = async () => {
    if (!window.confirm(`Promote top ${promotionCount} teams?`)) return;
    setIsPromoting(true);
    try {
      await axios.post(`${baseURL}/api/faculty/scoring/event/${eventId}/promote`, {
        round: round,
        count: parseInt(promotionCount)
      }, { headers, withCredentials: true });
      toast.success(`🚀 Promoted successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Promotion failed.');
    } finally {
      setIsPromoting(false);
    }
  };

  const submitDirectWin = async (isFinal) => {
    if (!firstPlace) return toast.warn('Please select the winner');
    
    setLoading(true);
    try {
      await axios.post(`${baseURL}/api/faculty/scoring/event/${eventId}/direct-win`, {
        firstPlaceTeamId: firstPlace,
        secondPlaceTeamId: null, // 🚀 Fixed: Only First Place is sent
        finalized: isFinal
      }, { headers, withCredentials: true });

      toast.success(isFinal ? '🏆 Winner Locked!' : '💾 Draft Saved');
      fetchCurrentScores();
    } catch (err) {
      toast.error('Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const submitScore = async (isFinal) => {
    if (!selectedTeam) return toast.warn('Please select a team');
    setLoading(true);
    try {
      await axios.post(`${baseURL}/api/faculty/scoring/event/${eventId}/score`, {
        teamId: selectedTeam,
        round,
        criteriaScores: criteria,
        comment,
        finalized: isFinal
      }, { headers, withCredentials: true });
      toast.success(isFinal ? '🏆 Scores Finalized!' : '💾 Draft Saved');
      fetchCurrentScores();
    } catch (err) {
      toast.error('Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const totalPoints = criteria.reduce((a, b) => a + b, 0);

  return (
    <div className="bg-dark min-vh-100 pb-5">
      <FacultyNavbar />

      <div className="container mt-5">
        <header className="mb-4 d-flex justify-content-between align-items-center">
            <div>
              <h4 className="text-info fw-bold mb-0">{eventData?.name || 'Loading...'}</h4>
              <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 mt-1 text-uppercase ls-1 x-small">
                {eventData?.isDirectWin ? 'Direct Winner Selection' : 'Criteria Evaluation'}
              </span>
            </div>
            <div className="text-end text-secondary small font-mono">
               {eventData?.isDirectWin ? 'STANDALONE ROUND' : `ACTIVE ROUND: ${round}`}
            </div>
        </header>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card bg-glass border-secondary shadow-lg">
              <div className="card-body p-4 p-md-5">
                
                {eventData?.isDirectWin ? (
                  /* 🥇 DIRECT WIN UI */
                  <div className="animate-fade-in">
                    <h5 className="text-white mb-4 border-bottom border-secondary pb-3">Final Result Selection</h5>
                    <div className="mb-5">
                      <label className="text-warning small fw-bold mb-2 d-block ls-1">FIRST PLACE (100 PTS)</label>
                      <select className="form-select bg-dark text-white border-secondary shadow-none py-3" 
                        value={firstPlace} onChange={e => setFirstPlace(e.target.value)} disabled={finalized}>
                        <option value="">-- Choose Winner --</option>
                        {teams.map(t => <option key={t._id} value={t._id}>{getDisplayName(t).toUpperCase()}</option>)}
                      </select>
                      <p className="text-secondary x-small mt-3 italic">
                        * Note: Selecting a winner will award them 100 points. All other participating teams will receive 10 points for participation.
                      </p>
                    </div>
                    
                    {!finalized ? (
                      <div className="d-grid gap-2">
                        <button className="btn btn-info fw-bold py-3" onClick={() => submitDirectWin(true)} disabled={loading}>
                          FINALIZE & PUBLISH WINNER
                        </button>
                      </div>
                    ) : (
                      <div className="alert alert-success bg-success bg-opacity-10 border-success border-opacity-25 text-center py-3">
                        <i className="bi bi-trophy-fill text-white me-2"></i> Result Finalized and Published.
                      </div>
                    )}
                  </div>
                ) : (
                  /* 📊 STANDARD SLIDER UI */
                  <>
                    <div className="row g-3 mb-4 border-bottom border-secondary pb-4">
                      <div className="col-md-6">
                        <label className="text-info small fw-bold mb-2 d-block">TARGET TEAM</label>
                        <select className="form-select bg-dark text-white border-secondary shadow-none" 
                          value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)} disabled={loading}>
                          <option value="">-- Choose Team Identity --</option>
                          {teams.map(t => (
                            <option key={t._id} value={t._id}>
                              {getDisplayName(t)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="text-info small fw-bold mb-2 d-block">ROUND</label>
                        <select className="form-select bg-dark text-white border-secondary shadow-none" 
                          value={round} onChange={e => setRound(parseInt(e.target.value))} disabled={loading}>
                          {[...Array(eventData?.rounds || 1)].map((_, i) => (
                            <option key={i} value={i + 1}>Round {i + 1}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {selectedTeam ? (
                      <div className="scoring-sliders animate-fade-in">
                        {eventData?.judgingCriteria?.map((label, i) => (
                          <div key={i} className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="text-white fw-bold">{label}</span>
                              <span className="badge bg-info text-dark fs-6">{criteria[i] || 0}</span>
                            </div>
                            <input type="range" className="form-range custom-slider" min="0" max="100" 
                              value={criteria[i] || 0} onChange={e => handleSliderChange(i, e.target.value)} disabled={finalized} />
                          </div>
                        ))}
                        <div className="bg-info bg-opacity-10 rounded p-3 mb-4 text-center border border-info border-opacity-25">
                          <h2 className="text-white fw-black mb-0">{totalPoints}</h2>
                        </div>
                        {!finalized ? (
                          <div className="d-grid gap-2">
                            <button className="btn btn-info fw-bold py-3 shadow-sm" onClick={() => submitScore(true)} disabled={loading}>
                              FINALIZE SCORE
                            </button>
                            <button className="btn btn-outline-secondary text-white border-secondary" onClick={() => submitScore(false)} disabled={loading}>
                              SAVE AS DRAFT
                            </button>
                          </div>
                        ) : (
                          <div className="alert alert-success bg-success bg-opacity-10 border-success border-opacity-25 text-center">
                            Evaluation Locked.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-5 opacity-50 text-white">Select a team identity to begin evaluation</div>
                    )}

                    {round < eventData?.rounds && (
                      <div className="mt-5 pt-4 border-top border-secondary border-opacity-50">
                        <div className="bg-grey-700 bg-opacity-5 rounded p-4 border border-warning border-opacity-20 shadow-sm">
                           <h6 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                             <i className="bi bi-lightning-charge-fill"></i> ROUND PROMOTION CONTROL
                           </h6>
                           <div className="d-flex gap-2">
                              <div className="flex-grow-1">
                                <input 
                                  type="number" 
                                  className="form-control bg-dark text-white border-secondary shadow-none" 
                                  placeholder="Count"
                                  value={promotionCount}
                                  onChange={(e) => setPromotionCount(e.target.value)}
                                  disabled={isPromoting}
                                />
                                <small className="text-white" style={{fontSize: '0.6rem'}}>NUMBER TO PROMOTE</small>
                              </div>
                              <button 
                                className="btn btn-warning fw-bold px-4 h-100" 
                                onClick={handlePromotion}
                                disabled={isPromoting}
                              >
                                {isPromoting ? 'PROMOTING...' : 'PROMOTE'}
                              </button>
                           </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card bg-glass border-secondary shadow-lg">
              <div className="card-body p-4">
                <h5 className="text-white fw-bold mb-4">Round <span className="text-info">Registry</span></h5>
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle mb-0">
                    <tbody>
                      {judges.map(j => {
                        const scoreEntry = allScores.find(s => s.judge._id === j._id);
                        return (
                          <tr key={j._id} className="border-secondary">
                            <td className="py-3 text-white fw-bold">
                                {j.name} {j._id === facultyId && <span className="text-info ms-1 small">(YOU)</span>}
                            </td>
                            <td className="text-end">
                              {scoreEntry?.finalized ? (
                                <span className="badge bg-success bg-opacity-10 text-success border border-success px-2 x-small ls-1">LOCKED</span>
                              ) : (
                                <span className="badge bg-danger bg-opacity-10 text-danger border border-danger px-2 x-small ls-1">PENDING</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .bg-glass { background: rgba(255, 255, 255, 0.03) !important; backdrop-filter: blur(12px); border-radius: 24px; }
        .x-small { font-size: 0.65rem; }
        .ls-1 { letter-spacing: 1px; }
        .fw-black { font-weight: 900; }
        .custom-slider { height: 6px; border-radius: 5px; background: #2b2f3a; -webkit-appearance: none; }
        .custom-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #0dcaf0; cursor: pointer; border: 3px solid #0D0D15; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default FacultyEventScoring;