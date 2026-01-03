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
  
  const [round, setRound] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [firstPlace, setFirstPlace] = useState('');

  const [criteria, setCriteria] = useState([]);
  const [comment, setComment] = useState('');
  const [finalized, setFinalized] = useState(false);
  const [loading, setLoading] = useState(false);

  const [promotionCount, setPromotionCount] = useState(2);
  const [isPromoting, setIsPromoting] = useState(false);

  const baseURL = getApiBase();
  const facultyId = localStorage.getItem('facultyId');
  
  const headers = useMemo(() => ({
    Authorization: `Bearer ${localStorage.getItem('facultyToken')}`
  }), []);

  const isPowerPair = useMemo(() => {
    return eventData?.name?.toLowerCase().includes("power pair");
  }, [eventData]);

  const uniqueTeams = useMemo(() => {
    const seen = new Set();
    return teams.filter(t => {
      if (!t || !t._id || seen.has(t._id)) return false;
      seen.add(t._id);
      return true;
    });
  }, [teams]);

  const isHeadJudge = useMemo(() => {
    return judges.length > 0 && judges[0]._id === facultyId;
  }, [judges, facultyId]);

  const getDisplayName = (team) => {
    if (!team) return "";
    return team.teamName || team.college || `TEAM_${team._id.substring(team._id.length - 4).toUpperCase()}`;
  };

  const fetchInitialMeta = useCallback(async () => {
    try {
      const [eventRes, judgeRes] = await Promise.all([
        axios.get(`${baseURL}/api/faculty/dashboard/event/${eventId}/details`, { headers }),
        axios.get(`${baseURL}/api/faculty/dashboard/event/${eventId}/judges`, { headers })
      ]);
      
      const data = eventRes.data;
      setEventData(data);
      setJudges(judgeRes.data);

      if (data?.judgingCriteria && !data.isDirectWin) {
        // Power Pair requires exactly 6 indices (0-2 Male, 3-5 Female)
        const size = data.name.toLowerCase().includes("power pair") ? 6 : data.judgingCriteria.length;
        setCriteria(new Array(size).fill(0));
      }
    } catch (err) {
      toast.error('❌ Failed to sync event metadata');
    }
  }, [eventId, baseURL, headers]);

  const fetchTeamsForRound = useCallback(async () => {
    try {
      const res = await axios.get(`${baseURL}/api/faculty/scoring/event/${eventId}/teams?round=${round}`, { headers });
      setTeams(res.data || []);
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
      const res = await axios.get(url, { headers });
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
          const size = eventData?.name.toLowerCase().includes("power pair") ? 6 : (eventData?.judgingCriteria?.length || 3);
          setCriteria(new Array(size).fill(0));
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
    updated[index] = parseInt(value) || 0;
    setCriteria(updated);
  };

  const handlePromotion = async () => {
    if (!window.confirm(`Promote top ${promotionCount} teams to next round?`)) return;
    setIsPromoting(true);
    try {
      await axios.post(`${baseURL}/api/faculty/scoring/event/${eventId}/promote`, {
        round: round,
        count: parseInt(promotionCount)
      }, { headers });
      toast.success(`🚀 Round ${round} complete. Teams promoted!`);
      fetchTeamsForRound();
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
        secondPlaceTeamId: null,
        finalized: isFinal
      }, { headers });
      toast.success(isFinal ? '🏆 Winner Published!' : '💾 Draft Saved');
      fetchCurrentScores();
    } catch (err) {
      toast.error('Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const submitScore = async (isFinal) => {
    if (!selectedTeam) return toast.warn('Please select a team');
    
    // Final validation for Power Pair array size
    let finalCriteria = [...criteria];
    if (isPowerPair && finalCriteria.length < 6) {
        const filler = new Array(6 - finalCriteria.length).fill(0);
        finalCriteria = [...finalCriteria, ...filler];
    }

    setLoading(true);
    try {
      await axios.post(`${baseURL}/api/faculty/scoring/event/${eventId}/score`, {
        teamId: selectedTeam,
        round,
        criteriaScores: finalCriteria,
        comment,
        finalized: isFinal
      }, { headers });
      toast.success(isFinal ? '🏆 Evaluation Locked!' : '💾 Draft Saved');
      fetchCurrentScores();
    } catch (err) {
      toast.error('Submission failed: ' + (err.response?.data?.error || 'Internal Error'));
    } finally {
      setLoading(false);
    }
  };

  const totalPoints = criteria.reduce((a, b) => a + (b || 0), 0);

  return (
    <div className="bg-dark min-vh-100 pb-5 text-white">
      <FacultyNavbar />

      <div className="container mt-5">
        <header className="mb-4 d-flex justify-content-between align-items-center">
            <div>
              <h4 className="text-info fw-bold mb-0">{eventData?.name || 'Loading...'}</h4>
              <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 mt-1 text-uppercase ls-1 x-small">
                {eventData?.isDirectWin ? 'Direct Winner Selection' : isPowerPair ? 'Power Pair Split Scoring' : `Criteria Evaluation`}
              </span>
            </div>
            <div className="text-end text-secondary small font-mono">
                {eventData?.isDirectWin ? 'STANDALONE' : `ROUND ${round}`}
            </div>
        </header>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card bg-glass border-secondary shadow-lg">
              <div className="card-body p-3 p-md-5">
                {eventData?.isDirectWin ? (
                  <div className="animate-fade-in">
                    <h5 className="text-white mb-4 border-bottom border-secondary pb-3">Final Result Selection</h5>
                    <div className="mb-5">
                      <label className="text-warning small fw-bold mb-2 d-block ls-1">WINNER (100 PTS)</label>
                      <select className="form-select bg-dark text-white border-secondary shadow-none py-3" 
                        value={firstPlace} onChange={e => setFirstPlace(e.target.value)} disabled={finalized}>
                        <option value="">-- Choose Winner --</option>
                        {uniqueTeams.map(t => <option key={t._id} value={t._id}>{getDisplayName(t).toUpperCase()}</option>)}
                      </select>
                      <p className="text-secondary x-small mt-3 italic">* Winner gets 100pts, others get 10pts.</p>
                    </div>
                    {!finalized ? (
                      <button className="btn btn-info w-100 fw-bold py-3 text-dark" onClick={() => submitDirectWin(true)} disabled={loading}>PUBLISH RESULT</button>
                    ) : (
                      <div className="alert alert-success bg-success bg-opacity-10 border-success text-center py-3">Result Finalized.</div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="row g-3 mb-4 border-bottom border-secondary pb-4">
                      <div className="col-md-6">
                        <label className="text-info small fw-bold mb-2 d-block">TARGET TEAM</label>
                        <select className="form-select bg-dark text-white border-secondary shadow-none" 
                          value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)} disabled={loading}>
                          <option value="">-- Choose Identity --</option>
                          {uniqueTeams.map(t => (
                            <option key={t._id} value={t._id}>{getDisplayName(t)}</option>
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
                        {isPowerPair ? (
                          <div className="row g-4">
                            <div className="col-md-6 border-end-md border-secondary border-opacity-25 pe-md-4">
                              <h6 className="text-info small fw-bold mb-3 tracking-widest uppercase d-flex align-items-center gap-2">
                                <i className="bi bi-gender-male"></i> MALE CANDIDATE
                              </h6>
                              {[0, 1, 2].map((i) => (
                                <div key={i} className="mb-4">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-white small opacity-75">{eventData.judgingCriteria[i] || `M-Criteria ${i+1}`}</span>
                                    <span className="badge bg-info text-dark x-small">{criteria[i] || 0}</span>
                                  </div>
                                  <input type="range" className="form-range custom-slider" min="0" max="100" 
                                    value={criteria[i] || 0} onChange={e => handleSliderChange(i, e.target.value)} disabled={finalized} />
                                </div>
                              ))}
                            </div>
                            <div className="col-md-6 ps-md-4">
                              <h6 className="text-pink small fw-bold mb-3 tracking-widest uppercase d-flex align-items-center gap-2">
                                <i className="bi bi-gender-female"></i> FEMALE CANDIDATE
                              </h6>
                              {[3, 4, 5].map((i) => (
                                <div key={i} className="mb-4">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-white small opacity-75">{eventData.judgingCriteria[i-3] || `F-Criteria ${i-2}`}</span>
                                    <span className="badge bg-pink text-white x-small">{criteria[i] || 0}</span>
                                  </div>
                                  <input type="range" className="form-range custom-slider-pink" min="0" max="100" 
                                    value={criteria[i] || 0} onChange={e => handleSliderChange(i, e.target.value)} disabled={finalized} />
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          eventData?.judgingCriteria?.map((label, i) => (
                            <div key={i} className="mb-4">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-white fw-bold">{label}</span>
                                <span className="badge bg-info text-dark fs-6">{criteria[i] || 0}</span>
                              </div>
                              <input type="range" className="form-range custom-slider" min="0" max="100" 
                                value={criteria[i] || 0} onChange={e => handleSliderChange(i, e.target.value)} disabled={finalized} />
                            </div>
                          ))
                        )}

                        <div className="bg-info bg-opacity-10 rounded p-3 mb-4 text-center border border-info border-opacity-25 mt-4">
                          <label className="text-info x-small d-block mb-1 tracking-widest">CUMULATIVE STRENGTH</label>
                          <h2 className="text-white fw-black mb-0">{totalPoints}</h2>
                        </div>

                        {!finalized ? (
                          <div className="d-grid gap-2">
                            <button className="btn btn-info fw-bold py-3 shadow-sm text-dark" onClick={() => submitScore(true)} disabled={loading}>FINALIZE SCORE</button>
                            <button className="btn btn-outline-secondary text-white border-secondary" onClick={() => submitScore(false)} disabled={loading}>SAVE AS DRAFT</button>
                          </div>
                        ) : (
                          <div className="alert alert-success bg-success bg-opacity-10 border-success text-center">Evaluation Locked.</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-5 opacity-50 text-white italic">Select a team identity to evaluate</div>
                    )}

                    {isHeadJudge && round < eventData?.rounds && (
                      <div className="mt-5 pt-4 border-top border-secondary border-opacity-50">
                        <div className="bg-white bg-opacity-5 rounded p-4 border border-warning border-opacity-20">
                            <h6 className="text-warning fw-bold mb-1 uppercase"><i className="bi bi-shield-lock-fill me-2"></i>Head Judge Control</h6>
                            <p className="text-secondary x-small mb-3">Promote top unique teams to Round {round+1}</p>
                            <div className="d-flex gap-2">
                               <input type="number" className="form-control bg-dark text-white border-secondary w-25" 
                                 value={promotionCount} onChange={(e) => setPromotionCount(e.target.value)} />
                               <button className="btn btn-warning fw-bold flex-grow-1 text-dark" onClick={handlePromotion} disabled={isPromoting}>
                                 {isPromoting ? 'PROMOTING...' : 'PROMOTE TEAMS'}
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
                <h5 className="text-white fw-bold mb-4 border-bottom border-white border-opacity-10 pb-3">Judge Status Panel</h5>
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle mb-0">
                    <tbody>
                      {judges.map((j, index) => {
                        const scoreEntry = allScores.find(s => s.judge._id === j._id);
                        return (
                          <tr key={j._id} className="border-secondary">
                            <td className="py-3 text-white fw-bold">
                                {j.name} {index === 0 && <span className="badge bg-warning text-dark ms-1 x-small-badge">HEAD</span>}
                            </td>
                            <td className="text-end">
                              {scoreEntry?.finalized ? <span className="text-success small fw-bold">LOCKED</span> : <span className="text-danger small fw-bold">PENDING</span>}
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
        .bg-glass { background: rgba(15, 15, 15, 0.9) !important; backdrop-filter: blur(20px); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); }
        .x-small { font-size: 0.65rem; }
        .x-small-badge { font-size: 0.55rem; padding: 2px 5px; vertical-align: middle; }
        .ls-1 { letter-spacing: 1px; }
        .fw-black { font-weight: 900; }
        .text-pink { color: #ff69b4; }
        .bg-pink { background-color: #ff69b4; }
        
        .custom-slider, .custom-slider-pink { height: 6px; border-radius: 5px; background: #2b2f3a; -webkit-appearance: none; width: 100%; cursor: pointer; }
        .custom-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #0dcaf0; border: 3px solid #0D0D15; box-shadow: 0 0 10px rgba(13, 202, 240, 0.3); }
        .custom-slider-pink::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #ff69b4; border: 3px solid #0D0D15; box-shadow: 0 0 10px rgba(255, 105, 180, 0.3); }
        
        @media (min-width: 768px) {
          .border-end-md { border-right: 1px solid rgba(255,255,255,0.1) !important; }
        }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default FacultyEventScoring;