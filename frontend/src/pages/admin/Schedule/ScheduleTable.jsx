import React, { useState, useEffect } from 'react';
import adminApi from '../../../api/adminApi';
import { toast } from 'react-toastify';

const ScheduleTable = ({ schedules, onDelete, onEdit }) => {
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

  // Group schedules by date for a proper timeline view
  const groupedSchedules = (schedules || []).reduce((acc, curr) => {
    const dateStr = new Date(curr.date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(curr);
    return acc;
  }, {});

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      type: item.type,
      eventId: item.eventId?._id || '',
      round: item.round || 1,
      activityTitle: item.activityTitle || '',
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
      startTime: item.startTime,
      duration: item.duration,
      room: item.room,
      details: item.details || ''
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
    <div className="schedule-timeline p-3 p-md-4">
      {Object.keys(groupedSchedules).length > 0 ? (
        Object.keys(groupedSchedules).map((date) => (
          <div key={date} className="mb-5 animate-fade-in">
            {/* Date Header */}
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="bg-info rounded-pill px-3 py-1 text-black fw-bold x-small shadow-glow">
                {date}
              </div>
              <div className="flex-grow-1 border-bottom border-secondary border-opacity-25"></div>
            </div>

            <div className="table-responsive rounded-3 border border-secondary border-opacity-10">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead className="bg-white bg-opacity-5">
                  <tr className="text-info x-small text-uppercase fw-bold ls-1">
                    <th className="ps-4 py-3">Time & Duration</th>
                    <th className="py-3">Activity / Event</th>
                    <th className="py-3">Venue</th>
                    <th className="text-center pe-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedSchedules[date].map((item) => (
                    <tr key={item._id} className="border-bottom border-secondary border-opacity-10 transition-all">
                      {editingId === item._id ? (
                        /* --- INLINE EDIT MODE --- */
                        <td colSpan="4" className="p-3 bg-info bg-opacity-5">
                          <div className="row g-2">
                            <div className="col-md-3">
                              <label className="x-small text-info fw-bold">Type</label>
                              <select name="type" value={form.type} onChange={handleChange} className="form-select form-select-sm bg-dark text-white border-secondary">
                                <option value="event">Event</option>
                                <option value="activity">Activity</option>
                              </select>
                            </div>
                            {form.type === 'event' ? (
                              <div className="col-md-6">
                                <label className="x-small text-info fw-bold">Select Event</label>
                                <select name="eventId" value={form.eventId} onChange={handleChange} className="form-select form-select-sm bg-dark text-white border-secondary">
                                  <option value="">Choose...</option>
                                  {events.map(ev => <option key={ev._id} value={ev._id}>{ev.name}</option>)}
                                </select>
                              </div>
                            ) : (
                              <div className="col-md-6">
                                <label className="x-small text-info fw-bold">Title</label>
                                <input name="activityTitle" value={form.activityTitle} onChange={handleChange} className="form-control form-control-sm bg-dark text-white border-secondary" />
                              </div>
                            )}
                            <div className="col-md-3">
                              <label className="x-small text-info fw-bold">Time</label>
                              <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="form-control form-control-sm bg-dark text-white border-secondary" />
                            </div>
                            <div className="col-md-3">
                              <label className="x-small text-info fw-bold">Venue</label>
                              <input name="room" value={form.room} onChange={handleChange} className="form-control form-control-sm bg-dark text-white border-secondary" />
                            </div>
                            <div className="col-md-9 d-flex align-items-end justify-content-end gap-2">
                              <button className="btn btn-sm btn-info text-black fw-bold px-3" onClick={handleSave}>SAVE</button>
                              <button className="btn btn-sm btn-outline-secondary text-white px-3" onClick={() => setEditingId(null)}>EXIT</button>
                            </div>
                          </div>
                        </td>
                      ) : (
                        /* --- DISPLAY MODE --- */
                        <>
                          <td className="ps-4">
                            <div className="fw-bold text-white fs-6">{item.startTime}</div>
                            <div className="x-small text-secondary font-mono uppercase">{item.duration} MINS</div>
                          </td>
                          <td>
                            {item.type === 'event' ? (
                              <div>
                                <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 x-small-badge me-2">EVENT</span>
                                <span className="fw-bold text-white">{item.eventId?.name || 'N/A'}</span>
                                <div className="x-small text-secondary mt-1">Round {item.round} • {item.eventId?.category}</div>
                              </div>
                            ) : (
                              <div>
                                <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 x-small-badge me-2">ACTIVITY</span>
                                <span className="fw-bold text-warning">{item.activityTitle}</span>
                                <div className="x-small text-secondary mt-1">{item.details || 'General Logistics'}</div>
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-geo-alt text-info"></i>
                              <span className="text-light small">{item.room}</span>
                            </div>
                          </td>
                          <td className="text-center pe-4">
                            <div className="d-flex justify-content-center gap-2">
                              <button className="btn btn-sm btn-outline-warning border-0 p-2" onClick={() => startEdit(item)}>
                                <i className="bi bi-pencil-square"></i>
                              </button>
                              <button className="btn btn-sm btn-outline-danger border-0 p-2" onClick={() => onDelete(item._id)}>
                                <i className="bi bi-trash3"></i>
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
          </div>
        ))
      ) : (
        <div className="text-center py-5">
          <p className="text-secondary font-mono">NO ENTRIES FOUND IN DATABASE</p>
        </div>
      )}

      <style>{`
        .x-small { font-size: 0.65rem; }
        .x-small-badge { font-size: 0.6rem; padding: 0.4em 0.8em; letter-spacing: 0.5px; }
        .ls-1 { letter-spacing: 1px; }
        .shadow-glow { box-shadow: 0 0 15px rgba(13, 202, 240, 0.2); }
        .transition-all { transition: all 0.2s ease-in-out; }
        .animate-fade-in { animation: fadeIn 0.5s ease forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ScheduleTable;