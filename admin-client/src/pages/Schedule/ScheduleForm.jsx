import React, { useState } from 'react';

const ScheduleForm = ({ onAdd }) => {
  const [form, setForm] = useState({
    eventName: '',
    date: '',
    time: '',
    room: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.eventName || !form.date || !form.time || !form.room) return;
    onAdd(form);
    setForm({ eventName: '', date: '', time: '', room: '' });
  };

  return (
    <form className="schedule-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Event</label>
          <input name="eventName" value={form.eventName} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Time</label>
          <input type="time" name="time" value={form.time} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Classroom</label>
          <input name="room" value={form.room} onChange={handleChange} />
        </div>
      </div>
      <button type="submit">Add Schedule</button>
    </form>
  );
};

export default ScheduleForm;