import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import getApiBase from '../../utils/getApiBase';
import Navbar from '../../components/Navbar';
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
    rounds: 1
  });

  const [facultyList, setFacultyList] = useState([]);
  const [facultyInput, setFacultyInput] = useState('');
  const [coordinatorList, setCoordinatorList] = useState([]);
  const [coordinatorInput, setCoordinatorInput] = useState('');

  const baseURL = getApiBase();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facultyRes, coordinatorRes] = await Promise.all([
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

        setFacultyList(facultyRes.data);
        setCoordinatorList(coordinatorRes.data.map(c => c.name));
      } catch {
        toast.error('Failed to fetch faculty or coordinator list');
      }
    };

    fetchData();
  }, [baseURL]);

  const handleChange = (field, value) => {
    setEventData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddFaculty = () => {
    if (facultyInput && !eventData.judges.includes(facultyInput)) {
      setEventData(prev => ({
        ...prev,
        judges: [...prev.judges, facultyInput]
      }));
      setFacultyInput('');
    }
  };

  const handleRemoveFaculty = index => {
    const updated = [...eventData.judges];
    updated.splice(index, 1);
    setEventData(prev => ({ ...prev, judges: updated }));
  };

  const handleAddCoordinator = () => {
    if (coordinatorInput && !eventData.studentCoordinators.includes(coordinatorInput)) {
      setEventData(prev => ({
        ...prev,
        studentCoordinators: [...prev.studentCoordinators, coordinatorInput]
      }));
      setCoordinatorInput('');
    }
  };

  const handleRemoveCoordinator = index => {
    const updated = [...eventData.studentCoordinators];
    updated.splice(index, 1);
    setEventData(prev => ({ ...prev, studentCoordinators: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${baseURL}/api/admin/events`, eventData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        withCredentials: true
      });
      toast.success('Event created successfully');
      setTimeout(() => navigate('/events'), 1500);
    } catch {
      toast.error('Failed to create event');
    }
  };

  // JSX remains unchanged — your layout is already clean and compact
  // You can paste the original JSX below this logic block
  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <Navbar />
      <div className="container py-5 text-light bg-dark min-vh-100">
        <h2 className="text-center fw-bold mb-4 border-bottom pb-2">Create New Event</h2>

        <form onSubmit={handleSubmit} className="bg-secondary rounded p-4 shadow-sm">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Event Name</label>
              <input
                type="text"
                className="form-control bg-dark text-light border-secondary"
                value={eventData.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="Event name"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Category</label>
              <select
                className="form-select bg-dark text-light border-secondary"
                value={eventData.category}
                onChange={e => handleChange('category', e.target.value)}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Number of Rounds</label>
              <input
                type="number"
                className="form-control bg-dark text-light border-secondary"
                min="1"
                value={eventData.rounds}
                onChange={e => handleChange('rounds', parseInt(e.target.value))}
                placeholder="e.g. 3"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Event Rules</label>
              <textarea
                className="form-control bg-dark text-light border-secondary"
                rows="2"
                value={eventData.rules}
                onChange={e => handleChange('rules', e.target.value)}
                placeholder="Write rules..."
              ></textarea>
            </div>
          </div>

          <div className="row g-3 mt-3">
            <div className="col-md-6">
              <label className="form-label">Judges</label>
              <div className="input-group">
                <select
                  className="form-select bg-dark text-light border-secondary"
                  value={facultyInput}
                  onChange={e => setFacultyInput(e.target.value)}
                >
                  <option value="">Select Faculty</option>
                  {facultyList.map((f, i) => (
                    <option key={f._id} value={f._id}>{f.name}</option>
                  ))}
                </select>
                <button className="btn btn-outline-light" type="button" onClick={handleAddFaculty}>Add</button>
              </div>
              <ul className="list-group mt-2">
                {eventData.judges.map((id, index) => {
                  const faculty = facultyList.find(f => f._id === id);
                  return (
                    <li key={index} className="list-group-item bg-dark text-light d-flex justify-content-between align-items-center">
                      {faculty?.name || 'Unknown'}
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveFaculty(index)}>Remove</button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="col-md-6">
              <label className="form-label">Student Coordinators</label>
              <div className="input-group">
                <select
                  className="form-select bg-dark text-light border-secondary"
                  value={coordinatorInput}
                  onChange={e => setCoordinatorInput(e.target.value)}
                >
                  <option value="">Select Coordinator</option>
                  {coordinatorList.map((name, i) => (
                    <option key={i} value={name}>{name}</option>
                  ))}
                </select>
                <button className="btn btn-outline-light" type="button" onClick={handleAddCoordinator}>Add</button>
              </div>
              <ul className="list-group mt-2">
                {eventData.studentCoordinators.map((coord, index) => (
                  <li key={index} className="list-group-item bg-dark text-light d-flex justify-content-between align-items-center">
                    {coord}
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveCoordinator(index)}>Remove</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-4 w-100 fw-semibold">Create Event</button>
        </form>

        <div className="text-center mt-4">
          <button className="btn btn-outline-light" onClick={() => navigate('/events')}>
            ← Back to Events
          </button>
        </div>
      </div>
    </>
  );
}

export default NewEvent;