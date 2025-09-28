import React, { useState, useEffect } from 'react';
import axios from 'axios';
import getApiBase from '../../utils/getApiBase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ScheduleForm = ({ onAdd }) => {
  const [form, setForm] = useState({
    eventId: '',
    date: '',
    time: '',
    room: '',
  });

  const [events, setEvents] = useState([]);
  const baseURL = getApiBase();

  useEffect(() => {
    axios.get(`${baseURL}/api/admin/events`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      },
      withCredentials: true
    })
      .then(res => setEvents(res.data))
      .catch(() => toast.error('❌ Failed to fetch events'));
  }, [baseURL]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { eventId, date, time, room } = form;
    if (!eventId || !date || !time || !room) {
      toast.warn('⚠️ Please fill all fields');
      return;
    }
    onAdd(form);
    toast.success('✅ Schedule added');
    setForm({ eventId: '', date: '', time: '', room: '' });
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <form
        onSubmit={handleSubmit}
        className="mx-auto p-4 rounded shadow-sm mb-4"
        style={{
          backgroundColor: '#161b22',
          border: '1px solid #2b2f3a',
          color: '#e0e6f0',
          fontSize: '0.9rem',
          maxWidth: '400px'
        }}
      >
        <div className="mb-3">
          <label className="form-label text-info">Event</label>
          <select
            name="eventId"
            value={form.eventId}
            onChange={handleChange}
            required
            className="form-select form-select-sm bg-dark text-light border-secondary"
          >
            <option value="">Select Event</option>
            {events.map(event => (
              <option key={event._id} value={event._id}>
                {event.name} ({event.category})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label text-info">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="form-control form-control-sm bg-dark text-light border-secondary"
          />
        </div>

        <div className="mb-3">
          <label className="form-label text-info">Time</label>
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            required
            className="form-control form-control-sm bg-dark text-light border-secondary"
          />
        </div>

        <div className="mb-3">
          <label className="form-label text-info">Classroom</label>
          <input
            name="room"
            value={form.room}
            onChange={handleChange}
            required
            className="form-control form-control-sm bg-dark text-light border-secondary"
            placeholder="Room number"
          />
        </div>

        <div className="text-center mt-3">
          <button type="submit" className="btn btn-sm btn-info fw-semibold px-4">
            ➕ Add Schedule
          </button>
        </div>
      </form>
    </>
  );
};

export default ScheduleForm;