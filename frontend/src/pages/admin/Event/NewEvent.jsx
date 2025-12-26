import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import getApiBase from '../../../utils/getApiBase';
import Navbar from '../../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const categories = ['Tech', 'Cultural', 'Gaming', 'Sports', 'Pre-events'];

function NewEvent() {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    name: '',
    category: '',
    judges: [],
    studentCoordinators: [],
    rules: '',
    rounds: 1,
    minParticipants: 1, // New field
    maxParticipants: 1, // New field
    isTrophyEvent: true, // New field
    judgingCriteria: ['', '', ''] // Exactly 3 slots
  });

  const [facultyList, setFacultyList] = useState([]);
  const [facultyInput, setFacultyInput] = useState('');
  const [coordinatorList, setCoordinatorList] = useState([]);
  const [coordinatorInput, setCoordinatorInput] = useState('');

  const baseURL = getApiBase();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('adminToken')}` };
        const [facultyRes, coordinatorRes] = await Promise.all([
          axios.get(`${baseURL}/api/admin/faculty`, { headers, withCredentials: true }),
          axios.get(`${baseURL}/api/admin/student-coordinators`, { headers, withCredentials: true })
        ]);
        setFacultyList(facultyRes.data);
        setCoordinatorList(coordinatorRes.data);
      } catch {
        toast.error('Failed to fetch faculty or coordinator list');
      }
    };
    fetchData();
  }, [baseURL]);

  const handleChange = (field, value) => {
    setEventData(prev => ({ ...prev, [field]: value }));
  };

  const handleCriteriaChange = (index, value) => {
    const updated = [...eventData.judgingCriteria];
    updated[index] = value;
    setEventData(prev => ({ ...prev, judgingCriteria: updated }));
  };

  const handleAddFaculty = () => {
    if (facultyInput && !eventData.judges.includes(facultyInput)) {
      setEventData(prev => ({ ...prev, judges: [...prev.judges, facultyInput] }));
      setFacultyInput('');
    }
  };

  const handleAddCoordinator = () => {
    if (coordinatorInput && !eventData.studentCoordinators.includes(coordinatorInput)) {
      setEventData(prev => ({ ...prev, studentCoordinators: [...prev.studentCoordinators, coordinatorInput] }));
      setCoordinatorInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (eventData.maxParticipants < eventData.minParticipants) {
      return toast.error('Max participants cannot be less than Min participants');
    }
    if (eventData.judgingCriteria.some(c => c.trim() === '')) {
      return toast.warn('Please provide all 3 judging criteria');
    }

    try {
      await axios.post(`${baseURL}/api/admin/events`, eventData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        withCredentials: true
      });
      toast.success('Event created successfully');
      setTimeout(() => navigate('/admin/events'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create event');
    }
  };

  return (
    <>
      <ToastContainer theme="dark" position="top-right" autoClose={2000} />
      <Navbar />
      <div className="container py-5 text-light bg-dark min-vh-100">
        <h2 className="text-center fw-bold mb-4 border-bottom border-secondary pb-2">Create New Event</h2>

        <form onSubmit={handleSubmit} className="bg-glass rounded p-4 shadow-lg border border-secondary">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="text-info small fw-bold mb-2 d-block">EVENT NAME</label>
              <input type="text" className="form-control bg-dark text-light border-secondary shadow-none"
                value={eventData.name} onChange={e => handleChange('name', e.target.value)} required />
            </div>

            <div className="col-md-6">
              <label className="text-info small fw-bold mb-2 d-block">CATEGORY</label>
              <select className="form-select bg-dark text-light border-secondary shadow-none"
                value={eventData.category} onChange={e => handleChange('category', e.target.value)} required>
                <option value="">Select Category</option>
                {categories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="col-md-4">
              <label className="text-info small fw-bold mb-2 d-block">ROUNDS</label>
              <input type="number" className="form-control bg-dark text-light border-secondary shadow-none"
                min="1" value={eventData.rounds} onChange={e => handleChange('rounds', parseInt(e.target.value))} required />
            </div>

            {/* DYNAMIC LIMITS */}
            <div className="col-md-4">
              <label className="text-info small fw-bold mb-2 d-block">MIN MEMBERS</label>
              <input type="number" className="form-control bg-dark text-light border-secondary shadow-none"
                min="1" value={eventData.minParticipants} onChange={e => handleChange('minParticipants', parseInt(e.target.value))} required />
            </div>
            <div className="col-md-4">
              <label className="text-info small fw-bold mb-2 d-block">MAX MEMBERS</label>
              <input type="number" className="form-control bg-dark text-light border-secondary shadow-none"
                min={eventData.minParticipants} value={eventData.maxParticipants} onChange={e => handleChange('maxParticipants', parseInt(e.target.value))} required />
            </div>

            <div className="col-12 mt-3">
              <div className="form-check form-switch bg-dark bg-opacity-50 p-3 rounded border border-secondary">
                <input className="form-check-input ms-0 me-3" type="checkbox" checked={eventData.isTrophyEvent} 
                  onChange={e => handleChange('isTrophyEvent', e.target.checked)} />
                <label className="form-check-label text-white fw-bold small">INCLUDE IN OVERALL TROPHY POINTS?</label>
              </div>
            </div>

            <div className="col-12 mt-3 bg-info bg-opacity-10 p-4 rounded border border-info border-opacity-25">
              <label className="text-info small fw-bold mb-3 d-block text-uppercase">Tie-Breaker Judging Criteria (Exactly 3)</label>
              {eventData.judgingCriteria.map((val, i) => (
                <div key={i} className="input-group mb-2 shadow-sm">
                  <span className="input-group-text bg-dark border-secondary text-info fw-bold">C{i+1}</span>
                  <input type="text" className="form-control bg-dark text-light border-secondary"
                    placeholder={`e.g. Creativity, Technique...`} value={val} 
                    onChange={e => handleCriteriaChange(i, e.target.value)} required />
                </div>
              ))}
            </div>

            <div className="col-12 mt-3">
              <label className="text-info small fw-bold mb-2 d-block">EVENT RULES & GUIDELINES</label>
              <textarea className="form-control bg-dark text-light border-secondary shadow-none"
                rows="3" value={eventData.rules} onChange={e => handleChange('rules', e.target.value)} required></textarea>
            </div>
          </div>

          <div className="row g-4 mt-2 border-top border-secondary pt-4">
            <div className="col-md-6">
              <label className="text-info small fw-bold mb-2 d-block">ASSIGN JUDGES (FACULTY)</label>
              <div className="input-group">
                <select className="form-select bg-dark text-light border-secondary shadow-none"
                  value={facultyInput} onChange={e => setFacultyInput(e.target.value)}>
                  <option value="">Select Faculty...</option>
                  {facultyList.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                </select>
                <button className="btn btn-info px-4 fw-bold" type="button" onClick={handleAddFaculty}>ADD</button>
              </div>
              <div className="mt-2 d-flex flex-wrap gap-2">
                {eventData.judges.map((id, index) => (
                  <span key={index} className="badge bg-secondary p-2 d-flex align-items-center gap-2">
                    {facultyList.find(f => f._id === id)?.name}
                    <i className="bi bi-x-circle cursor-pointer text-danger" onClick={() => {
                       const updated = [...eventData.judges]; updated.splice(index, 1); handleChange('judges', updated);
                    }}></i>
                  </span>
                ))}
              </div>
            </div>

            <div className="col-md-6">
              <label className="text-info small fw-bold mb-2 d-block">ASSIGN STUDENT COORDINATORS</label>
              <div className="input-group">
                <select className="form-select bg-dark text-light border-secondary shadow-none"
                  value={coordinatorInput} onChange={e => setCoordinatorInput(e.target.value)}>
                  <option value="">Select Coordinator...</option>
                  {coordinatorList.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <button className="btn btn-info px-4 fw-bold" type="button" onClick={handleAddCoordinator}>ADD</button>
              </div>
              <div className="mt-2 d-flex flex-wrap gap-2">
                {eventData.studentCoordinators.map((id, index) => (
                  <span key={index} className="badge bg-secondary p-2 d-flex align-items-center gap-2">
                    {coordinatorList.find(c => c._id === id)?.name}
                    <i className="bi bi-x-circle cursor-pointer text-danger" onClick={() => {
                       const updated = [...eventData.studentCoordinators]; updated.splice(index, 1); handleChange('studentCoordinators', updated);
                    }}></i>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-info mt-5 w-100 fw-black py-3 shadow-lg">CREATE EVENT</button>
        </form>
      </div>

      <style>{`
        .bg-glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); }
        .fw-black { font-weight: 900; letter-spacing: 1px; }
        .cursor-pointer { cursor: pointer; }
      `}</style>
    </>
  );
}

export default NewEvent;