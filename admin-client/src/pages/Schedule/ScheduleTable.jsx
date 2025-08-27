import React, { useState, useEffect } from 'react';
import API from '../../api/adminApi';

const ScheduleTable = ({ data, onDelete, onEdit }) => {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
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

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      eventId: item.eventId._id,
      date: item.date,
      time: item.time,
      room: item.room
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onEdit(editingId, form);
    setEditingId(null);
  };

  return (
    <ul className="schedule-table">
      {data.map((item) => (
        <li key={item._id} className="schedule-card">
          {editingId === item._id ? (
            <>
              <select name="eventId" value={form.eventId} onChange={handleChange}>
                <option value="">Select Event</option>
                {events.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.name} ({event.category})
                  </option>
                ))}
              </select>
              <input type="date" name="date" value={form.date} onChange={handleChange} />
              <input type="time" name="time" value={form.time} onChange={handleChange} />
              <input name="room" value={form.room} onChange={handleChange} />
              <button onClick={handleSave}>Save</button>
            </>
          ) : (
            <>
              <div className="event-info">
                <strong>{item.eventId.name}</strong>
                <span className={`category-badge category-${item.eventId.category}`}>
                  {item.eventId.category}
                </span>
              </div>
              <span>{item.date} — {item.time} | Room {item.room}</span>
              <div className="actions">
                <button onClick={() => startEdit(item)}>Edit</button>
                <button onClick={() => onDelete(item._id)}>Delete</button>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  );
};

export default ScheduleTable;