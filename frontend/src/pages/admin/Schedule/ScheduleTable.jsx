import React, { useState, useEffect } from 'react';
import adminApi from '../../../api/adminApi';
import { toast } from 'react-toastify';
import { Edit3, Trash2, MapPin, Clock, Calendar, Save, XCircle, Award, Coffee } from 'lucide-react';

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

  // Helper to format time to 12-hour catchy format
  const formatTime = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

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

  const handleSave = () => {
    onEdit(editingId, form);
    setEditingId(null);
  };

  return (
    <div className="schedule-master-container">
      {Object.keys(groupedSchedules).length > 0 ? (
        Object.keys(groupedSchedules).map((date) => (
          <div key={date} className="date-group-section mb-5 animate-fade-in">
            {/* Catchy Date Header */}
            <div className="d-flex align-items-center gap-3 mb-4 mt-2">
              <div className="date-pill shadow-glow">
                <Calendar size={14} className="me-2" />
                {date}
              </div>
              <div className="flex-grow-1 header-line"></div>
            </div>

            {/* Desktop View Table */}
            <div className="d-none d-lg-block table-responsive rounded-4 border border-secondary border-opacity-10 bg-black bg-opacity-20">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead className="bg-white bg-opacity-5">
                  <tr className="text-info x-small text-uppercase fw-bold ls-1">
                    <th className="ps-4 py-3">Timing</th>
                    <th className="py-3">Event / Activity</th>
                    <th className="py-3">Venue</th>
                    <th className="text-center pe-4 py-3">Management</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedSchedules[date].map((item) => (
                    <tr key={item._id} className={`border-bottom border-secondary border-opacity-10 transition-all ${editingId === item._id ? 'editing-row' : ''}`}>
                      {editingId === item._id ? (
                        <td colSpan="4" className="p-4 bg-info bg-opacity-5">
                          <div className="row g-3">
                            <div className="col-md-2">
                              <label className="x-small text-info fw-bold mb-1">TYPE</label>
                              <select className="form-select form-select-sm bg-dark text-white border-secondary" name="type" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}>
                                <option value="event">Event</option>
                                <option value="activity">Activity</option>
                              </select>
                            </div>
                            <div className="col-md-4">
                              <label className="x-small text-info fw-bold mb-1">{form.type === 'event' ? 'SELECT EVENT' : 'TITLE'}</label>
                              {form.type === 'event' ? (
                                <select className="form-select form-select-sm bg-dark text-white border-secondary" name="eventId" value={form.eventId} onChange={(e) => setForm({...form, eventId: e.target.value})}>
                                  <option value="">Choose...</option>
                                  {events.map(ev => <option key={ev._id} value={ev._id}>{ev.name}</option>)}
                                </select>
                              ) : (
                                <input className="form-control form-control-sm bg-dark text-white border-secondary" value={form.activityTitle} onChange={(e) => setForm({...form, activityTitle: e.target.value})} />
                              )}
                            </div>
                            <div className="col-md-2">
                              <label className="x-small text-info fw-bold mb-1">START</label>
                              <input type="time" className="form-control form-control-sm bg-dark text-white border-secondary" value={form.startTime} onChange={(e) => setForm({...form, startTime: e.target.value})} />
                            </div>
                            <div className="col-md-2">
                              <label className="x-small text-info fw-bold mb-1">ROOM</label>
                              <input className="form-control form-control-sm bg-dark text-white border-secondary" value={form.room} onChange={(e) => setForm({...form, room: e.target.value})} />
                            </div>
                            <div className="col-md-2 d-flex align-items-end gap-2">
                              <button className="btn btn-sm btn-info w-100 fw-bold" onClick={handleSave}><Save size={14} /></button>
                              <button className="btn btn-sm btn-outline-secondary w-100" onClick={() => setEditingId(null)}><XCircle size={14} /></button>
                            </div>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td className="ps-4">
                            <div className="text-white fw-bold fs-6">{formatTime(item.startTime)}</div>
                            <div className="x-small text-secondary font-mono">{item.duration} MINS</div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <div className={`icon-box ${item.type === 'event' ? 'text-info' : 'text-warning'}`}>
                                {item.type === 'event' ? <Award size={20} /> : <Coffee size={20} />}
                              </div>
                              <div>
                                <div className="text-white fw-bold">{item.type === 'event' ? item.eventId?.name : item.activityTitle}</div>
                                <div className="x-small text-info opacity-75">
                                  {item.type === 'event' ? `ROUND ${item.round} • ${item.eventId?.category}` : item.details || 'LOGISTICS'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2 text-secondary small">
                              <MapPin size={14} className="text-info" /> {item.room}
                            </div>
                          </td>
                          <td className="text-center pe-4">
                            <div className="btn-group border border-secondary border-opacity-20 rounded-3 overflow-hidden">
                              <button className="btn btn-dark btn-sm text-warning py-2 px-3" onClick={() => startEdit(item)}><Edit3 size={16} /></button>
                              <button className="btn btn-dark btn-sm text-danger py-2 px-3" onClick={() => onDelete(item._id)}><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View Cards */}
            <div className="d-block d-lg-none">
              {groupedSchedules[date].map((item) => (
                <div key={item._id} className="mobile-schedule-card bg-glass border border-secondary border-opacity-10 mb-3 p-3 rounded-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-2">
                       <Clock size={16} className="text-info" />
                       <span className="fw-bold text-white">{formatTime(item.startTime)}</span>
                       <span className="x-small text-secondary">({item.duration}m)</span>
                    </div>
                    <div className="d-flex gap-2">
                       <button className="btn-icon-sm text-warning" onClick={() => startEdit(item)}><Edit3 size={16} /></button>
                       <button className="btn-icon-sm text-danger" onClick={() => onDelete(item._id)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <h6 className="text-white fw-black mb-1">
                    {item.type === 'event' ? item.eventId?.name : item.activityTitle}
                  </h6>
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <span className={`badge ${item.type === 'event' ? 'bg-info' : 'bg-warning'} text-black x-small-badge uppercase`}>
                      {item.type === 'event' ? `ROUND ${item.round}` : 'ACTIVITY'}
                    </span>
                    <span className="text-secondary x-small d-flex align-items-center gap-1">
                      <MapPin size={12} /> {item.room}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-5 bg-glass-dark rounded-4">
          <Clock size={40} className="text-secondary opacity-20 mb-3" />
          <p className="text-secondary font-mono small ls-1">NULL_TIMELINE_DETECTED</p>
        </div>
      )}

      <style>{`
        .date-pill {
          background: #0dcaf0;
          color: black;
          padding: 8px 20px;
          border-radius: 100px;
          font-weight: 800;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .header-line {
          height: 1px;
          background: linear-gradient(to right, rgba(13, 202, 240, 0.3), transparent);
        }

        .icon-box {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .mobile-schedule-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(10px);
        }

        .btn-icon-sm {
          background: transparent;
          border: none;
          padding: 4px;
          opacity: 0.7;
          transition: 0.2s;
        }
        .btn-icon-sm:hover { opacity: 1; transform: scale(1.1); }

        .editing-row { background: rgba(13, 202, 240, 0.05) !important; }

        .x-small-badge { font-size: 0.6rem; padding: 0.3em 0.7em; font-weight: 900; }
        .ls-1 { letter-spacing: 1px; }
        .fw-black { font-weight: 900; }
        .shadow-glow { box-shadow: 0 0 20px rgba(13, 202, 240, 0.2); }
        
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ScheduleTable;