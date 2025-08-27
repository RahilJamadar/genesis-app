import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/adminApi';
import Navbar from '../../components/Navbar';
import './Events.css';

const categories = ['Tech', 'Cultural', 'Gaming', 'Sports', 'Pre-events'];

function Events() {
  const [events, setEvents] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [coordinatorList, setCoordinatorList] = useState([]);
  const [facultyInput, setFacultyInput] = useState('');
  const [coordinatorInput, setCoordinatorInput] = useState('');
  const [newEvent, setNewEvent] = useState({
    name: '',
    category: '',
    faculties: [],
    studentCoordinators: [],
    rules: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/admin/events')
      .then(res => setEvents(res.data))
      .catch(err => console.error('Event fetch error:', err));

    API.get('/admin/faculty')
      .then(res => setFacultyList(res.data.map(f => f.name)))
      .catch(err => console.error('Faculty list error:', err));

    API.get('/admin/student-coordinators')
      .then(res => setCoordinatorList(res.data.map(c => ({ id: c._id, name: c.name }))))
      .catch(err => console.error('Coordinator list error:', err));
  }, []);

  const handleChange = (field, value) => {
    setNewEvent(prev => ({ ...prev, [field]: value }));
  };

  const handleAddFaculty = () => {
    if (facultyInput && !newEvent.faculties.includes(facultyInput)) {
      setNewEvent(prev => ({
        ...prev,
        faculties: [...prev.faculties, facultyInput]
      }));
      setFacultyInput('');
    }
  };

  const handleRemoveFaculty = index => {
    const updated = [...newEvent.faculties];
    updated.splice(index, 1);
    setNewEvent(prev => ({ ...prev, faculties: updated }));
  };

  const handleAddCoordinator = () => {
    if (
      coordinatorInput &&
      !newEvent.studentCoordinators.includes(coordinatorInput)
    ) {
      setNewEvent(prev => ({
        ...prev,
        studentCoordinators: [...prev.studentCoordinators, coordinatorInput]
      }));
      setCoordinatorInput('');
    }
  };

  const handleRemoveCoordinator = index => {
    const updated = [...newEvent.studentCoordinators];
    updated.splice(index, 1);
    setNewEvent(prev => ({ ...prev, studentCoordinators: updated }));
  };

  const handleAdd = async e => {
    e.preventDefault();
    try {
      const res = await API.post('/admin/events', newEvent);
      const savedEvent = res.data.event;
      setEvents([...events, savedEvent]);
      setNewEvent({
        name: '',
        category: '',
        faculties: [],
        studentCoordinators: [],
        rules: ''
      });
      setFacultyInput('');
      setCoordinatorInput('');
    } catch (err) {
      console.error('Create error:', err);
      alert('Failed to create event');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await API.delete(`/admin/events/${id}`);
      setEvents(events.filter(e => e._id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Unable to delete event');
    }
  };

  const handleEdit = id => {
    navigate(`/events/edit/${id}`);
  };

  return (
    <>
      <Navbar />
      <div className="events">
        <h2>Event Manager</h2>

        <form onSubmit={handleAdd}>
          <label>Event Name</label>
          <input
            type="text"
            placeholder="Event name"
            value={newEvent.name}
            onChange={e => handleChange('name', e.target.value)}
            required
          />

          <label>Category</label>
          <select
            value={newEvent.category}
            onChange={e => handleChange('category', e.target.value)}
            required
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
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
                <option key={i} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <button type="button" onClick={handleAddFaculty}>
              Add Faculty
            </button>
          </div>

          <ul className="faculty-list">
            {newEvent.faculties.map((faculty, index) => (
              <li key={index}>
                {faculty}
                <button type="button" onClick={() => handleRemoveFaculty(index)}>
                  Remove
                </button>
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
              {coordinatorList.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <button type="button" onClick={handleAddCoordinator}>
              Add Coordinator
            </button>
          </div>

          <ul className="faculty-list">
            {newEvent.studentCoordinators.map((coord, index) => (
              <li key={index}>
                {coord}
                <button
                  type="button"
                  onClick={() => handleRemoveCoordinator(index)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <label>Event Rules</label>
          <textarea
            rows="6"
            value={newEvent.rules}
            onChange={e => handleChange('rules', e.target.value)}
            placeholder="Write all rules for this event..."
          ></textarea>

          <button type="submit">Add Event</button>
        </form>

        <div className="event-grid">
          {events.map(event => (
            <div key={event._id} className="event-card">
              <div className="event-info">
                <strong>{event.name}</strong>
                <span className={`category-badge category-${event.category}`}>
                  {event.category}
                </span>
              </div>
              <div className="event-actions">
                <button onClick={() => navigate(`/events/view/${event._id}`)}>
                  View
                </button>
                <button onClick={() => handleEdit(event._id)}>
                  Edit
                </button>
                <button onClick={() => handleDelete(event._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Events;