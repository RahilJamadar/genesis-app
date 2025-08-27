import React, { useState, useEffect } from 'react';
import API from '../../api/adminApi';

const ScheduleForm = ({ onAdd }) => {
  const [form, setForm] = useState({
    eventId: '',
    date: '',
    time: '',
    room: '',
  });

  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await API.get('/admin/events'); // ✅ corrected path
        setEvents(res.data);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      }
    }
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.eventId || !form.date || !form.time || !form.room) return;
    onAdd(form);
    setForm({ eventId: '', date: '', time: '', room: '' });
  };

  return (
    <form className="schedule-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Event</label>
          <select name="eventId" value={form.eventId} onChange={handleChange} required>
            <option value="">Select Event</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.name} ({event.category})
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Date</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Time</label>
          <input type="time" name="time" value={form.time} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Classroom</label>
          <input name="room" value={form.room} onChange={handleChange} required />
        </div>
      </div>
      <button type="submit">Add Schedule</button>
    </form>
  );
};

export default ScheduleForm;