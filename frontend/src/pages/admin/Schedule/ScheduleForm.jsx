import React, { useState, useEffect } from 'react';
import adminApi from '../../../api/adminApi';
import { toast } from 'react-toastify';

const ScheduleForm = ({ onAdd }) => {
  const [form, setForm] = useState({
    type: 'event',
    eventId: '',
    round: 1,
    activityTitle: '',
    date: '',
    startTime: '',
    duration: '',
    room: '',
    details: ''
  });

  const [events, setEvents] = useState([]);
  const [selectedEventMaxRounds, setSelectedEventMaxRounds] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await adminApi.get('/events');
        setEvents(res.data);
      } catch (err) {
        toast.error('❌ Failed to fetch events');
      }
    };
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // If event changes, update max rounds for the select dropdown
    if (name === 'eventId') {
      const event = events.find(ev => ev._id === value);
      setSelectedEventMaxRounds(event ? event.rounds : 1);
      setForm(prev => ({ ...prev, round: 1 })); // Reset to round 1
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd(form);
      // Reset form but keep date for easier consecutive entries
      setForm({
        ...form,
        eventId: '',
        activityTitle: '',
        startTime: '',
        duration: '',
        room: '',
        details: ''
      });
      toast.success('🚀 Schedule entry added');
    } catch (err) {
      toast.error(err.response?.data?.error || '❌ Error saving schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-glass border-secondary shadow-lg mx-auto w-100 border-opacity-10" style={{ maxWidth: '500px' }}>
      <div className="card-body p-4">
        <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
          <i className="bi bi-calendar-range text-info"></i> Scheduler Engine
        </h5>

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          {/* Type Toggle */}
          <div className="btn-group w-100 mb-2">
            <button 
              type="button" 
              className={`btn btn-sm ${form.type === 'event' ? 'btn-info text-black' : 'btn-outline-secondary text-white'}`}
              onClick={() => setForm({...form, type: 'event'})}
            >Technical Event</button>
            <button 
              type="button" 
              className={`btn btn-sm ${form.type === 'activity' ? 'btn-info text-black' : 'btn-outline-secondary text-white'}`}
              onClick={() => setForm({...form, type: 'activity'})}
            >General Activity</button>
          </div>

          {form.type === 'event' ? (
            <div className="row g-2">
              <div className="col-8">
                <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Select Event</label>
                <select name="eventId" value={form.eventId} onChange={handleChange} className="form-select bg-dark text-white border-secondary shadow-none" required>
                  <option value="">Choose Event...</option>
                  {events.map(ev => <option key={ev._id} value={ev._id}>{ev.name}</option>)}
                </select>
              </div>
              <div className="col-4">
                <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Round</label>
                <select name="round" value={form.round} onChange={handleChange} className="form-select bg-dark text-white border-secondary shadow-none">
                  {[...Array(selectedEventMaxRounds)].map((_, i) => (
                    <option key={i+1} value={i+1}>Round {i+1}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Activity Title</label>
              <input 
                name="activityTitle" 
                value={form.activityTitle} 
                onChange={handleChange} 
                className="form-control bg-dark text-white border-secondary shadow-none" 
                placeholder="e.g. Inauguration, Lunch Break" 
                required 
              />
            </div>
          )}

          <div className="row g-2">
            <div className="col-6">
              <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className="form-control bg-dark text-white border-secondary shadow-none" required />
            </div>
            <div className="col-6">
              <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Start Time</label>
              <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="form-control bg-dark text-white border-secondary shadow-none" required />
            </div>
          </div>

          <div className="row g-2">
            <div className="col-6">
              <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Duration (Mins)</label>
              <input type="number" name="duration" value={form.duration} onChange={handleChange} className="form-control bg-dark text-white border-secondary shadow-none" placeholder="e.g. 60" required />
            </div>
            <div className="col-6">
              <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Venue</label>
              <input name="room" value={form.room} onChange={handleChange} className="form-control bg-dark text-white border-secondary shadow-none" placeholder="Lab / Hall" required />
            </div>
          </div>

          <div>
            <label className="text-info x-small fw-bold mb-2 d-block text-uppercase ls-1">Additional Details</label>
            <textarea name="details" value={form.details} onChange={handleChange} className="form-control bg-dark text-white border-secondary shadow-none" rows="2" placeholder="Hardware requirements etc."></textarea>
          </div>

          <button type="submit" className="btn btn-info fw-bold mt-2 py-3 text-black" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm"></span> : 'COMMIT TO SCHEDULE'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScheduleForm;