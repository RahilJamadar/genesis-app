import React, { useState, useEffect } from 'react';
import axios from 'axios';
import getApiBase from '../../utils/getApiBase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ScheduleTable = ({ data, onDelete, onEdit }) => {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
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

  const startEdit = (item) => {
    if (!item.eventId) {
      toast.warn('⚠️ Cannot edit schedule with missing event');
      return;
    }
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
    toast.success('✏️ Schedule updated');
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Tech': return '#00bfff';
      case 'Cultural': return '#e07c9c';
      case 'Sports': return '#4cb050';
      case 'Gaming': return '#ffa500';
      case 'Pre-events': return '#9370db';
      default: return '#6c757d';
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <div className="table-responsive">
        <table className="table table-dark table-bordered align-middle" style={{ backgroundColor: '#0D0D15' }}>
          <thead className="table-secondary text-dark">
            <tr>
              <th>Event</th>
              <th>Category</th>
              <th>Date</th>
              <th>Time</th>
              <th>Room</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id}>
                {editingId === item._id ? (
                  <>
                    <td>
                      <select
                        name="eventId"
                        value={form.eventId}
                        onChange={handleChange}
                        className="form-select form-select-sm bg-dark text-light border-secondary"
                      >
                        <option value="">Select Event</option>
                        {events.map(event => (
                          <option key={event._id} value={event._id}>
                            {event.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: getCategoryColor(item.eventId?.category) }}>
                        {item.eventId?.category || '—'}
                      </span>
                    </td>
                    <td>
                      <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        className="form-control form-control-sm bg-dark text-light border-secondary"
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        name="time"
                        value={form.time}
                        onChange={handleChange}
                        className="form-control form-control-sm bg-dark text-light border-secondary"
                      />
                    </td>
                    <td>
                      <input
                        name="room"
                        value={form.room}
                        onChange={handleChange}
                        className="form-control form-control-sm bg-dark text-light border-secondary"
                        placeholder="Room"
                      />
                    </td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-info me-2" onClick={handleSave}>
                        Save
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="fw-semibold text-info">
                      {item.eventId?.name || <span className="text-muted">Unknown Event</span>}
                    </td>
                    <td>
                      <span className="badge fw-semibold" style={{ backgroundColor: getCategoryColor(item.eventId?.category) }}>
                        {item.eventId?.category || '—'}
                      </span>
                    </td>
                    <td>{item.date}</td>
                    <td>{item.time}</td>
                    <td>{item.room}</td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-info me-2" onClick={() => startEdit(item)}>
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          onDelete(item._id);
                          toast.success('🗑️ Schedule deleted');
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ScheduleTable;