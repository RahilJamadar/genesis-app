import React, { useState, useEffect } from 'react';
import adminApi from '../../../api/adminApi';
import { toast } from 'react-toastify';
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
      
      <div className="card bg-glass border-secondary shadow-lg mx-auto w-100 border-opacity-10" style={{ maxWidth: '450px' }}>
        <div className="card-body p-3 p-md-4">
          <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2 fs-6 fs-md-5">
            <i className="bi bi-calendar-plus text-info"></i> Create Schedule
          </h5>

          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            {/* Event Selection */}
            <div className="form-group">
              <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Select Event</label>
              <div className="input-group">
                <span className="input-group-text bg-black bg-opacity-40 border-secondary text-secondary">
                  <i className="bi bi-trophy"></i>
                </span>
                <select
                  name="eventId"
                  value={form.eventId}
                  onChange={handleChange}
                  className="form-select bg-dark text-white border-secondary shadow-none py-2 py-md-2"
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

            {/* Date & Time Row */}
            <div className="row g-2 g-md-3">
              <div className="col-12 col-md-6">
                <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="form-control bg-dark text-white border-secondary shadow-none py-2"
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Start Time</label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className="form-control bg-dark text-white border-secondary shadow-none py-2"
                  required
                />
              </div>
            </div>

            {/* Venue Input */}
            <div className="form-group">
              <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Venue / Classroom</label>
              <div className="input-group">
                <span className="input-group-text bg-black bg-opacity-40 border-secondary text-secondary">
                  <i className="bi bi-geo-alt"></i>
                </span>
                <input
                  name="room"
                  value={form.room}
                  onChange={handleChange}
                  className="form-control bg-dark text-white border-secondary shadow-none py-2"
                  placeholder="e.g., Room 302"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn btn-info fw-bold mt-2 py-3 shadow-lg d-flex align-items-center justify-content-center gap-2 text-black"
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
          background: rgba(255, 255, 255, 0.03) !important; 
          backdrop-filter: blur(20px); 
          border-radius: 20px; 
        }

        .x-small { font-size: 0.7rem; }
        .ls-1 { letter-spacing: 1px; }

        .input-group-text { 
          border-radius: 12px 0 0 12px; 
          padding-left: 1rem;
          padding-right: 1rem;
        }

        .form-control, .form-select { 
          border-radius: 0 12px 12px 0; 
          font-size: 0.9rem;
        }

        /* Better date/time icons for mobile browsers */
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
          padding: 5px;
        }

        /* Responsive spacing for smaller phones */
        @media (max-width: 576px) {
          .card-body { padding: 1.25rem !important; }
        }
      `}</style>
    </>
  );
};

export default ScheduleForm;