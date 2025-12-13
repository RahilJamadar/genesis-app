import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import getApiBase from '../../../utils/getApiBase';
import Navbar from '../../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const categories = ['Tech', 'Cultural', 'Gaming', 'Sports', 'Pre-events'];

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [facultyInput, setFacultyInput] = useState('');
  const [coordinatorList, setCoordinatorList] = useState([]);
  const [coordinatorInput, setCoordinatorInput] = useState('');

  const baseURL = getApiBase();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, facultyRes, coordinatorRes] = await Promise.all([
          axios.get(`${baseURL}/api/admin/events/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('adminToken')}`
            },
            withCredentials: true
          }),
          axios.get(`${baseURL}/api/admin/faculty`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('adminToken')}`
            },
            withCredentials: true
          }),
          axios.get(`${baseURL}/api/admin/student-coordinators`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('adminToken')}`
            },
            withCredentials: true
          })
        ]);

        const raw = eventRes.data;
        setEvent({
          ...raw,
          judges: raw.judges || [],
          rounds: raw.rounds || 1
        });
        setFacultyList(facultyRes.data);
        setCoordinatorList(coordinatorRes.data.map(c => c.name));
      } catch {
        toast.error('❌ Failed to fetch event data');
      }
    };

    fetchData();
  }, [id, baseURL]);

  const handleChange = (field, value) => {
    setEvent(prev => ({ ...prev, [field]: value }));
  };

  const handleAddFaculty = () => {
    if (facultyInput && !event.judges.includes(facultyInput)) {
      setEvent(prev => ({
        ...prev,
        judges: [...prev.judges, facultyInput]
      }));
      setFacultyInput('');
    }
  };

  const handleRemoveFaculty = index => {
    const updated = [...event.judges];
    updated.splice(index, 1);
    setEvent(prev => ({ ...prev, judges: updated }));
  };

  const handleAddCoordinator = () => {
    if (coordinatorInput && !event.studentCoordinators.includes(coordinatorInput)) {
      setEvent(prev => ({
        ...prev,
        studentCoordinators: [...prev.studentCoordinators, coordinatorInput]
      }));
      setCoordinatorInput('');
    }
  };

  const handleRemoveCoordinator = index => {
    const updated = [...event.studentCoordinators];
    updated.splice(index, 1);
    setEvent(prev => ({ ...prev, studentCoordinators: updated }));
  };

  const handleSave = async () => {
    try {
      await axios.put(`${baseURL}/api/admin/events/${id}`, event, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        withCredentials: true
      });
      toast.success('✅ Event updated successfully');
      setTimeout(() => navigate('/events'), 1500);
    } catch {
      toast.error('❌ Failed to save changes');
    }
  };

  if (!event) return <p className="text-center text-light mt-5">Loading event...</p>;

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <Navbar />
      <div className="container bg-dark text-light py-4 px-3 rounded shadow-lg mt-4" style={{ maxWidth: '720px' }}>
        <h2 className="text-center text-primary border-bottom pb-2 mb-4">Edit Event: {event.name}</h2>

        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label text-info">Event Name</label>
            <input
              type="text"
              className="form-control form-control-sm bg-dark text-light border-secondary"
              value={event.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="Event Name"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label text-info">Category</label>
            <select
              className="form-select form-select-sm bg-dark text-light border-secondary"
              value={event.category}
              onChange={e => handleChange('category', e.target.value)}
            >
              <option value="">-- Select --</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label text-info">Rounds</label>
            <input
              type="number"
              min="1"
              className="form-control form-control-sm bg-dark text-light border-secondary"
              value={event.rounds}
              onChange={e => handleChange('rounds', parseInt(e.target.value))}
              placeholder="e.g. 3"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label text-info">Add Judge</label>
            <div className="input-group input-group-sm">
              <select
                className="form-select bg-dark text-light border-secondary"
                value={facultyInput}
                onChange={e => setFacultyInput(e.target.value)}
              >
                <option value="">-- Select --</option>
                {facultyList.map(f => (
                  <option key={f._id} value={f._id}>{f.name}</option>
                ))}
              </select>
              <button className="btn btn-outline-info" type="button" onClick={handleAddFaculty}>+</button>
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label text-info">Add Coordinator</label>
            <div className="input-group input-group-sm">
              <select
                className="form-select bg-dark text-light border-secondary"
                value={coordinatorInput}
                onChange={e => setCoordinatorInput(e.target.value)}
              >
                <option value="">-- Select --</option>
                {coordinatorList.map((name, i) => (
                  <option key={i} value={name}>{name}</option>
                ))}
              </select>
              <button className="btn btn-outline-info" type="button" onClick={handleAddCoordinator}>+</button>
            </div>
          </div>

          <div className="col-12">
            <label className="form-label text-info">Event Rules</label>
            <textarea
              rows="4"
              className="form-control form-control-sm bg-dark text-light border-secondary"
              value={event.rules}
              onChange={e => handleChange('rules', e.target.value)}
              placeholder="Write rules..."
            ></textarea>
          </div>
        </div>

        <div className="mt-4">
          <label className="form-label text-info">Judges</label>
          <ul className="list-group list-group-flush mb-3">
            {event.judges.map((id, index) => {
              const faculty = facultyList.find(f => f._id === id);
              return (
                <li key={index} className="list-group-item bg-dark text-light d-flex justify-content-between align-items-center">
                  {faculty?.name || 'Unknown'}
                  <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => handleRemoveFaculty(index)}>Remove</button>
                </li>
              );
            })}
          </ul>

          <label className="form-label text-info">Student Coordinators</label>
          <ul className="list-group list-group-flush">
            {event.studentCoordinators.map((coord, index) => (
              <li key={index} className="list-group-item bg-dark text-light d-flex justify-content-between align-items-center">
                {coord}
                <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => handleRemoveCoordinator(index)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="d-flex gap-2 mt-4">
          <button className="btn btn-sm btn-primary w-100 fw-semibold" onClick={handleSave}>💾 Save</button>
          <button className="btn btn-sm btn-outline-secondary w-100" onClick={() => navigate('/events')}>
            ← Back
          </button>
        </div>
      </div>
    </>
  );
}

export default EditEvent;