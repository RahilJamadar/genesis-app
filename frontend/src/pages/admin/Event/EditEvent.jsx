import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { toast } from 'react-toastify';
const categories = ['Tech', 'Cultural', 'Gaming', 'Sports', 'Pre-events'];

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [coordinatorList, setCoordinatorList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [facultyInput, setFacultyInput] = useState('');
  const [coordinatorInput, setCoordinatorInput] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, facultyRes, coordinatorRes] = await Promise.all([
          adminApi.get(`/events/${id}`),
          adminApi.get('/faculty'),
          adminApi.get('/student-coordinators')
        ]);

        const raw = eventRes.data;

        setEvent({
          ...raw,
          judges: Array.isArray(raw.judges) ? raw.judges.map(j => j._id || j) : [],
          studentCoordinators: Array.isArray(raw.studentCoordinators) ? raw.studentCoordinators.map(s => s._id || s) : [],
          rounds: Number(raw.rounds) || 1,
          isTrophyEvent: raw.isTrophyEvent ?? true,
          isDirectWin: raw.isDirectWin ?? false,
          minParticipants: Number(raw.minParticipants) || 1,
          maxParticipants: Number(raw.maxParticipants) || 1,
          judgingCriteria: (raw.judgingCriteria && raw.judgingCriteria.length === 3) 
            ? raw.judgingCriteria 
            : ['', '', '']
        });

        setFacultyList(facultyRes.data || []);
        setCoordinatorList(coordinatorRes.data || []);
      } catch (err) {
        toast.error('❌ Failed to fetch event data');
      }
    };

    fetchData();
  }, [id]);

  const handleNumberChange = (field, value) => {
    if (value === '') {
      setEvent(prev => ({ ...prev, [field]: '' }));
    } else {
      const num = parseInt(value, 10);
      setEvent(prev => ({ ...prev, [field]: isNaN(num) ? '' : num }));
    }
  };

  const handleChange = (field, value) => {
    setEvent(prev => ({ ...prev, [field]: value }));
  };

  const handleCriteriaChange = (index, value) => {
    const updated = [...event.judgingCriteria];
    updated[index] = value;
    setEvent({ ...event, judgingCriteria: updated });
  };

  const handleSave = async () => {
    const finalMin = Number(event.minParticipants);
    const finalMax = Number(event.maxParticipants);
    const needsCriteria = event.isTrophyEvent && !event.isDirectWin;

    if (needsCriteria && event.judgingCriteria.some(c => !c || c.trim() === '')) {
      return toast.warn('⚠️ All 3 judging criteria must be filled');
    }

    if (finalMax < finalMin) {
      return toast.error(`❌ Max (${finalMax}) cannot be less than Min (${finalMin})`);
    }

    setLoading(true);
    try {
      const { _id, createdAt, updatedAt, __v, ...cleanData } = event;
      const payload = {
        ...cleanData,
        minParticipants: finalMin,
        maxParticipants: finalMax,
        rounds: Number(event.rounds),
        judgingCriteria: needsCriteria ? event.judgingCriteria : [],
        judges: event.judges.map(j => j._id || j),
        studentCoordinators: event.studentCoordinators.map(s => s._id || s)
      };

      await adminApi.put(`/events/${id}`, payload);
      toast.success('✅ Event updated successfully');
      setTimeout(() => navigate('/admin/events'), 1500);
    } catch (err) {
      toast.error(`❌ ${err.response?.data?.error || 'Failed to save changes'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!event) return (
    <div className="bg-dark min-vh-100 d-flex align-items-center justify-content-center text-white">
      <div className="spinner-border text-info" role="status"></div>
    </div>
  );

  return (
    <div className="d-flex bg-dark min-vh-100 flex-column flex-lg-row">
      <Navbar />
      
      <main className="dashboard-content flex-grow-1 p-3 p-md-4 p-lg-5">
        <header className="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="text-center text-md-start">
            <h2 className="fw-bold text-white mb-1 fs-3 fs-md-2">Edit Event: <span className="text-info">{event.name}</span></h2>
            <p className="text-light opacity-75 small">Modify markers, capacity, and staff panel</p>
          </div>
          <button className="btn btn-outline-secondary btn-sm w-100 w-md-auto" onClick={() => navigate('/admin/events')}>
            <i className="bi bi-arrow-left me-2"></i>Back to List
          </button>
        </header>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card bg-glass border-secondary shadow-lg mb-4 border-opacity-10">
              <div className="card-body p-3 p-md-4 text-white">
                <h5 className="text-white fw-bold mb-4 border-bottom border-white border-opacity-10 pb-3 fs-6">Configuration</h5>
                
                <div className="row g-3">
                  <div className="col-12 mb-2">
                    <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Event Name</label>
                    <input type="text" className="form-control bg-dark text-white border-secondary shadow-none py-2" 
                      value={event.name ?? ''} onChange={e => handleChange('name', e.target.value)} />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Category</label>
                    <select className="form-select bg-dark text-white border-secondary shadow-none py-2" 
                      value={event.category ?? ''} onChange={e => handleChange('category', e.target.value)}>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Rounds</label>
                    <select className="form-select bg-dark text-white border-secondary shadow-none py-2" 
                      value={event.rounds ?? 1} onChange={e => handleChange('rounds', parseInt(e.target.value))}>
                      {[1, 2, 3].map(n => <option key={n} value={n}>{n} Round{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>

                  <div className="col-6">
                    <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Min Members</label>
                    <input type="number" className="form-control bg-dark text-white border-secondary shadow-none py-2" 
                      value={event.minParticipants} onChange={e => handleNumberChange('minParticipants', e.target.value)} />
                  </div>
                  <div className="col-6">
                    <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Max Members</label>
                    <input type="number" className="form-control bg-dark text-white border-secondary shadow-none py-2" 
                      value={event.maxParticipants} onChange={e => handleNumberChange('maxParticipants', e.target.value)} />
                  </div>

                  <div className="col-12 mt-2">
                    <div className="bg-black bg-opacity-40 p-3 rounded border border-secondary border-opacity-20 shadow-sm">
                      <div className="form-check form-switch d-flex align-items-center justify-content-between mb-3">
                        <label className="form-check-label text-white fw-bold small">🏆 INCLUDE IN TROPHY?</label>
                        <input className="form-check-input ms-0" type="checkbox" role="switch" checked={event.isTrophyEvent} 
                            onChange={e => handleChange('isTrophyEvent', e.target.checked)} />
                      </div>
                      
                      {event.isTrophyEvent && (
                        <div className="form-check form-switch d-flex align-items-center justify-content-between border-top border-secondary border-opacity-20 pt-3">
                          <label className="form-check-label text-warning fw-bold small">⚡ DIRECT WIN (NO CRITERIA)?</label>
                          <input className="form-check-input ms-0" type="checkbox" role="switch" checked={event.isDirectWin} 
                            onChange={e => handleChange('isDirectWin', e.target.checked)} />
                        </div>
                      )}
                    </div>
                  </div>

                  {event.isTrophyEvent && !event.isDirectWin && (
                    <div className="col-12 mt-4 bg-info bg-opacity-10 p-3 rounded border border-info border-opacity-25 animate-fade-in shadow-sm">
                      <label className="text-info x-small fw-bold mb-3 d-block text-uppercase ls-1 text-center text-md-start">Judging Criteria (Exactly 3)</label>
                      {event.judgingCriteria?.map((val, i) => (
                        <div key={i} className="input-group mb-2 shadow-sm">
                          <span className="input-group-text bg-dark border-secondary text-info fw-bold">C{i+1}</span>
                          <input type="text" className="form-control bg-dark text-white border-secondary shadow-none py-2"
                            placeholder={`Criteria ${i + 1}`} value={val ?? ''} 
                            onChange={e => handleCriteriaChange(i, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="col-12 mt-3">
                    <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Event Rules</label>
                    <textarea className="form-control bg-dark text-white border-secondary shadow-none py-3" rows="5"
                      value={event.rules ?? ''} onChange={e => handleChange('rules', e.target.value)}></textarea>
                  </div>
                </div>
              </div>
            </div>

            <button className="btn btn-info w-100 fw-bold py-3 shadow-lg mb-4" onClick={handleSave} disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-cloud-upload me-2"></i>}
              UPDATE EVENT
            </button>
          </div>

          <div className="col-lg-5">
            <div className="card bg-glass border-secondary shadow-lg border-opacity-10">
              <div className="card-body p-3 p-md-4">
                <h5 className="text-white fw-bold mb-4 border-bottom border-white border-opacity-10 pb-3 fs-6">Staff Panel</h5>
                
                <div className="mb-4">
                  <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Judges</label>
                  <div className="input-group input-group-sm mb-3">
                    <select className="form-select bg-dark text-white border-secondary shadow-none py-2" 
                      value={facultyInput} onChange={e => setFacultyInput(e.target.value)}>
                      <option value="">Select Faculty...</option>
                      {facultyList.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                    </select>
                    <button className="btn btn-info px-3" onClick={() => {
                      if(facultyInput && !event.judges.includes(facultyInput)) {
                        handleChange('judges', [...event.judges, facultyInput]);
                        setFacultyInput('');
                      }
                    }}><i className="bi bi-plus-lg"></i></button>
                  </div>
                  <div className="d-flex flex-column gap-2 mt-2">
                    {event.judges?.map((id, index) => (
                      <div key={index} className="d-flex justify-content-between align-items-center bg-black bg-opacity-30 p-2 px-3 rounded border border-secondary border-opacity-30 shadow-sm">
                        <span className="text-white small">{facultyList.find(f => f._id === id)?.name || 'Faculty Member'}</span>
                        <i className="bi bi-trash text-danger cursor-pointer fs-6" onClick={() => {
                          const updated = [...event.judges]; updated.splice(index, 1); handleChange('judges', updated);
                        }}></i>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Student Coordinators</label>
                  <div className="input-group input-group-sm mb-3">
                    <select className="form-select bg-dark text-white border-secondary shadow-none py-2" 
                      value={coordinatorInput} onChange={e => setCoordinatorInput(e.target.value)}>
                      <option value="">Select Coordinator...</option>
                      {coordinatorList.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                    <button className="btn btn-info px-3" onClick={() => {
                      if(coordinatorInput && !event.studentCoordinators.includes(coordinatorInput)) {
                        handleChange('studentCoordinators', [...event.studentCoordinators, coordinatorInput]);
                        setCoordinatorInput('');
                      }
                    }}><i className="bi bi-plus-lg"></i></button>
                  </div>
                  <div className="d-flex flex-column gap-2 mt-2">
                    {event.studentCoordinators?.map((id, index) => (
                      <div key={index} className="d-flex justify-content-between align-items-center bg-black bg-opacity-30 p-2 px-3 rounded border border-secondary border-opacity-30 shadow-sm">
                        <span className="text-white small">{coordinatorList.find(c => c._id === id)?.name || 'Coordinator'}</span>
                        <i className="bi bi-trash text-danger cursor-pointer fs-6" onClick={() => {
                          const updated = [...event.studentCoordinators]; updated.splice(index, 1); handleChange('studentCoordinators', updated);
                        }}></i>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @media (min-width: 992px) {
          .dashboard-content { margin-left: 280px; }
        }

        @media (max-width: 991.98px) {
          .dashboard-content { margin-left: 0; padding-top: 10px; }
        }

        .bg-glass { 
          background: rgba(255, 255, 255, 0.03) !important; 
          backdrop-filter: blur(20px); 
          border-radius: 20px; 
        }

        .cursor-pointer { cursor: pointer; transition: 0.2s; }
        .cursor-pointer:hover { transform: scale(1.15); }
        .ls-1 { letter-spacing: 1px; }
        .x-small { font-size: 0.7rem; }
        .form-check-input:checked { background-color: #0dcaf0; border-color: #0dcaf0; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(5px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
      `}</style>
    </div>
  );
};

export default EditEvent;