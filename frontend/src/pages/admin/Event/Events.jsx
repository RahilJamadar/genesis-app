import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';

const categories = ['Tech', 'Cultural', 'Gaming', 'Sports', 'Pre-events'];

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [coordinatorList, setCoordinatorList] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State for the creation form
  const [newEvent, setNewEvent] = useState({
    name: '',
    category: '',
    judges: [],
    studentCoordinators: [],
    rules: '',
    rounds: 1,
    minParticipants: 1,
    maxParticipants: 1,
    isTrophyEvent: true, 
    isDirectWin: false, // 🚀 NEW: Direct Win Toggle state
    judgingCriteria: ['', '', ''] 
  });

  const [facultyInput, setFacultyInput] = useState('');
  const [coordinatorInput, setCoordinatorInput] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventRes, facultyRes, coordRes] = await Promise.all([
        adminApi.get('/events'),
        adminApi.get('/faculty'),
        adminApi.get('/student-coordinators')
      ]);
      setEvents(eventRes.data);
      setFacultyList(facultyRes.data);
      setCoordinatorList(coordRes.data);
    } catch (err) {
      toast.error('❌ Failed to fetch event data');
    }
  };

  const handleNumberChange = (field, value) => {
    if (value === '') {
      setNewEvent(prev => ({ ...prev, [field]: '' }));
    } else {
      const num = parseInt(value, 10);
      setNewEvent(prev => ({ ...prev, [field]: isNaN(num) ? '' : num }));
    }
  };

  const handleCriteriaChange = (index, value) => {
    const updatedCriteria = [...newEvent.judgingCriteria];
    updatedCriteria[index] = value;
    setNewEvent({ ...newEvent, judgingCriteria: updatedCriteria });
  };

  const handleAddFaculty = () => {
    if (facultyInput && !newEvent.judges.includes(facultyInput)) {
      setNewEvent({ ...newEvent, judges: [...newEvent.judges, facultyInput] });
      setFacultyInput('');
    }
  };

  const handleAddCoordinator = () => {
    if (coordinatorInput && !newEvent.studentCoordinators.includes(coordinatorInput)) {
      setNewEvent({ ...newEvent, studentCoordinators: [...newEvent.studentCoordinators, coordinatorInput] });
      setCoordinatorInput('');
    }
  };

  const handleRemoveStaff = (type, index) => {
    const updated = [...newEvent[type]];
    updated.splice(index, 1);
    setNewEvent({ ...newEvent, [type]: updated });
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    
    const finalMin = Number(newEvent.minParticipants) || 1;
    const finalMax = Number(newEvent.maxParticipants) || 1;

    // 🏆 LOGIC: If it's a Direct Win or NOT a Trophy event, judging criteria are not required.
    const needsCriteria = newEvent.isTrophyEvent && !newEvent.isDirectWin;

    if (needsCriteria && newEvent.judgingCriteria.some(c => c.trim() === '')) {
      return toast.warn('⚠️ Please provide all 3 judging criteria');
    }
    if (finalMax < finalMin) {
      return toast.error(`❌ Max (${finalMax}) cannot be less than Min (${finalMin})`);
    }
    
    // Only require judges if it's a Trophy Event
    if (newEvent.isTrophyEvent && newEvent.judges.length === 0) {
      return toast.warn('⚠️ Assign at least one judge for trophy events');
    }

    setLoading(true);
    try {
      const payload = {
        ...newEvent,
        minParticipants: finalMin,
        maxParticipants: finalMax,
        rounds: Number(newEvent.rounds),
        // If criteria not needed, send empty array to satisfy backend but bypass 3-field requirement
        judgingCriteria: needsCriteria ? newEvent.judgingCriteria : []
      };

      const res = await adminApi.post('/events', payload);
      const addedEvent = res.data.event || res.data;
      
      setEvents([addedEvent, ...events]);
      toast.success('🎉 Event created successfully!');
      
      // Reset Form
      setNewEvent({
        name: '', category: '', judges: [], studentCoordinators: [],
        rules: '', rounds: 1, minParticipants: 1, maxParticipants: 1, 
        isTrophyEvent: true, isDirectWin: false, judgingCriteria: ['', '', '']
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will remove all associated scores.')) return;
    try {
      await adminApi.delete(`/events/${id}`);
      setEvents(events.filter(e => e._id !== id));
      toast.success('🗑️ Event deleted');
    } catch (err) {
      toast.error('Failed to delete event');
    }
  };

  return (
    <div className="d-flex bg-dark min-vh-100">
      <Navbar />
      
      <main className="dashboard-content flex-grow-1 p-4 p-lg-5">
        <ToastContainer theme="dark" position="top-right" />

        <header className="mb-5">
          <h2 className="fw-bold text-white mb-1">Event Management</h2>
          <p className="text-light opacity-75">Configure categories, markers, and assignments</p>
        </header>

        <div className="row g-4">
          {/* LEFT: CREATION FORM */}
          <div className="col-xl-5">
            <div className="card bg-glass border-secondary shadow-lg">
              <div className="card-body p-4">
                <h5 className="text-white fw-bold mb-4">Create New Event</h5>
                <form onSubmit={handleAddEvent}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="text-info x-small fw-bold mb-2 text-uppercase">Event Name</label>
                      <input type="text" className="form-control bg-dark text-white border-secondary shadow-none" 
                        value={newEvent.name} onChange={e => setNewEvent({...newEvent, name: e.target.value})} required />
                    </div>

                    <div className="col-md-6">
                      <label className="text-info x-small fw-bold mb-2 text-uppercase">Category</label>
                      <select className="form-select bg-dark text-white border-secondary shadow-none"
                        value={newEvent.category} onChange={e => setNewEvent({...newEvent, category: e.target.value})} required>
                        <option value="">Select Category</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="text-info x-small fw-bold mb-2 text-uppercase">Total Rounds</label>
                      <select className="form-select bg-dark text-white border-secondary shadow-none"
                        value={newEvent.rounds} onChange={e => setNewEvent({...newEvent, rounds: parseInt(e.target.value)})}>
                        {[1, 2, 3].map(n => <option key={n} value={n}>{n} Round{n > 1 ? 's' : ''}</option>)}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="text-info x-small fw-bold mb-2 text-uppercase">Min Members</label>
                      <input type="number" className="form-control bg-dark text-white border-secondary shadow-none" 
                        value={newEvent.minParticipants} onChange={e => handleNumberChange('minParticipants', e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <label className="text-info x-small fw-bold mb-2 text-uppercase">Max Members</label>
                      <input type="number" className="form-control bg-dark text-white border-secondary shadow-none" 
                        value={newEvent.maxParticipants} onChange={e => handleNumberChange('maxParticipants', e.target.value)} required />
                    </div>

                    {/* ✅ MARKER TOGGLES */}
                    <div className="col-12">
                      <div className="bg-dark bg-opacity-50 p-3 rounded border border-secondary">
                        <div className="form-check form-switch d-flex align-items-center justify-content-between mb-3">
                          <label className="form-check-label text-white fw-bold small">🏆 INCLUDE IN TROPHY?</label>
                          <input className="form-check-input ms-0" type="checkbox" role="switch" checked={newEvent.isTrophyEvent} 
                            onChange={e => setNewEvent({...newEvent, isTrophyEvent: e.target.checked})} />
                        </div>
                        
                        {newEvent.isTrophyEvent && (
                          <div className="form-check form-switch d-flex align-items-center justify-content-between animate-fade-in">
                            <label className="form-check-label text-warning fw-bold small">⚡ DIRECT WIN (NO CRITERIA)?</label>
                            <input className="form-check-input ms-0" type="checkbox" role="switch" checked={newEvent.isDirectWin} 
                              onChange={e => setNewEvent({...newEvent, isDirectWin: e.target.checked})} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ✅ CONDITIONAL JUDGING CRITERIA */}
                    {newEvent.isTrophyEvent && !newEvent.isDirectWin && (
                      <div className="col-12 bg-info bg-opacity-10 p-3 rounded border border-info border-opacity-25 animate-fade-in">
                        <label className="text-info x-small fw-bold mb-3 d-block text-uppercase">Judging Criteria (Exactly 3)</label>
                        {newEvent.judgingCriteria.map((val, i) => (
                          <input key={i} type="text" className="form-control bg-dark text-white border-info border-opacity-25 mb-2 shadow-none"
                            placeholder={`Criteria ${i + 1}`} value={val} 
                            onChange={e => handleCriteriaChange(i, e.target.value)} required />
                        ))}
                      </div>
                    )}

                    <div className="col-12">
                      <label className="text-info x-small fw-bold mb-2 text-uppercase">Assign Judges</label>
                      <div className="input-group mb-2">
                        <select className="form-select bg-dark text-white border-secondary shadow-none" 
                          value={facultyInput} onChange={e => setFacultyInput(e.target.value)}>
                          <option value="">Select Faculty...</option>
                          {facultyList.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                        </select>
                        <button type="button" className="btn btn-info" onClick={handleAddFaculty}>Add</button>
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {newEvent.judges.map((id, index) => (
                          <span key={index} className="badge bg-secondary p-2 d-flex align-items-center gap-2">
                            {facultyList.find(f => f._id === id)?.name}
                            <i className="bi bi-x-circle cursor-pointer text-danger" onClick={() => handleRemoveStaff('judges', index)}></i>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="text-info x-small fw-bold mb-2 text-uppercase">Assign Coordinators</label>
                      <div className="input-group mb-2">
                        <select className="form-select bg-dark text-white border-secondary shadow-none" 
                          value={coordinatorInput} onChange={e => setCoordinatorInput(e.target.value)}>
                          <option value="">Select Coordinator...</option>
                          {coordinatorList.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                        <button type="button" className="btn btn-info" onClick={handleAddCoordinator}>Add</button>
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {newEvent.studentCoordinators.map((id, index) => (
                          <span key={index} className="badge bg-secondary p-2 d-flex align-items-center gap-2">
                            {coordinatorList.find(c => c._id === id)?.name}
                            <i className="bi bi-x-circle cursor-pointer text-danger" onClick={() => handleRemoveStaff('studentCoordinators', index)}></i>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="text-info x-small fw-bold mb-2 text-uppercase">Rules & Description</label>
                      <textarea className="form-control bg-dark text-white border-secondary shadow-none"
                        rows="3" value={newEvent.rules} onChange={e => setNewEvent({...newEvent, rules: e.target.value})} required></textarea>
                    </div>

                    <div className="col-12 mt-4">
                      <button type="submit" className="btn btn-info w-100 fw-bold py-3 shadow-lg" disabled={loading}>
                        {loading ? <span className="spinner-border spinner-border-sm"></span> : 'CREATE EVENT'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* RIGHT: LIST OF EVENTS */}
          <div className="col-xl-7">
            <div className="row g-3">
              {events.map(event => (
                <div key={event._id} className="col-md-6">
                  <div className="card bg-glass border-secondary h-100 event-card shadow-sm">
                    <div className="card-body p-4 d-flex flex-column h-100 text-white">
                      <div className="d-flex justify-content-between mb-3">
                        <div>
                          <h5 className="fw-bold mb-1">{event.name}</h5>
                          <span className="badge bg-info bg-opacity-25 text-info border border-info border-opacity-25 x-small">{event.category}</span>
                        </div>
                        <div className="d-flex gap-2">
                          {event.isDirectWin && <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 py-2 px-2"><i className="bi bi-lightning-fill"></i></span>}
                          {event.isTrophyEvent && <i className="bi bi-trophy-fill text-warning fs-4"></i>}
                        </div>
                      </div>
                      <div className="mb-4 flex-grow-1 opacity-50 small">
                        <div className="mb-1"><i className="bi bi-layers me-2 text-info"></i> {event.rounds} Round{event.rounds > 1 ? 's' : ''}</div>
                        <div>
                          <i className="bi bi-people me-2 text-info"></i> 
                          {event.minParticipants === event.maxParticipants 
                            ? `Size: ${event.minParticipants}` 
                            : `Size: ${event.minParticipants}-${event.maxParticipants}`}
                        </div>
                      </div>
                      <div className="d-flex gap-2 border-top border-secondary pt-3">
                        <button className="btn btn-outline-light btn-sm flex-grow-1 fw-bold" onClick={() => navigate(`/admin/events/view/${event._id}`)}>DETAILS</button>
                        <button className="btn btn-outline-warning btn-sm" onClick={() => navigate(`/admin/events/edit/${event._id}`)}><i className="bi bi-pencil"></i></button>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(event._id)}><i className="bi bi-trash"></i></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .dashboard-content { margin-left: 260px; }
        .bg-glass { background: rgba(255, 255, 255, 0.03) !important; backdrop-filter: blur(12px); border-radius: 18px; }
        .event-card { transition: transform 0.2s ease; border: 1px solid rgba(255,255,255,0.1); }
        .event-card:hover { transform: translateY(-5px); border-color: #0dcaf0 !important; }
        .x-small { font-size: 0.65rem; letter-spacing: 0.5px; }
        .cursor-pointer { cursor: pointer; }
        .form-check-input:checked { background-color: #0dcaf0; border-color: #0dcaf0; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 991.98px) { .dashboard-content { margin-left: 0; padding-top: 80px; } }
      `}</style>
    </div>
  );
};

export default Events;