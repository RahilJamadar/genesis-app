import React, { useEffect, useState, useCallback } from 'react';
import adminApi from '../../../api/adminApi';
import ScheduleForm from './ScheduleForm';
import Navbar from '../../../components/Navbar';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, MapPin, Calendar, Activity, Trophy, Edit3, Save, X } from 'lucide-react';

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/schedules');
      const sortedData = res.data.sort((a, b) => {
        const dateDiff = new Date(a.date) - new Date(b.date);
        if (dateDiff !== 0) return dateDiff;
        return a.startTime.localeCompare(b.startTime);
      });
      setSchedules(sortedData);
    } catch (err) {
      toast.error('❌ Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Format 24h to 12h
  const to12Hour = (time24) => {
    if (!time24) return "";
    let [hrs, mins] = time24.split(':').map(Number);
    const suffix = hrs >= 12 ? "PM" : "AM";
    hrs = hrs % 12 || 12;
    return `${hrs}:${String(mins).padStart(2, '0')} ${suffix}`;
  };

  const calculateEndTime = (start, duration) => {
    if (!start) return "";
    const [hrs, mins] = start.split(':').map(Number);
    let totalMins = hrs * 60 + mins + Number(duration);
    const endHrs = Math.floor(totalMins / 60) % 24;
    const endMins = totalMins % 60;
    return `${String(endHrs).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
  };

  const handleAddSchedule = async (newSchedule) => {
    try {
      await adminApi.post('/schedules', newSchedule);
      fetchSchedules();
      toast.success('🚀 Schedule entry created');
    } catch (err) {
      toast.error(`❌ ${err.response?.data?.error || 'Error saving'}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('🚨 Permanent Action: Delete this entry?')) return;
    try {
      await adminApi.delete(`/schedules/${id}`);
      setSchedules((prev) => prev.filter((item) => item._id !== id));
      toast.success('🗑️ Entry purged');
    } catch (err) {
      toast.error('❌ Delete failed');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await adminApi.put(`/schedules/${editItem._id}`, editItem);
      setEditItem(null);
      fetchSchedules();
      toast.success('✅ Schedule updated');
    } catch (err) {
      toast.error('❌ Update failed');
    }
  };

  // ADVANCED GROUPING LOGIC: Groups by Date -> Consolidates overlapping Events
  const getProcessedTimeline = (items) => {
    const sorted = [...items].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const processed = [];
    
    sorted.forEach(item => {
      if (item.type === 'activity') {
        // Activities always get their own dedicated row
        processed.push({
          timeLabel: `${to12Hour(item.startTime)} - ${to12Hour(calculateEndTime(item.startTime, item.duration))}`,
          items: [item],
          isActivity: true
        });
      } else {
        // Logic for merging overlapping Events
        const lastGroup = processed[processed.length - 1];
        const itemEndTime = calculateEndTime(item.startTime, item.duration);
        
        if (lastGroup && !lastGroup.isActivity && item.startTime <= lastGroup.maxEnd) {
          lastGroup.items.push(item);
          if (itemEndTime > lastGroup.maxEnd) {
            lastGroup.maxEnd = itemEndTime;
            lastGroup.timeLabel = `${to12Hour(lastGroup.minStart)} - ${to12Hour(itemEndTime)}`;
          }
        } else {
          processed.push({
            minStart: item.startTime,
            maxEnd: itemEndTime,
            timeLabel: `${to12Hour(item.startTime)} - ${to12Hour(itemEndTime)}`,
            items: [item],
            isActivity: false
          });
        }
      }
    });
    return processed;
  };

  const groupedByDate = schedules.reduce((acc, item) => {
    const dateKey = new Date(item.date).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  return (
    <div className="d-flex bg-dark min-vh-100 flex-column flex-lg-row overflow-x-hidden">
      <Navbar />

      <main className="dashboard-content flex-grow-1 p-3 p-md-4">
        <header className="mb-5 d-flex flex-column flex-md-row justify-content-between align-items-center gap-4 mt-2">
          <div className="text-center text-md-start">
            <h1 className="fw-black text-white mb-1 display-5 tracking-tighter uppercase italic">
              Event <span className="text-info">Schedule</span>
            </h1>
            <p className="text-secondary font-mono x-small uppercase tracking-[0.3em] mb-0">
              Championship Timeline Management
            </p>
          </div>
          <div className="bg-glass-card px-4 py-2 border border-info border-opacity-20 rounded-pill shadow-glow">
            <span className="text-info x-small fw-bold font-mono">SLOTS: {schedules.length}</span>
          </div>
        </header>

        <div className="row g-4">
          <div className="col-12 col-xl-4 order-2 order-xl-1">
            <div className="sticky-xl-top" style={{ top: '1.5rem' }}>
              <ScheduleForm onAdd={handleAddSchedule} />
            </div>
          </div>

          <div className="col-12 col-xl-8 order-1 order-xl-2">
            {loading ? (
              <div className="text-center py-5 text-info font-mono x-small blink">SYNCING_TIME_STREAM...</div>
            ) : Object.keys(groupedByDate).length > 0 ? (
              Object.entries(groupedByDate).map(([date, items]) => (
                <div key={date} className="mb-5">
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="date-header shadow-glow-info">
                      <Calendar size={14} className="me-2" /> {date}
                    </div>
                    <div className="flex-grow-1 border-bottom border-info border-opacity-20"></div>
                  </div>

                  <div className="schedule-box border border-info border-opacity-10 rounded-4 overflow-hidden bg-glass-card shadow-lg">
                    <div className="row g-0 bg-info bg-opacity-10 py-3 border-bottom border-info border-opacity-20 d-none d-md-flex">
                      <div className="col-3 text-center text-info fw-black x-small ls-2 uppercase">TIMING (12H)</div>
                      <div className="col-9 text-center text-info fw-black x-small ls-2 uppercase">COMPONENTS</div>
                    </div>

                    {getProcessedTimeline(items).map((slot, sIdx) => (
                      <div key={sIdx} className="row g-0 align-items-center border-bottom border-info border-opacity-5 hover-row py-3">
                        <div className="col-12 col-md-3 px-3 text-center border-md-end border-info border-opacity-10 mb-2 mb-md-0">
                          <div className="time-pill px-3 py-1 d-inline-block shadow-sm">
                             <span className="text-white fw-bold font-mono small">{slot.timeLabel}</span>
                          </div>
                        </div>

                        <div className="col-12 col-md-9 px-3 px-md-4 d-flex flex-wrap gap-2 justify-content-center justify-content-md-start">
                           {slot.items.map((item) => (
                             <motion.div 
                               key={item._id}
                               whileHover={{ y: -2 }}
                               title={`Starts: ${to12Hour(item.startTime)} | Ends: ${to12Hour(calculateEndTime(item.startTime, item.duration))}`}
                               className={`event-capsule ${item.type === 'event' ? 'event-gradient' : 'activity-gradient'}`}
                               style={{ flex: slot.items.length > 1 ? '1 1 45%' : '1 1 100%', maxWidth: slot.items.length > 1 ? '48%' : '100%' }}
                             >
                               <div className="d-flex justify-content-between align-items-center w-100">
                                 <div className="d-flex align-items-center gap-2 overflow-hidden">
                                   {item.type === 'event' ? <Trophy size={14} className="flex-shrink-0" /> : <Activity size={14} className="flex-shrink-0" />}
                                   <div className="overflow-hidden">
                                      <div className="fw-black text-white x-small uppercase tracking-tighter text-truncate">
                                        {item.type === 'event' ? item.eventId?.name : item.activityTitle}
                                        {item.type === 'event' && <span className="opacity-50 ms-1 text-info">(R{item.round})</span>}
                                      </div>
                                      <div className="opacity-75 font-mono text-truncate" style={{ fontSize: '0.6rem' }}>
                                        <MapPin size={8} className="d-inline mb-1" /> {item.room}
                                      </div>
                                   </div>
                                 </div>
                                 <div className="d-flex gap-1 ms-2">
                                    <button onClick={() => setEditItem(item)} className="action-btn edit-btn"><Edit3 size={12} /></button>
                                    <button onClick={() => handleDelete(item._id)} className="action-btn del-btn"><Trash2 size={12} /></button>
                                 </div>
                               </div>
                             </motion.div>
                           ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-5 bg-glass-card border border-info border-opacity-10 rounded-4">
                 <p className="text-secondary font-mono small mb-0 uppercase ls-2">Timeline_Empty</p>
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        <AnimatePresence>
          {editItem && (
            <div className="modal-overlay">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="modal-card bg-glass-card p-4 border border-info border-opacity-20 shadow-lg"
              >
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="text-white fw-bold mb-0">Modify Node</h5>
                  <button onClick={() => setEditItem(null)} className="text-secondary hover-white bg-transparent border-0"><X size={20} /></button>
                </div>
                <form onSubmit={handleUpdate} className="row g-3">
                  <div className="col-12">
                    <label className="text-info x-small fw-bold mb-1">NAME / TITLE</label>
                    <input 
                      className="form-control bg-dark text-white border-secondary"
                      value={editItem.type === 'event' ? (editItem.eventId?.name || "") : editItem.activityTitle}
                      onChange={(e) => setEditItem({...editItem, activityTitle: e.target.value})}
                      disabled={editItem.type === 'event'}
                    />
                  </div>
                  <div className="col-6">
                    <label className="text-info x-small fw-bold mb-1">START (24H)</label>
                    <input type="time" className="form-control bg-dark text-white border-secondary" value={editItem.startTime} onChange={(e) => setEditItem({...editItem, startTime: e.target.value})} />
                  </div>
                  <div className="col-6">
                    <label className="text-info x-small fw-bold mb-1">DURATION (MINS)</label>
                    <input type="number" className="form-control bg-dark text-white border-secondary" value={editItem.duration} onChange={(e) => setEditItem({...editItem, duration: e.target.value})} />
                  </div>
                  <div className="col-12">
                    <label className="text-info x-small fw-bold mb-1">ROOM / VENUE</label>
                    <input className="form-control bg-dark text-white border-secondary" value={editItem.room} onChange={(e) => setEditItem({...editItem, room: e.target.value})} />
                  </div>
                  <button type="submit" className="btn btn-info w-100 fw-bold py-2 mt-3 d-flex align-items-center justify-content-center gap-2"><Save size={16} /> SYNC CHANGES</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <style>{`
        @media (min-width: 992px) { .dashboard-content { margin-left: 280px !important; } }
        .bg-glass-card { background: rgba(10, 15, 25, 0.9) !important; backdrop-filter: blur(20px); border: 1px solid rgba(0, 255, 255, 0.1); }
        .date-header { background: #0dcaf0; color: black; padding: 6px 16px; border-radius: 8px; font-weight: 900; font-size: 0.75rem; text-transform: uppercase; display: flex; align-items: center; }
        .time-pill { background: rgba(13, 202, 240, 0.1); border: 1px solid rgba(13, 202, 240, 0.3); border-radius: 50px; }
        .event-capsule { border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 50px; padding: 10px 18px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); overflow: hidden; }
        .event-gradient { background: linear-gradient(90deg, rgba(13, 202, 240, 0.25), rgba(13, 202, 240, 0.05)); border-color: rgba(13, 202, 240, 0.4); }
        .activity-gradient { background: linear-gradient(90deg, rgba(255, 193, 7, 0.25), rgba(255, 193, 7, 0.05)); border-color: rgba(255, 193, 7, 0.4); }
        .action-btn { background: transparent; border: none; color: #888; transition: 0.2s; padding: 4px; display: flex; align-items: center; }
        .edit-btn:hover { color: #0dcaf0; transform: scale(1.2); }
        .del-btn:hover { color: #ff4d4d; transform: scale(1.2); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
        .modal-card { width: 95%; max-width: 420px; border-radius: 20px; }
        .ls-2 { letter-spacing: 2px; }
        .fw-black { font-weight: 900; }
        .blink { animation: blinker 2s linear infinite; }
        @keyframes blinker { 50% { opacity: 0.4; } }
        @media (max-width: 768px) { .event-capsule { border-radius: 12px; flex: 1 1 100% !important; max-width: 100% !important; } }
      `}</style>
    </div>
  );
};

export default SchedulePage;