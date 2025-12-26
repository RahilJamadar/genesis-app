import React, { useState, useEffect } from 'react';
import axios from 'axios';
import getApiBase from '../utils/getApiBase';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const baseURL = getApiBase();
  const navigate = useNavigate();

  const [teamInfo, setTeamInfo] = useState({
    college: '',
    faculty: '',
    leaderName: '',
    leaderEmail: '',
    leaderPhone: '',
    selectedTrophyEvents: [],
    selectedOpenEvents: []
  });

  const [eventParticipants, setEventParticipants] = useState({});

  useEffect(() => {
    axios.get(`${baseURL}/api/admin/events/public`)
      .then(res => setEvents(res.data))
      .catch(() => toast.error("Failed to sync with event database."));
  }, [baseURL]);

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
      if (!college || !faculty || !leaderName || !leaderEmail || !leaderPhone)
        return toast.error("Complete all institution and leader details.");
      setStep(2);
    } else if (currentStep === 2) {
      if (teamInfo.selectedTrophyEvents.length === 0)
        return toast.error("Select at least one Trophy event.");
      setStep(3);
    } else if (currentStep === 3) {
      setStep(4);
    }
    window.scrollTo(0, 0);
  };

  const finalizeRegistration = async () => {
    const allSelectedIds = [...teamInfo.selectedTrophyEvents, ...teamInfo.selectedOpenEvents];

    // 1. Frontend Validation
    for (let id of allSelectedIds) {
      const members = eventParticipants[id];
      if (!members || members.some(m => !m.name || !m.phone)) {
        const evName = events.find(e => e._id === id)?.name;
        return toast.error(`Fill all member details for ${evName}`);
      }
    }

    setLoading(true);
    try {
      // 2. Data Transformation (Flattens eventParticipants into Schema's "members" array)
      const flattenedMembers = [];
      Object.entries(eventParticipants).forEach(([eventId, participants]) => {
        const eventName = events.find(e => e._id === eventId)?.name;
        participants.forEach(p => {
          flattenedMembers.push({
            name: p.name,
            contact: p.phone, // mapping 'phone' to 'contact'
            diet: p.diet,
            events: [eventName]
          });
        });
      });

      // 3. Payload Construction (Mapping frontend names to backend schema names)
      const payload = {
        college: teamInfo.college,
        faculty: teamInfo.faculty,
        leader: teamInfo.leaderName,   // leaderName -> leader
        email: teamInfo.leaderEmail,    // leaderEmail -> email
        contact: teamInfo.leaderPhone,  // leaderPhone -> contact
        members: flattenedMembers,      // flattened array
        registeredEvents: allSelectedIds,
        paymentStatus: 'pending'
      };

      const res = await axios.post(`${baseURL}/api/admin/teams`, payload);
      toast.success("Uplink Successful!");
      setTimeout(() => navigate(`/payment/${res.data.team._id}`), 1500);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Registration failed. Please check details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-vh-100 py-4 py-md-5 px-2 font-sans text-white">
      <ToastContainer theme="dark" position="top-center" autoClose={2000} />

      <div className="container-fluid max-w-4xl mx-auto px-1 px-md-3">
        {/* Navigation Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Link to="/" className="text-black text-decoration-none font-mono x-small border border-white border-opacity-20 px-3 py-2 rounded-pill bg-white bg-opacity-5 hover:text-cyan-400">
            <i className="bi bi-arrow-left me-2"></i> EXIT
          </Link>
          <h5 className="text-white font-mono mb-0 tracking-widest uppercase small d-none d-sm-block">Genesis_Registration</h5>
        </div>

        {/* Progress Stepper - Better for Mobile */}
        <div className="d-flex justify-content-between mb-5 px-2">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className="text-center z-10" style={{ flex: 1 }}>
              <div className={`step-circle mx-auto transition-all duration-500 ${step >= num ? 'active' : ''}`}>
                {step > num ? <i className="bi bi-check-lg"></i> : num}
              </div>
              <div className={`x-small mt-2 uppercase fw-bold ${step >= num ? 'text-white' : 'text-white text-opacity-30'}`}>
                {num === 1 ? 'Base' : num === 2 ? 'Trophy' : num === 3 ? 'Open' : 'Crew'}
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="st1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card bg-glass border-white border-opacity-10 p-3 p-md-5 rounded-4">
              <h2 className="text-white font-black mb-1 uppercase tracking-tighter fs-3">Base <span className="text-cyan-400">Uplink</span></h2>
              <p className="text-white text-opacity-50 mb-4 small font-mono">ESTABLISHING_COLLEGE_CONNECTION...</p>

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
                  <input type="text" className="form-control genesis-input" value={teamInfo.leaderName} onChange={e => setTeamInfo({ ...teamInfo, leaderName: e.target.value })} placeholder="Authorized Student" />
                </div>
                <div className="col-12 col-md-6">
                  <label className="text-white x-small mb-1 d-block fw-bold tracking-widest">EMAIL LINK</label>
                  <input type="email" className="form-control genesis-input" value={teamInfo.leaderEmail} onChange={e => setTeamInfo({ ...teamInfo, leaderEmail: e.target.value })} placeholder="leader@email.com" />
                </div>
                <div className="col-12 col-md-6">
                  <label className="text-white x-small mb-1 d-block fw-bold tracking-widest">PHONE COMM</label>
                  <input type="text" className="form-control genesis-input" value={teamInfo.leaderPhone} onChange={e => setTeamInfo({ ...teamInfo, leaderPhone: e.target.value })} placeholder="+91 XXX..." />
                </div>
              </div>
              <button className="btn-genesis-v2 w-100 mt-5" onClick={() => validateStep(1)}>CHOOSE EVENTS</button>
            </motion.div>
          )}

          {/* STEP 2: TROPHY EVENTS */}
          {step === 2 && (
            <motion.div key="st2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card bg-glass border-white border-opacity-10 p-3 p-md-5 rounded-4">
              <h2 className="text-white font-black mb-2 uppercase tracking-tighter fs-3">Trophy <span className="text-cyan-400">Sector</span></h2>

              {/* Protocol Box: Clean High Contrast */}
              <div className="p-3 mb-4 rounded bg-dark border border-cyan-500 border-opacity-30">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-cyan-500 p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                    <i className="bi bi-info-lg text-black fw-bold"></i>
                  </div>
                  <p className="mb-0 text-white small leading-sm">
                    <span className="fw-bold text-cyan-400 font-mono uppercase">Protocol:</span> To qualify for the Overall Trophy, you <span className="text-cyan-400 fw-bold underline">MUST</span> participate in all events below.
                  </p>
                </div>
              </div>

              <div className="row g-2 mb-4">
                {events.filter(e => e.isTrophyEvent).map(ev => {
                  const isSelected = teamInfo.selectedTrophyEvents.includes(ev._id);
                  return (
                    <div key={ev._id} className="col-12 col-sm-6">
                      <div
                        className={`event-selector-v2 ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleEventToggle(ev, 'trophy')}
                      >
                        <div className="d-flex justify-content-between align-items-center w-100">
                          <span className="event-name">{ev.name}</span>
                          <div className={`check-icon ${isSelected ? 'checked' : ''}`}>
                            {isSelected ? <i className="bi bi-check-lg"></i> : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="d-flex gap-3">
                <button className="btn-genesis-outline-v2 w-50" onClick={() => setStep(1)}>
                  <i className="bi bi-arrow-left me-2"></i>BACK
                </button>
                <button className="btn-genesis-v2 w-50" onClick={() => validateStep(2)}>
                  NEXT SECTOR<i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="st3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card bg-glass border-white border-opacity-10 p-3 p-md-5 rounded-4">
              <h2 className="text-white font-black mb-1 uppercase tracking-tighter fs-3">Open <span className="text-cyan-400">Arena</span></h2>
              <p className="text-white text-opacity-50 mb-4 small font-mono uppercase tracking-widest">Optional_Modules_Detected</p>

              {/* Note for Open Events */}
              <div className="p-3 mb-4 rounded bg-white bg-opacity-5 border border-white border-opacity-10">
                <p className="mb-0 text-black text-opacity-70 small leading-sm">
                  <i className="bi bi-info-circle text-cyan-400 me-2"></i>
                  These events carry independent registration fees and do not count toward the overall trophy points.
                </p>
              </div>

              <div className="row g-2 mb-4">
                {events.filter(e => !e.isTrophyEvent).map(ev => {
                  const isSelected = teamInfo.selectedOpenEvents.includes(ev._id);
                  return (
                    <div key={ev._id} className="col-12 col-sm-6">
                      <div
                        className={`event-selector-v2 ${isSelected ? 'selected-open' : ''}`}
                        onClick={() => handleEventToggle(ev, 'open')}
                      >
                        <div className="d-flex justify-content-between align-items-center w-100">
                          <span className="event-name">{ev.name}</span>
                          <div className={`check-icon ${isSelected ? 'checked-open' : ''}`}>
                            {isSelected ? <i className="bi bi-controller"></i> : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="d-flex gap-3">
                <button className="btn-genesis-outline-v2 w-50" onClick={() => setStep(2)}>
                  <i className="bi bi-arrow-left me-2"></i>BACK
                </button>
                <button className="btn-genesis-v2 w-50 shadow-cyan" onClick={() => validateStep(3)}>
                  CREW LIST<i className="bi bi-people-fill ms-2"></i>
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
  <motion.div key="st4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card bg-glass border-white border-opacity-10 p-3 p-md-5 rounded-4 shadow-2xl">
    <h2 className="text-white font-black mb-1 uppercase tracking-tighter fs-3 fs-md-1">Crew <span className="text-cyan-400">Manifest</span></h2>
    <p className="text-white text-opacity-50 mb-4 mb-md-5 small font-mono uppercase tracking-widest">Verification_Protocol_Active</p>

    {[...teamInfo.selectedTrophyEvents, ...teamInfo.selectedOpenEvents].map(id => {
      const event = events.find(e => e._id === id);
      if (!event) return null;

      return (
        <div key={id} className="mb-5 p-3 p-md-4 rounded-4 bg-black bg-opacity-5 border border-white border-opacity-2 shadow-sm">
          {/* Header Bar */}
          <div className="d-flex justify-content-between align-items-center border-bottom border-white border-opacity-5 pb-3 mb-4">
            <h5 className="text-white font-mono mb-0 uppercase tracking-widest fw-bold fs-6 fs-md-4">
              <i className="bi bi-cpu-fill me-2"></i>{event.name}
            </h5>
            <span className="badge rounded-pill bg-cyan-500 bg-opacity-10 text-cyan-400 border border-cyan-100 border-opacity-20 font-mono py-2 px-3">
              {eventParticipants[id]?.length || 0} / {event.maxParticipants} UNITS
            </span>
          </div>

          <div className="member-entries">
            {eventParticipants[id]?.map((member, idx) => (
              <div key={idx} className={`mb-4 pb-4 ${idx !== eventParticipants[id].length - 1 ? 'border-bottom border-white border-opacity-5' : ''}`}>
                <div className="row g-3">
                  <div className="col-12 col-md-5">
                    <label className="x-small-label mb-2 uppercase tracking-wider text-white fs-md-6">Legal Name</label>
                    <input 
                      type="text" 
                      className="form-control genesis-input-v2 py-md-3 fs-md-5" 
                      value={member.name} 
                      placeholder="Enter Full Name"
                      onChange={e => updateMember(id, idx, 'name', e.target.value)} 
                    />
                  </div>
                  <div className="col-7 col-md-4">
                    <label className="x-small-label mb-2 uppercase tracking-wider fs-md-6">Comm Link</label>
                    <input 
                      type="text" 
                      className="form-control genesis-input-v2 py-md-3 fs-md-5" 
                      value={member.phone} 
                      placeholder="Phone No."
                      onChange={e => updateMember(id, idx, 'phone', e.target.value)} 
                    />
                  </div>
                  <div className="col-5 col-md-3">
                    <label className="x-small-label mb-2 uppercase tracking-wider fs-md-6">Dietary</label>
                    <select 
                      className="form-select genesis-input-v2 py-md-3 fs-md-5" 
                      value={member.diet} 
                      onChange={e => updateMember(id, idx, 'diet', e.target.value)}
                    >
                      <option value="veg">VEG</option>
                      <option value="non-veg">NON-VEG</option>
                    </select>
                  </div>
                </div>
                
                {eventParticipants[id].length > event.minParticipants && (
                  <div className="text-end mt-2">
                    <button 
                      className="btn btn-link text-danger text-decoration-none x-small fw-bold p-0 hover:opacity-75" 
                      onClick={() => removeMemberRow(id, idx)}
                    >
                      <i className="bi bi-trash3 me-1"></i>REMOVE_UNIT
                    </button>
                  </div>
                )}
              </div>
            ))}

            {eventParticipants[id]?.length < event.maxParticipants && (
              <button 
                className="btn btn-outline-cyan-v2 btn-sm font-mono w-100 py-3 mt-2 fs-md-6" 
                onClick={() => addMemberRow(event)}
              >
                <i className="bi bi-plus-lg me-2"></i>ADD_NEW_UNIT_ENTRY
              </button>
            )}
          </div>
        </div>
      );
    })}

    {/* Footer Navigation */}
    <div className="d-flex gap-3 mt-4 mt-md-5">
      <button className="btn-genesis-outline-v2 w-50 py-md-4 fs-md-5" onClick={() => setStep(3)}>
        <i className="bi bi-arrow-left me-2"></i>BACK
      </button>
      <button 
        className="btn-genesis-v2 w-50 shadow-cyan py-md-4 fs-md-5" 
        onClick={finalizeRegistration} 
        disabled={loading}
      >
        {loading ? (
          <><span className="spinner-border spinner-border-sm me-2"></span>SYNCING...</>
        ) : (
          <>FINALIZE UPLINK<i className="bi bi-shield-lock-fill ms-2"></i></>
        )}
      </button>
    </div>
  </motion.div>
)}
        </AnimatePresence>
      </div>

      <style>{`
  /* Core Theme & Layout */
  /* Custom Desktop Scaling */
@media (min-width: 992px) {
  .fs-md-1 { font-size: 3.5rem !important; }
  .fs-md-4 { font-size: 1.5rem !important; }
  .fs-md-5 { font-size: 1.1rem !important; }
  .fs-md-6 { font-size: 0.9rem !important; }
  .x-small-label { font-size: 0.75rem !important; }
}

/* Input Fields - Pure Dark Background with Cyan Accents */
.genesis-input-v2 {
  background: rgba(0, 0, 0, 0.4) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
  border-radius: 12px !important;
  transition: all 0.3s ease;
}

.genesis-input-v2:focus {
  background: rgba(0, 0, 0, 0.6) !important;
  border-color: #0dcaf0 !important;
  box-shadow: 0 0 20px rgba(13, 202, 240, 0.1) !important;
  outline: none;
}

/* Labels - Explicit Cyan Monospace */
.x-small-label {
  font-size: 0.6rem;
  font-weight: 800;
  font-family: 'Monaco', 'Consolas', monospace;
  color: #0dcaf0 !important;
  opacity: 0.8;
}

/* Button with dashed border for 'Add' action */
.btn-outline-cyan-v2 {
  color: #0dcaf0;
  border: 1px dashed rgba(13, 202, 240, 0.4);
  background: transparent;
  font-weight: bold;
  border-radius: 12px;
  transition: all 0.2s;
}

.btn-outline-cyan-v2:hover {
  background: rgba(13, 202, 240, 0.05);
  border-style: solid;
  border-color: #0dcaf0;
}
  .bg-glass { 
    background: rgba(10, 10, 10, 0.85); 
    backdrop-filter: blur(20px); 
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px; 
  }
  
  .leading-sm { line-height: 1.4; }
  .x-small { font-size: 0.65rem; letter-spacing: 1.5px; font-weight: 700; color: white; text-transform: uppercase; }

  /* Progress Stepper */
  .step-circle { 
    width: 32px; height: 32px; line-height: 32px; 
    border-radius: 50%; background: #1a1a1a; color: white; 
    font-family: monospace; font-size: 0.8rem; font-weight: bold; 
    border: 1px solid #333; transition: all 0.3s ease;
  }
  @media (min-width: 768px) { .step-circle { width: 42px; height: 42px; line-height: 42px; font-size: 1rem; } }
  .step-circle.active { 
    background: #0dcaf0; color: #000; 
    box-shadow: 0 0 15px rgba(13, 202, 240, 0.4); 
    border-color: #0dcaf0; 
  }

  /* Desktop Font Scaling Utilities */
  @media (min-width: 992px) {
    .fs-md-1 { font-size: 3.5rem !important; }
    .fs-md-4 { font-size: 1.5rem !important; }
    .fs-md-5 { font-size: 1.1rem !important; }
    .fs-md-6 { font-size: 0.9rem !important; }
    .x-small-label { font-size: 0.75rem !important; }
  }

  /* Input Fields (Step 1 & 4) */
  .genesis-input, .genesis-input-v2 {
    background: rgba(255, 255, 255, 0.03) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    color: #ffffff !important;
    padding: 12px 15px !important;
    border-radius: 12px !important;
    transition: all 0.3s ease;
  }
  .genesis-input:focus, .genesis-input-v2:focus {
    background: rgba(255, 255, 255, 0.07) !important;
    border-color: #0dcaf0 !important;
    box-shadow: 0 0 20px rgba(13, 202, 240, 0.1) !important;
    outline: none;
  }
  .x-small-label {
    font-size: 0.6rem; font-weight: 800;
    font-family: 'Monaco', 'Consolas', monospace;
    color: #0dcaf0;
  }

  /* Select & Dropdown Styling */
  .form-select.genesis-input-v2 {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%230dcaf0' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 16px 12px;
  }

  /* Event Selectors (Step 2 & 3) */
  .event-selector-v2 {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 16px; border-radius: 12px;
    cursor: pointer; transition: all 0.2s ease;
    display: flex; align-items: center; justify-content: space-between;
  }
  .event-selector-v2 .event-name { color: #ffffff; font-weight: 600; font-size: 0.9rem; }
  
  /* Step 2: Trophy Selection State */
  .event-selector-v2.selected {
    background: rgba(13, 202, 240, 0.1);
    border-color: #0dcaf0;
    box-shadow: 0 0 15px rgba(13, 202, 240, 0.2);
  }
  .event-selector-v2.selected .event-name { color: #0dcaf0; }

  /* Step 3: Open Selection State */
  .event-selector-v2.selected-open {
    background: rgba(255, 255, 255, 0.1);
    border-color: #ffffff;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
  }

  /* Checkbox & Icons */
  .check-icon {
    width: 22px; height: 22px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px; display: flex; align-items: center; justify-content: center;
  }
  .check-icon.checked { background: #0dcaf0; border-color: #0dcaf0; color: #000; }
  .check-icon.checked-open { background: #ffffff; border-color: #ffffff; color: #000; }

  /* Buttons */
  .btn-genesis-v2 {
    background: #0dcaf0; color: #000 !important;
    font-weight: 900; border: none; padding: 14px;
    border-radius: 12px; text-transform: uppercase;
    letter-spacing: 1.5px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .btn-genesis-v2:hover:not(:disabled) {
    transform: translateY(-3px); background: #00bacf;
    box-shadow: 0 10px 30px rgba(13, 202, 240, 0.4);
  }
  .btn-genesis-outline-v2 {
    background: transparent; color: #fff !important;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 14px; border-radius: 12px;
    font-weight: 700; transition: all 0.3s ease;
  }
  .btn-genesis-outline-v2:hover { background: rgba(255, 255, 255, 0.05); border-color: #fff; }

  .btn-outline-cyan-v2 {
    color: #0dcaf0; border: 1px dashed rgba(13, 202, 240, 0.4);
    background: transparent; font-size: 0.75rem; font-weight: bold;
    border-radius: 8px; transition: all 0.2s;
  }
  .btn-outline-cyan-v2:hover { background: rgba(13, 202, 240, 0.05); border-style: solid; border-color: #0dcaf0; }

  /* Mobile Overrides */
  @media (max-width: 576px) {
    .card.bg-glass { padding: 1.25rem !important; }
    .btn-genesis-v2, .btn-genesis-outline-v2 { padding: 12px; font-size: 0.8rem; }
  }
`}</style>
    </div>
  );
};

export default Register;