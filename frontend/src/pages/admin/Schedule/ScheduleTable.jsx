import React, { useState, useEffect } from 'react';
import adminApi from '../../../api/adminApi';
import { ToastContainer, toast } from 'react-toastify';

const ScheduleTable = ({ data, onDelete, onEdit }) => {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await adminApi.get('/events');
        setEvents(res.data);
      } catch (err) {
        toast.error('❌ Failed to fetch event list');
      }
    };
    fetchEvents();
  }, []);

  const startEdit = (item) => {
    if (!item.eventId) {
      toast.warn('⚠️ Cannot edit schedule with missing event data');
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
  };

  const getCategoryBadge = (category) => {
    const colors = {
      Tech: 'bg-info text-dark',
      Cultural: 'bg-danger text-white',
      Sports: 'bg-success text-white',
      Gaming: 'bg-warning text-dark',
      'Pre-events': 'bg-primary text-white'
    };
    return colors[category] || 'bg-secondary text-white';
  };

  return (
    <div className="table-responsive rounded-3">
      <ToastContainer theme="dark" position="top-right" autoClose={2000} hideProgressBar />
      <table className="table table-dark table-hover align-middle mb-0">
        <thead className="bg-glass-header border-bottom border-secondary">
          <tr className="text-info small text-uppercase fw-bold">
            <th className="ps-4 py-3">Event Name</th>
            <th className="py-3">Category</th>
            <th className="py-3">Date</th>
            <th className="py-3">Time</th>
            <th className="py-3">Venue</th>
            <th className="text-center pe-4 py-3">Management</th>
          </tr>
        </thead>
        <tbody className="border-top-0">
          {data.map((item) => (
            <tr key={item._id} className="border-bottom border-secondary border-opacity-25">
              {editingId === item._id ? (
                // --- INLINE EDIT MODE ---
                <>
                  <td className="ps-4">
                    <select name="eventId" value={form.eventId} onChange={handleChange}
                      className="form-select form-select-sm bg-dark text-white border-info">
                      {events.map(ev => <option key={ev._id} value={ev._id}>{ev.name}</option>)}
                    </select>
                  </td>
                  <td><span className="text-muted small">Update Above</span></td>
                  <td>
                    <input type="date" name="date" value={form.date} onChange={handleChange}
                      className="form-control form-control-sm bg-dark text-white border-info" />
                  </td>
                  <td>
                    <input type="time" name="time" value={form.time} onChange={handleChange}
                      className="form-control form-control-sm bg-dark text-white border-info" />
                  </td>
                  <td>
                    <input name="room" value={form.room} onChange={handleChange}
                      className="form-control form-control-sm bg-dark text-white border-info" />
                  </td>
                  <td className="text-center pe-4">
                    <div className="d-flex justify-content-center gap-2">
                      <button className="btn btn-sm btn-info fw-bold" onClick={handleSave}>SAVE</button>
                      <button className="btn btn-sm btn-outline-secondary text-white" onClick={() => setEditingId(null)}>CANCEL</button>
                    </div>
                  </td>
                </>
              ) : (
                // --- DISPLAY MODE ---
                <>
                  <td className="ps-4 py-3">
                    <div className="fw-bold text-white">{item.eventId?.name || 'Unknown Event'}</div>
                  </td>
                  <td>
                    <span className={`badge px-2 py-1 ${getCategoryBadge(item.eventId?.category)}`}>
                      {item.eventId?.category || 'General'}
                    </span>
                  </td>
                  <td className="text-light">{item.date}</td>
                  <td className="text-light">{item.time}</td>
                  <td><span className="badge bg-dark border border-secondary text-info fw-normal">{item.room}</span></td>
                  <td className="text-center pe-4">
                    <div className="d-flex justify-content-center gap-2">
                      <button className="btn btn-sm btn-outline-warning border-0" onClick={() => startEdit(item)} title="Edit Entry">
                        <i className="bi bi-pencil-square fs-5"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger border-0" onClick={() => onDelete(item._id)} title="Delete Entry">
                        <i className="bi bi-trash3 fs-5"></i>
                      </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <style>{`
        .bg-glass-header { background: rgba(255, 255, 255, 0.03); }
        .table-dark { --bs-table-bg: transparent; }
        .table-hover tbody tr:hover { background-color: rgba(255, 255, 255, 0.05) !important; transition: 0.2s; }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default ScheduleTable;