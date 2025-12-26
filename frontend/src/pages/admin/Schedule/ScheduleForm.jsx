import React, { useState, useEffect } from 'react';
import adminApi from '../../../api/adminApi';
import { ToastContainer, toast } from 'react-toastify';

const ScheduleForm = ({ onAdd }) => {
  const [form, setForm] = useState({
    eventId: '',
    date: '',
    time: '',
    room: '',
  });

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await adminApi.get('/events');
        setEvents(res.data);
      } catch (err) {
        toast.error('❌ Failed to fetch events for scheduling');
      }
    };
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { eventId, date, time, room } = form;
    
    if (!eventId || !date || !time || !room) {
      toast.warn('⚠️ Please fill all scheduling fields');
      return;
    }

    setLoading(true);
    try {
      // Logic assumes parent component handles the actual API POST via onAdd
      await onAdd(form);
      setForm({ eventId: '', date: '', time: '', room: '' });
    } catch (err) {
      toast.error('❌ Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer theme="dark" position="top-right" autoClose={2000} hideProgressBar />
      
      <div className="card bg-glass border-secondary shadow-lg mx-auto" style={{ maxWidth: '450px' }}>
        <div className="card-body p-4">
          <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
            <i className="bi bi-calendar-plus text-info"></i> Create Schedule
          </h5>

          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            <div className="form-group">
              <label className="text-info small fw-bold mb-2 d-block text-uppercase">Select Event</label>
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-secondary">
                  <i className="bi bi-trophy"></i>
                </span>
                <select
                  name="eventId"
                  value={form.eventId}
                  onChange={handleChange}
                  className="form-select bg-dark text-white border-secondary shadow-none"
                  required
                >
                  <option value="">Choose an event...</option>
                  {events.map(event => (
                    <option key={event._id} value={event._id}>
                      {event.name} ({event.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="text-info small fw-bold mb-2 d-block text-uppercase">Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="form-control bg-dark text-white border-secondary shadow-none"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="text-info small fw-bold mb-2 d-block text-uppercase">Start Time</label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className="form-control bg-dark text-white border-secondary shadow-none"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="text-info small fw-bold mb-2 d-block text-uppercase">Venue / Classroom</label>
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-secondary">
                  <i className="bi bi-geo-alt"></i>
                </span>
                <input
                  name="room"
                  value={form.room}
                  onChange={handleChange}
                  className="form-control bg-dark text-white border-secondary shadow-none"
                  placeholder="e.g., Room 302 or Main Hall"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-info fw-bold mt-3 py-2 shadow-sm d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                <><i className="bi bi-plus-lg"></i> ADD TO SCHEDULE</>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .bg-glass { 
          background: rgba(255, 255, 255, 0.05) !important; 
          backdrop-filter: blur(12px); 
          border-radius: 18px; 
        }
        .input-group-text { border-radius: 10px 0 0 10px; }
        .form-control, .form-select { border-radius: 0 10px 10px 0; }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default ScheduleForm;