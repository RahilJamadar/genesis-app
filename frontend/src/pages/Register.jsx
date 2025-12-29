import React, { useState, useEffect } from 'react';
import axios from 'axios';
import getApiBase from '../utils/getApiBase';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const { mode } = useParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const baseURL = getApiBase();
  const navigate = useNavigate();

  const [teamInfo, setTeamInfo] = useState({
    college: '', faculty: '', leaderName: '', leaderEmail: '', leaderPhone: '',
    selectedTrophyEvents: [], selectedOpenEvents: []
  });

  const [eventParticipants, setEventParticipants] = useState({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/admin/events/public`);
        const allEvents = res.data;

        if (mode === 'main') {
          // Only show Trophy events, completely hide standalone Open events
          setEvents(allEvents.filter(e => !['Football', 'Valorant', 'Hackathon'].includes(e.name)));
        } else {
          // Case-insensitive search to ensure "football" matches "Football"
          const targetEvent = allEvents.find(e => e.name.toLowerCase() === mode.toLowerCase());
          if (targetEvent) {
            setEvents([targetEvent]);
            setTeamInfo(prev => ({ ...prev, selectedOpenEvents: [targetEvent._id] }));
            setEventParticipants({
              [targetEvent._id]: Array.from({ length: targetEvent.minParticipants }, () => ({
                name: '', phone: '', diet: 'veg'
              }))
            });
          }
        }
      } catch (err) {
        toast.error("Failed to sync with event database.");
      }
    };
    fetchEvents();
  }, [baseURL, mode]);

  // --- VALIDATION HELPERS ---
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\d{10}$/.test(phone);

  const handleEventToggle = (event, type) => {
    const field = type === 'trophy' ? 'selectedTrophyEvents' : 'selectedOpenEvents';
    const isSelected = teamInfo[field].includes(event._id);
    let newList;

    if (isSelected) {
      newList = teamInfo[field].filter(id => id !== event._id);
      const updatedParticipants = { ...eventParticipants };
      delete updatedParticipants[event._id];
      setEventParticipants(updatedParticipants);
    } else {
      newList = [...teamInfo[field], event._id];
      setEventParticipants({
        ...eventParticipants,
        [event._id]: Array.from({ length: event.minParticipants }, () => ({
          name: '', phone: '', diet: 'veg'
        }))
      });
    }
    setTeamInfo({ ...teamInfo, [field]: newList });
  };

  const updateMember = (eventId, index, field, value) => {
    const updated = [...eventParticipants[eventId]];
    updated[index][field] = value;
    setEventParticipants({ ...eventParticipants, [eventId]: updated });
  };

  const addMemberRow = (event) => {
    if (eventParticipants[event._id].length < event.maxParticipants) {
      setEventParticipants({
        ...eventParticipants,
        [event._id]: [...eventParticipants[event._id], { name: '', phone: '', diet: 'veg' }]
      });
    }
  };

  const removeMemberRow = (eventId, index) => {
    const minP = events.find(e => e._id === eventId).minParticipants;
    if (eventParticipants[eventId].length > minP) {
      const updated = eventParticipants[eventId].filter((_, i) => i !== index);
      setEventParticipants({ ...eventParticipants, [eventId]: updated });
    }
  };

  const validateStep = (currentStep) => {
    const { college, faculty, leaderName, leaderEmail, leaderPhone } = teamInfo;

    if (currentStep === 1) {
      if (!college || !faculty || !leaderName || !leaderEmail || !leaderPhone) {
        return toast.error("Please fill all leader and institution details.");
      }
      if (!validateEmail(leaderEmail)) {
        return toast.error("Please enter a valid email address.");
      }
      if (!validatePhone(leaderPhone)) {
        return toast.error("Leader phone must be 10 digits.");
      }

      // If single event mode, go directly to member list (Step 4)
      if (mode !== 'main') return setStep(4);
      setStep(2);
    } else if (currentStep === 2) {
      if (teamInfo.selectedTrophyEvents.length === 0)
        return toast.error("Select at least one Trophy event.");
      setStep(4); // 🚀 SKIP STEP 3, GO DIRECTLY TO MEMBER LIST
    }
    window.scrollTo(0, 0);
  };

  const finalizeRegistration = async () => {
    const allSelectedIds = [...teamInfo.selectedTrophyEvents, ...teamInfo.selectedOpenEvents];

    for (let id of allSelectedIds) {
      const members = eventParticipants[id];
      if (!members || members.some(m => !m.name || !m.phone)) {
        return toast.error(`Please fill all member details.`);
      }
      if (members.some(m => !validatePhone(m.phone))) {
        return toast.error("All participant phone numbers must be 10 digits.");
      }
    }

    setLoading(true);
    try {
      const flattenedMembers = [];
      Object.entries(eventParticipants).forEach(([eventId, participants]) => {
        const eventName = events.find(e => e._id === eventId)?.name;
        participants.forEach(p => {
          flattenedMembers.push({
            name: p.name, contact: p.phone, diet: p.diet, events: [eventName]
          });
        });
      });

      const isHackathon = mode.toLowerCase() === 'hackathon';

      const payload = {
        college: teamInfo.college,
        faculty: teamInfo.faculty,
        leader: teamInfo.leaderName,
        email: teamInfo.leaderEmail,
        contact: teamInfo.leaderPhone,
        members: flattenedMembers,
        registeredEvents: allSelectedIds,
        paymentStatus: isHackathon ? 'verified' : 'pending'
      };

      const res = await axios.post(`${baseURL}/api/admin/teams`, payload);
      toast.success("Registration Uplink Successful!");

      if (isHackathon) {
        setTimeout(() => navigate('/'), 2000);
      } else {
        setTimeout(() => navigate(`/payment/${res.data.team._id}`), 1500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-vh-100 py-4 py-md-5 px-2 font-sans text-white">
      <ToastContainer theme="dark" position="top-center" autoClose={2000} />

      <div className="container-fluid max-w-4xl mx-auto px-1 px-md-3">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Link to="/register" className="text-black text-decoration-none font-mono x-small border border-white border-opacity-20 px-3 py-2 rounded-pill bg-white bg-opacity-5 hover:text-cyan-400 transition-all">
            <i className="bi bi-arrow-left me-2"></i> EXIT TO HUB
          </Link>
          <h5 className="text-white font-mono mb-0 tracking-widest uppercase small">{mode}_Registration</h5>
        </div>

        {mode === 'main' && (
          <div className="d-flex justify-content-between mb-5 px-2">
            {[1, 2, 4].map((num, idx) => (
              <div key={num} className="text-center z-10" style={{ flex: 1 }}>
                <div className={`step-circle mx-auto transition-all duration-500 ${step >= num ? 'active' : ''}`}>
                  {step > num ? <i className="bi bi-check-lg"></i> : idx + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="st1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card bg-glass border-white border-opacity-10 p-3 p-md-5 rounded-4">
              <h2 className="text-white font-black mb-1 uppercase tracking-tighter fs-3">Step 1: <span className="text-cyan-400">Basic Info</span></h2>
              <p className="text-white text-opacity-50 mb-4 small font-mono">College & Leader Details</p>

              <div className="row g-3">
                <div className="col-12">
                  <label className="text-white x-small mb-1 d-block fw-bold tracking-widest">COLLEGE / UNIVERSITY</label>
                  <input type="text" className="form-control genesis-input" value={teamInfo.college} onChange={e => setTeamInfo({ ...teamInfo, college: e.target.value })} placeholder="Full Institution Name" />
                </div>
                <div className="col-12 col-md-6">
                  <label className="text-white x-small mb-1 d-block fw-bold tracking-widest">FACULTY HEAD</label>
                  <input type="text" className="form-control genesis-input" value={teamInfo.faculty} onChange={e => setTeamInfo({ ...teamInfo, faculty: e.target.value })} placeholder="Teacher Name" />
                </div>
                <div className="col-12 col-md-6">
                  <label className="text-white x-small mb-1 d-block fw-bold tracking-widest">TEAM LEADER</label>
                  <input type="text" className="form-control genesis-input" value={teamInfo.leaderName} onChange={e => setTeamInfo({ ...teamInfo, leaderName: e.target.value })} placeholder="Student Leader" />
                </div>
                <div className="col-12 col-md-6">
                  <label className="text-white x-small mb-1 d-block fw-bold tracking-widest">EMAIL ADDRESS</label>
                  <input type="email" className="form-control genesis-input" value={teamInfo.leaderEmail} onChange={e => setTeamInfo({ ...teamInfo, leaderEmail: e.target.value })} placeholder="leader@email.com" />
                </div>
                <div className="col-12 col-md-6">
                  <label className="text-white x-small mb-1 d-block fw-bold tracking-widest">MOBILE NUMBER</label>
                  <input type="text" maxLength="10" className="form-control genesis-input" value={teamInfo.leaderPhone} onChange={e => setTeamInfo({ ...teamInfo, leaderPhone: e.target.value.replace(/\D/g, '') })} placeholder="10 Digits Only" />
                </div>
              </div>
              <button className="btn-genesis-v2 w-100 mt-5" onClick={() => validateStep(1)}>
                CONTINUE
              </button>
            </motion.div>
          )}

          {step === 2 && mode === 'main' && (
            <motion.div key="st2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card bg-glass border-white border-opacity-10 p-3 p-md-5 rounded-4">
              <h2 className="text-white font-black mb-2 uppercase tracking-tighter fs-3">Step 2: <span className="text-cyan-400">Trophy Events</span></h2>
              <p className="text-white text-opacity-50 mb-4 small font-mono">CHOOSE EVENTS FOR OVERALL CHAMPIONSHIP</p>
              {/* --- IMPORTANT TROPHY NOTE --- */}
              <div className="mb-4 p-3 rounded-4 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 d-flex gap-3 align-items-start">
                <i className="bi bi-exclamation-triangle-fill text-red-500 mt-1"></i>
                <div>
                  <h6 className="text-white font-bold small mb-1 tracking-widest uppercase">Trophy Qualification Alert</h6>
                  <p className="text-white text-opacity-70 x-small-label mb-0 leading-relaxed" style={{ textTransform: 'none', fontSize: '0.75rem' }}>
                    To be eligible for the <span className="text-white fw-bold">Overall Championship Trophy</span>, teams MUST participate in <span className="text-cyan-400 fw-bold">EVERY SINGLE EVENT</span> listed below. Missing even one event will disqualify your institution from the overall standings.
                  </p>
                </div>
              </div>
              <div className="row g-2 mb-4">
                {events.filter(e => e.isTrophyEvent).map(ev => {
                  const isSelected = teamInfo.selectedTrophyEvents.includes(ev._id);
                  return (
                    <div key={ev._id} className="col-12 col-sm-6">
                      <div className={`event-selector-v2 ${isSelected ? 'selected' : ''}`} onClick={() => handleEventToggle(ev, 'trophy')}>
                        <span className="event-name text-white">{ev.name}</span>
                        <div className={`check-icon ${isSelected ? 'checked' : ''}`}>
                          {isSelected && <i className="bi bi-check-lg"></i>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="d-flex gap-3">
                <button className="btn-genesis-outline-v2 w-50" onClick={() => setStep(1)}>BACK</button>
                <button className="btn-genesis-v2 w-50" onClick={() => validateStep(2)}>ADD MEMBERS</button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="st4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card bg-glass border-white border-opacity-10 p-3 p-md-5 rounded-4 shadow-2xl">
              <h2 className="text-white font-black mb-1 uppercase tracking-tighter fs-3">Step 3: <span className="text-cyan-400">Member List</span></h2>
              <p className="text-white text-opacity-50 mb-4 small font-mono uppercase">Enter Team Details</p>

              {events.filter(e => [...teamInfo.selectedTrophyEvents, ...teamInfo.selectedOpenEvents].includes(e._id)).map(event => (
                <div key={event._id} className="mb-5 p-3 p-md-4 rounded-4 bg-black bg-opacity-20 border border-white border-opacity-5">
                  <div className="d-flex justify-content-between align-items-center border-bottom border-white border-opacity-10 pb-3 mb-4">
                    <h5 className="text-white font-mono mb-0 uppercase tracking-widest fw-bold">
                      <i className="bi bi-person-fill me-2 text-cyan-400"></i>{event.name}
                    </h5>
                    <span className="badge rounded-pill bg-cyan-500 bg-opacity-10 text-cyan-400 border border-cyan-100 border-opacity-20 font-mono py-2 px-3">
                      {eventParticipants[event._id]?.length || 0} / {event.maxParticipants} UNITS
                    </span>
                  </div>

                  <div className="member-entries">
                    {eventParticipants[event._id]?.map((member, idx) => (
                      <div key={idx} className="mb-4 pb-4 border-bottom border-white border-opacity-5">
                        <div className="row g-3">
                          <div className="col-12 col-md-5">
                            <label className="x-small-label mb-2 uppercase text-white opacity-50">Full Name</label>
                            <input type="text" className="form-control genesis-input-v2" value={member.name} placeholder="Participant Name" onChange={e => updateMember(event._id, idx, 'name', e.target.value)} />
                          </div>
                          <div className="col-7 col-md-4">
                            <label className="x-small-label mb-2 uppercase text-white opacity-50">Mobile Number</label>
                            <input type="text" maxLength="10" className="form-control genesis-input-v2" value={member.phone} placeholder="10 Digits" onChange={e => updateMember(event._id, idx, 'phone', e.target.value.replace(/\D/g, ''))} />
                          </div>
                          <div className="col-5 col-md-3">
                            <label className="x-small-label mb-2 uppercase text-white opacity-50">Food</label>
                            <select className="form-select genesis-input-v2 select-arrow" value={member.diet} onChange={e => updateMember(event._id, idx, 'diet', e.target.value)}>
                              <option value="veg">Veg</option>
                              <option value="non-veg">Non-Veg</option>
                            </select>
                          </div>
                        </div>
                        {eventParticipants[event._id].length > event.minParticipants && (
                          <div className="text-end mt-2">
                            <button className="btn btn-link text-danger text-decoration-none x-small fw-bold p-0" onClick={() => removeMemberRow(event._id, idx)}>
                              <i className="bi bi-trash-fill me-1"></i>REMOVE
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    {eventParticipants[event._id]?.length < event.maxParticipants && (
                      <button className="btn btn-outline-cyan-v2 btn-sm font-mono w-100 py-3 mt-2" onClick={() => addMemberRow(event)}>
                        <i className="bi bi-plus-lg me-2"></i>ADD MEMBER
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="d-flex gap-3 mt-4">
                <button className="btn-genesis-outline-v2 w-50" onClick={() => mode === 'main' ? setStep(2) : setStep(1)}>
                  BACK
                </button>
                <button className="btn-genesis-v2 w-50 shadow-cyan" onClick={finalizeRegistration} disabled={loading}>
                  {loading ? 'UPLINKING...' : 'FINISH REGISTRATION'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        input::placeholder { color: rgba(255, 255, 255, 0.4) !important; }
        .genesis-input-v2, .genesis-input { 
          background: rgba(0, 0, 0, 0.4) !important; 
          border: 1px solid rgba(255, 255, 255, 0.1) !important; 
          color: white !important; 
          border-radius: 12px !important; 
          padding: 12px !important; 
        }
        .genesis-input-v2:focus, .genesis-input:focus {
          border-color: #0dcaf0 !important;
          box-shadow: 0 0 15px rgba(13, 202, 240, 0.2) !important;
          outline: none;
        }
        .x-small-label { font-size: 0.65rem; font-weight: 800; color: #0dcaf0 !important; }
        .bg-glass { background: rgba(10, 10, 10, 0.9); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; }
        .step-circle { width: 35px; height: 35px; line-height: 35px; border-radius: 50%; background: #1a1a1a; border: 1px solid #333; text-align: center; font-size: 0.8rem; font-weight: bold;}
        .step-circle.active { background: #0dcaf0; color: #000; box-shadow: 0 0 15px rgba(13, 202, 240, 0.4); border-color: #0dcaf0; }
        .btn-genesis-v2 { background: #0dcaf0; color: black !important; font-weight: 900; border: none; padding: 15px; border-radius: 12px; transition: 0.3s; cursor: pointer; }
        .btn-genesis-v2:hover:not(:disabled) { transform: translateY(-2px); background: #00bacf; }
        .btn-genesis-outline-v2 { background: transparent; color: white !important; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 15px; cursor: pointer; }
        .event-selector-v2 { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); padding: 15px; border-radius: 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
        .event-selector-v2.selected { border-color: #0dcaf0; background: rgba(13, 202, 240, 0.1); }
        .check-icon { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.2); border-radius: 5px; display: flex; align-items: center; justify-content: center; }
        .check-icon.checked { background: #0dcaf0; border-color: #0dcaf0; }
        .select-arrow { 
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%230dcaf0' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e"); 
            background-repeat: no-repeat; 
            background-position: right 0.75rem center; 
            background-size: 16px 12px; 
            appearance: none; 
        }
        .btn-outline-cyan-v2 { color: #0dcaf0; border: 1px dashed #0dcaf0; background: transparent; padding: 10px; border-radius: 10px; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default Register;