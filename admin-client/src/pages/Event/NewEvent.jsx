import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/adminApi';
import Navbar from '../../components/Navbar';
import './EditEvent.css';

const categories = ['Tech', 'Cultural', 'Gaming', 'Sports', 'Pre-events'];

function NewEvent() {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    name: '',
    category: '',
    faculties: [],
    studentCoordinators: [],
    rules: ''
  });

  const [facultyList, setFacultyList] = useState([]);
  const [facultyInput, setFacultyInput] = useState('');

  const [coordinatorList, setCoordinatorList] = useState([]);
  const [coordinatorInput, setCoordinatorInput] = useState('');

  useEffect(() => {
    API.get('/faculty')
      .then(res => setFacultyList(res.data.map(f => f.name)))
      .catch(err => console.error('Faculty fetch error:', err));

    API.get('/student-coordinators')
      .then(res => setCoordinatorList(res.data.map(c => c.name)))
      .catch(err => console.error('Coordinator fetch error:', err));
  }, []);

  const handleChange = (field, value) => {
    setEventData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddFaculty = () => {
    if (facultyInput && !eventData.faculties.includes(facultyInput)) {
      setEventData(prev => ({
        ...prev,
        faculties: [...prev.faculties, facultyInput]
      }));
      setFacultyInput('');
    }
  };

  const handleRemoveFaculty = index => {
    const updated = [...eventData.faculties];
    updated.splice(index, 1);
    setEventData(prev => ({ ...prev, faculties: updated }));
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
      await API.post('/events', eventData);
      alert('Event created successfully ✅');
      navigate('/events');
    } catch (err) {
      console.error('Create error:', err);
      alert('Failed to create event');
    }
  };

  return (
    <>
      <Navbar />
      <div className="edit-event">
        <h2>Create New Event</h2>

        <form onSubmit={handleSubmit}>
          <label>Event Name</label>
          <input
            type="text"
            value={eventData.name}
            onChange={e => handleChange('name', e.target.value)}
            placeholder="Event name"
            required
          />

          <label>Category</label>
          <select
            value={eventData.category}
            onChange={e => handleChange('category', e.target.value)}
            required
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>

          <label>Faculty In-Charge(s)</label>
          <div className="faculty-section">
            <select value={facultyInput} onChange={e => setFacultyInput(e.target.value)}>
              <option value="">-- Select Faculty --</option>
              {facultyList.map((name, i) => (
                <option key={i} value={name}>{name}</option>
              ))}
            </select>
            <button type="button" onClick={handleAddFaculty}>Add Faculty</button>
          </div>

          <ul className="faculty-list">
            {eventData.faculties.map((faculty, index) => (
              <li key={index}>
                {faculty}
                <button type="button" onClick={() => handleRemoveFaculty(index)}>Remove</button>
              </li>
            ))}
          </ul>

          <label>Student Coordinator(s)</label>
          <div className="faculty-section">
            <select value={coordinatorInput} onChange={e => setCoordinatorInput(e.target.value)}>
              <option value="">-- Select Coordinator --</option>
              {coordinatorList.map((name, i) => (
                <option key={i} value={name}>{name}</option>
              ))}
            </select>
            <button type="button" onClick={handleAddCoordinator}>Add Coordinator</button>
          </div>

          <ul className="faculty-list">
            {eventData.studentCoordinators.map((coord, index) => (
              <li key={index}>
                {coord}
                <button type="button" onClick={() => handleRemoveCoordinator(index)}>Remove</button>
              </li>
            ))}
          </ul>

          <label>Event Rules</label>
          <textarea
            rows="6"
            value={eventData.rules}
            onChange={e => handleChange('rules', e.target.value)}
            placeholder="Write all rules and guidelines for this event..."
          ></textarea>

          <button type="submit">Create Event</button>
        </form>

        <button onClick={() => navigate('/events')}>← Back to Events</button>
      </div>
    </>
  );
}

export default NewEvent;