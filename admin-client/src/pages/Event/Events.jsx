import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/adminApi';
import Navbar from '../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    judges: [],
    studentCoordinators: [],
    rules: '',
    rounds: 1
  });

  const navigate = useNavigate();

  useEffect(() => {
    API.get('/admin/events')
      .then(res => setEvents(res.data))
      .catch(() => toast.error('Failed to fetch events'));

    API.get('/admin/faculty')
      .then(res => setFacultyList(res.data)) // full objects with _id and name
      .catch(() => toast.error('Failed to fetch faculty list'));

    API.get('/admin/student-coordinators')
      .then(res => setCoordinatorList(res.data.map(c => ({ id: c._id, name: c.name }))))
      .catch(() => toast.error('Failed to fetch coordinator list'));
  }, []);

  const handleChange = (field, value) => {
    setNewEvent(prev => ({ ...prev, [field]: value }));
  };

  const handleAddFaculty = () => {
    const selected = facultyList.find(f => f._id === facultyInput);
    if (selected && !newEvent.judges.includes(selected._id)) {
      setNewEvent(prev => ({
        ...prev,
        judges: [...prev.judges, selected._id]
      }));
      setFacultyInput('');
    }
  };

  const handleRemoveFaculty = index => {
    const updated = [...newEvent.judges];
    updated.splice(index, 1);
    setNewEvent(prev => ({ ...prev, judges: updated }));
  };

  const handleAddCoordinator = () => {
    if (coordinatorInput && !newEvent.studentCoordinators.includes(coordinatorInput)) {
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
      setEvents([...events, res.data.event]);
      setNewEvent({
        name: '',
        category: '',
        judges: [],
        studentCoordinators: [],
        rules: '',
        rounds: 1
      });
      setFacultyInput('');
      setCoordinatorInput('');
      toast.success('Event created');
    } catch {
      toast.error('Failed to create event');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await API.delete(`/admin/events/${id}`);
      setEvents(events.filter(e => e._id !== id));
      toast.success('Event deleted');
    } catch {
      toast.error('Failed to delete event');
    }
  };

  const handleEdit = id => {
    navigate(`/events/edit/${id}`);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <Navbar />
      <div className="container-fluid bg-dark text-light py-5 px-4 min-vh-100">
        <h2 className="text-center fw-bold mb-4 border-bottom pb-2">Event Manager</h2>

        <form onSubmit={handleAdd} className="bg-dark text-light rounded p-4 mb-5 shadow-sm">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Event Name</label>
              <input
                type="text"
                className="form-control bg-dark text-light border-secondary"
                value={newEvent.name}
                onChange={e => handleChange('name', e.target.value)}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Category</label>
              <select
                className="form-select bg-dark text-light border-secondary"
                value={newEvent.category}
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
              <label className="form-label">Rounds</label>
              <input
                type="number"
                className="form-control bg-dark text-light border-secondary"
                min="1"
                value={newEvent.rounds}
                onChange={e => handleChange('rounds', parseInt(e.target.value))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Rules</label>
              <textarea
                className="form-control bg-dark text-light border-secondary"
                rows="2"
                value={newEvent.rules}
                onChange={e => handleChange('rules', e.target.value)}
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
                  {facultyList.map(f => (
                    <option key={f._id} value={f._id}>{f.name}</option>
                  ))}
                </select>
                <button className="btn btn-outline-light" type="button" onClick={handleAddFaculty}>Add</button>
              </div>
              <ul className="list-group mt-2">
                {newEvent.judges.map((id, index) => {
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
                  {coordinatorList.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <button className="btn btn-outline-light" type="button" onClick={handleAddCoordinator}>Add</button>
              </div>
              <ul className="list-group mt-2">
                {newEvent.studentCoordinators.map((coord, index) => (
                  <li key={index} className="list-group-item bg-dark text-light d-flex justify-content-between align-items-center">
                    {coord}
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveCoordinator(index)}>Remove</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-4 w-100 fw-semibold">Add Event</button>
        </form>

        <div className="row g-4">
          {events.map(event => (
            <div key={event._id} className="col-md-4">
              <div className="card bg-dark text-light border border-secondary shadow-sm h-100">
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="card-title fw-bold">{event.name}</h5>
                    <span className="badge bg-secondary">{event.category}</span>
                    <p className="text-muted small mt-2">Rounds: {event.rounds || 1}</p>
                  </div>
                  <div className="mt-3 d-flex gap-2 flex-wrap">
                    <button
                      className="btn btn-sm btn-outline-light"
                      onClick={() => navigate(`/events/view/${event._id}`)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleEdit(event._id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(event._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Events;