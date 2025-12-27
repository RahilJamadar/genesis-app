import React, { useState, useEffect } from 'react';
import adminApi from '../../../api/adminApi';
import { toast } from 'react-toastify';
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
    <div className="schedule-table-container rounded-3 overflow-hidden">
      
      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle mb-0">
          <thead className="bg-glass-header border-bottom border-secondary border-opacity-50">
            <tr className="text-info x-small text-uppercase fw-bold">
              <th className="ps-4 py-3 min-w-200">Event Name</th>
              <th className="py-3">Category</th>
              <th className="py-3 min-w-150">Date</th>
              <th className="py-3 min-w-120">Time</th>
              <th className="py-3 min-w-150">Venue</th>
              <th className="text-center pe-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="border-top-0">
            {data.map((item) => (
              <tr key={item._id} className="border-bottom border-secondary border-opacity-10">
                {editingId === item._id ? (
                  // --- INLINE EDIT MODE ---
                  <>
                    <td className="ps-4">
                      <select name="eventId" value={form.eventId} onChange={handleChange}
                        className="form-select form-select-sm bg-dark text-white border-info py-2">
                        {events.map(ev => <option key={ev._id} value={ev._id}>{ev.name}</option>)}
                      </select>
                    </td>
                    <td><span className="text-muted x-small">Select Above</span></td>
                    <td>
                      <input type="date" name="date" value={form.date} onChange={handleChange}
                        className="form-control form-control-sm bg-dark text-white border-info py-2" />
                    </td>
                    <td>
                      <input type="time" name="time" value={form.time} onChange={handleChange}
                        className="form-control form-control-sm bg-dark text-white border-info py-2" />
                    </td>
                    <td>
                      <input name="room" value={form.room} onChange={handleChange}
                        className="form-control form-control-sm bg-dark text-white border-info py-2" />
                    </td>
                    <td className="text-center pe-4">
                      <div className="d-flex flex-column flex-md-row justify-content-center gap-2">
                        <button className="btn btn-sm btn-info fw-bold" onClick={handleSave}>SAVE</button>
                        <button className="btn btn-sm btn-outline-secondary text-white" onClick={() => setEditingId(null)}>EXIT</button>
                      </div>
                    </td>
                  </>
                ) : (
                  // --- DISPLAY MODE ---
                  <>
                    <td className="ps-4 py-3">
                      <div className="fw-bold text-white fs-6">{item.eventId?.name || 'Unknown Event'}</div>
                    </td>
                    <td>
                      <span className={`badge x-small-badge ${getCategoryBadge(item.eventId?.category)}`}>
                        {item.eventId?.category || 'General'}
                      </span>
                    </td>
                    <td className="text-light small">{item.date}</td>
                    <td className="text-light small">{item.time}</td>
                    <td><span className="badge bg-black bg-opacity-40 border border-secondary border-opacity-30 text-info fw-normal small">{item.room}</span></td>
                    <td className="text-center pe-4">
                      <div className="d-flex justify-content-center gap-1 gap-md-2">
                        <button className="btn btn-sm btn-outline-warning border-0 p-2" onClick={() => startEdit(item)} title="Edit">
                          <i className="bi bi-pencil-square fs-5"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger border-0 p-2" onClick={() => onDelete(item._id)} title="Delete">
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
      </div>

      <style>{`
        .schedule-table-container {
          background: rgba(0, 0, 0, 0.2);
        }

        .bg-glass-header { 
          background: rgba(255, 255, 255, 0.05); 
          backdrop-filter: blur(5px);
        }

        .table-dark { --bs-table-bg: transparent; }
        
        .table-hover tbody tr:hover { 
          background-color: rgba(13, 202, 240, 0.05) !important; 
          transition: 0.3s ease; 
        }

        .x-small { font-size: 0.7rem; letter-spacing: 0.5px; }
        .x-small-badge { font-size: 0.65rem; padding: 0.4em 0.8em; }

        /* Column width management for scrollable mobile view */
        .min-w-200 { min-width: 200px; }
        .min-w-150 { min-width: 150px; }
        .min-w-120 { min-width: 120px; }

        /* Smooth scroll for mobile */
        .table-responsive {
          scrollbar-width: thin;
          scrollbar-color: rgba(13, 202, 240, 0.2) transparent;
          -webkit-overflow-scrolling: touch;
        }

        .table-responsive::-webkit-scrollbar { height: 6px; }
        .table-responsive::-webkit-scrollbar-thumb {
          background: rgba(13, 202, 240, 0.3);
          border-radius: 10px;
        }

        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .table-responsive {
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default ScheduleTable;