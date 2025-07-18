import React, { useState } from 'react';

const ScheduleTable = ({ data, onDelete, onEdit }) => {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm(item);
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
              <input name="eventName" value={form.eventName} onChange={handleChange} />
              <input type="date" name="date" value={form.date} onChange={handleChange} />
              <input type="time" name="time" value={form.time} onChange={handleChange} />
              <input name="room" value={form.room} onChange={handleChange} />
              <button onClick={handleSave}>Save</button>
            </>
          ) : (
            <>
              <strong>{item.eventName}</strong>
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