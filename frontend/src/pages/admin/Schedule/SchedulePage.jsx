import React, { useEffect, useState } from 'react';
import adminApi from '../../../api/adminApi';
import ScheduleForm from './ScheduleForm';
import ScheduleTable from './ScheduleTable';
import Navbar from '../../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      // adminApi automatically prefixes /api/admin and adds headers
      const res = await adminApi.get('/schedules');
      setSchedules(res.data);
    } catch (err) {
      toast.error('❌ Failed to fetch event schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async (newSchedule) => {
    try {
      // Remove 'const res =' since we just need to wait for the post to finish
      await adminApi.post('/schedules', newSchedule);

      // Refresh the list from the server to get populated data
      fetchSchedules();
      toast.success('✅ Schedule entry created');
    } catch (err) {
      toast.error('❌ Error saving schedule');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ Permanent Action: Delete this schedule entry?')) return;
    try {
      await adminApi.delete(`/schedules/${id}`);
      setSchedules((prev) => prev.filter((item) => item._id !== id));
      toast.success('🗑️ Entry removed');
    } catch (err) {
      toast.error('❌ Delete operation failed');
    }
  };

  const handleEdit = async (id, updated) => {
    try {
      // Remove 'const res =' here as well
      await adminApi.put(`/schedules/${id}`, updated);

      fetchSchedules();
      toast.success('✏️ Schedule modified');
    } catch (err) {
      toast.error('❌ Update failed');
    }
  };

  return (
    <div className="d-flex bg-dark min-vh-100">
      <Navbar />

      <main className="dashboard-content flex-grow-1 p-4 p-lg-5">
        <ToastContainer theme="dark" position="top-right" autoClose={2000} />

        <header className="mb-5">
          <h2 className="fw-bold text-white mb-1">Event Scheduler</h2>
          <p className="text-light opacity-75">Assign dates, times, and venues for all fest activities</p>
        </header>

        <div className="row g-5">
          {/* Left Column: Form (Sticky on Desktop) */}
          <div className="col-xl-4">
            <div className="sticky-xl-top" style={{ top: '2rem', zIndex: 10 }}>
              <ScheduleForm onAdd={handleAddSchedule} />

              <div className="card bg-glass border-info border-opacity-10 mt-4">
                <div className="card-body p-3 text-center">
                  <small className="text-info opacity-75">
                    <i className="bi bi-info-circle me-2"></i>
                    All times are in 24-hour format. Changes reflect instantly on the public timeline.
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Timeline Table */}
          <div className="col-xl-8">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-info" role="status"></div>
              </div>
            ) : (
              <div className="card bg-glass border-secondary shadow-lg">
                <div className="card-body p-0">
                  <ScheduleTable
                    data={schedules}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                </div>
              </div>
            )}

            {schedules.length === 0 && !loading && (
              <div className="text-center py-5 bg-glass border border-secondary border-dashed rounded mt-3">
                <p className="text-secondary mb-0">No events scheduled yet. Use the form to start.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .dashboard-content { margin-left: 260px; }
        .bg-glass { background: rgba(255, 255, 255, 0.05) !important; backdrop-filter: blur(12px); border-radius: 18px; }
        .border-dashed { border-style: dashed !important; }
        @media (max-width: 991.98px) { 
          .dashboard-content { margin-left: 0; padding-top: 80px; } 
        }
      `}</style>
    </div>
  );
};

export default SchedulePage;