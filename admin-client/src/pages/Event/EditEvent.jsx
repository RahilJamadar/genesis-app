import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/adminApi';
import Navbar from '../../components/Navbar';
import './EditEvent.css';

const categories = ['Tech', 'Cultural', 'Gaming', 'Sports', 'Pre-events'];

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [facultyInput, setFacultyInput] = useState('');
  const [coordinatorList, setCoordinatorList] = useState([]);
  const [coordinatorInput, setCoordinatorInput] = useState('');

  useEffect(() => {
    API.get(`/admin/events/${id}`)
      .then(res => {
        const raw = res.data;
        const facultyNames = raw.faculties?.map(f => f.name) || [];
        setEvent({ ...raw, faculties: facultyNames });
      })
      .catch(err => console.error('Fetch error:', err));

    API.get('/admin/faculty')
      .then(res => setFacultyList(res.data.map(f => f.name)))
      .catch(err => console.error('Faculty fetch error:', err));

    API.get('/admin/student-coordinators')
      .then(res => setCoordinatorList(res.data.map(c => c.name)))
      .catch(err => console.error('Coordinator fetch error:', err));
  }, [id]);

  const handleChange = (field, value) => {
    setEvent(prev => ({ ...prev, [field]: value }));
  };

  const handleAddFaculty = () => {
    if (facultyInput && !event.faculties.includes(facultyInput)) {
      setEvent(prev => ({
        ...prev,
        faculties: [...prev.faculties, facultyInput]
      }));
      setFacultyInput('');
    }
  };

  const handleRemoveFaculty = index => {
    const updated = [...event.faculties];
    updated.splice(index, 1);
    setEvent(prev => ({ ...prev, faculties: updated }));
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
      await API.put(`/admin/events/${id}`, event);
      alert('Event updated ✅');
      navigate('/events');
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to save changes');
    }
  };

  if (!event) return <p>Loading event...</p>;

  return (
    <>
      <Navbar />
      <div className="edit-event">
        <h2>Edit Event: {event.name}</h2>

        <label>Event Name</label>
        <input
          type="text"
          value={event.name}
          onChange={e => handleChange('name', e.target.value)}
          placeholder="Event Name"
        />

        <label>Category</label>
        <select
          value={event.category}
          onChange={e => handleChange('category', e.target.value)}
        >
          <option value="">-- Select Category --</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>{cat}</option>
          ))}
        </select>

        <label>Faculty In-Charge(s)</label>
        <div className="faculty-section">
          <select
            value={facultyInput}
            onChange={e => setFacultyInput(e.target.value)}
          >
            <option value="">-- Select Faculty --</option>
            {facultyList.map((name, i) => (
              <option key={i} value={name}>{name}</option>
            ))}
          </select>
          <button type="button" onClick={handleAddFaculty}>Add Faculty</button>
        </div>

        <ul className="faculty-list">
          {event.faculties.map((faculty, index) => (
            <li key={index}>
              {faculty}
              <button type="button" onClick={() => handleRemoveFaculty(index)}>Remove</button>
            </li>
          ))}
        </ul>

        <label>Student Coordinator(s)</label>
        <div className="faculty-section">
          <select
            value={coordinatorInput}
            onChange={e => setCoordinatorInput(e.target.value)}
          >
            <option value="">-- Select Coordinator --</option>
            {coordinatorList.map((name, i) => (
              <option key={i} value={name}>{name}</option>
            ))}
          </select>
          <button type="button" onClick={handleAddCoordinator}>Add Coordinator</button>
        </div>

        <ul className="faculty-list">
          {event.studentCoordinators.map((coord, index) => (
            <li key={index}>
              {coord}
              <button type="button" onClick={() => handleRemoveCoordinator(index)}>Remove</button>
            </li>
          ))}
        </ul>

        <label>Event Rules</label>
        <textarea
          rows="6"
          value={event.rules}
          onChange={e => handleChange('rules', e.target.value)}
          placeholder="Write all rules and guidelines for this event..."
        ></textarea>

        <button onClick={handleSave}>Save Changes</button>
        <button onClick={() => navigate('/events')}>← Back to Events</button>
      </div>
    </>
  );
}

export default EditEvent;