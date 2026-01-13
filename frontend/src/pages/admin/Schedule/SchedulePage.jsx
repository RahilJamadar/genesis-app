import React, { useEffect, useState, useCallback } from 'react';
import adminApi from '../../../api/adminApi';
import ScheduleForm from './ScheduleForm';
import ScheduleTable from './ScheduleTable';
import Navbar from '../../../components/Navbar';
import { toast } from 'react-toastify';

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/schedules');
      setSchedules(res.data);
    } catch (err) {
      toast.error('❌ Failed to fetch event schedules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleAddSchedule = async (newSchedule) => {
    try {
      // Logic inside Form handles data cleanup, just send to API
      await adminApi.post('/schedules', newSchedule);
      fetchSchedules();
      toast.success('🚀 Schedule entry successfully committed');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error saving schedule';
      toast.error(`❌ ${errorMsg}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ Permanent Action: Remove this activity from the timeline?')) return;
    try {
      await adminApi.delete(`/schedules/${id}`);
      setSchedules((prev) => prev.filter((item) => item._id !== id));
      toast.success('🗑️ Entry removed from schedule');
    } catch (err) {
      toast.error('❌ Delete operation failed');
    }
  };

  // Note: HandleEdit can be expanded to a Modal if you choose to implement a separate edit UI
  const handleEdit = async (id, updated) => {
    try {
      await adminApi.put(`/schedules/${id}`, updated);
      fetchSchedules();
      toast.success('✏️ Schedule modified successfully');
    } catch (err) {
      toast.error('❌ Update failed');
    }
  };

  return (
    <div className="d-flex bg-dark min-vh-100 flex-column flex-lg-row">
      <Navbar />

      <main className="dashboard-content flex-grow-1 p-3 p-md-4 p-lg-5">
        <header className="mb-4 mb-lg-5 text-center text-lg-start d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
          <div>
            <h2 className="fw-bold text-white mb-1 fs-3 fs-md-2 tracking-tight">Event Scheduler Engine</h2>
            <p className="text-info opacity-75 small font-mono uppercase tracking-widest mb-0">
              Technical Rounds • Logistics • Timeline Management
            </p>
          </div>
          <div className="bg-glass px-4 py-2 border border-secondary border-opacity-20">
             <span className="text-secondary x-small fw-bold d-block">TOTAL ENTRIES</span>
             <span className="text-white fw-black h4 mb-0">{schedules.length}</span>
          </div>
        </header>

        <div className="row g-4 g-xl-5">
          {/* Left Column: Form Section */}
          <div className="col-12 col-xl-4 order-2 order-xl-1">
            <div className="sticky-xl-top schedule-form-container">
              <ScheduleForm onAdd={handleAddSchedule} />

              <div className="card bg-glass border-info border-opacity-10 mt-4 d-none d-md-block">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className="bi bi-shield-check text-info"></i>
                    <span className="text-white x-small fw-bold ls-1 uppercase">Scheduling Rules</span>
                  </div>
                  <ul className="list-unstyled mb-0 text-light opacity-50 x-small" style={{ lineHeight: '1.6' }}>
                    <li>• "Activities" cover Lunch, Breaks & Ceremony.</li>
                    <li>• "Events" are technical/gaming competition rounds.</li>
                    <li>• Timeline is automatically sorted chronologically.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Timeline Table */}
          <div className="col-12 col-xl-8 order-1 order-xl-2">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-info" role="status"></div>
                <p className="text-info x-small fw-bold mt-3 ls-1">SYNCING TIMELINE...</p>
              </div>
            ) : schedules.length > 0 ? (
              <div className="card bg-glass border-secondary shadow-lg border-opacity-10">
                <div className="card-body p-3 p-md-4">
                  <div className="table-responsive-wrapper">
                    <ScheduleTable
                      schedules={schedules}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-5 bg-glass border border-secondary border-dashed rounded mt-3">
                <i className="bi bi-calendar-x fs-1 text-secondary opacity-25 d-block mb-3"></i>
                <h5 className="text-white opacity-50">Empty Registry</h5>
                <p className="text-secondary mb-0 small">No events scheduled. Use the engine to build your timeline.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        @media (min-width: 992px) {
          .dashboard-content { margin-left: 280px; }
          .sticky-xl-top { top: 2rem; z-index: 10; }
        }

        @media (max-width: 991.98px) {
          .dashboard-content { margin-left: 0; padding-top: 10px; }
        }

        .bg-glass { 
          background: rgba(255, 255, 255, 0.03) !important; 
          backdrop-filter: blur(20px); 
          border-radius: 20px; 
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .border-dashed { border-style: dashed !important; }
        .x-small { font-size: 0.65rem; }
        .ls-1 { letter-spacing: 1px; }
        .fw-black { font-weight: 900; }
        
        .table-responsive-wrapper {
          width: 100%;
          overflow-x: auto;
          scrollbar-width: thin;
        }

        /* Timeline grouping styles */
        .date-divider {
          border-left: 4px solid #0dcaf0;
          padding-left: 1rem;
          margin-bottom: 2rem;
        }
      `}</style>
    </div>
  );
};

export default SchedulePage;