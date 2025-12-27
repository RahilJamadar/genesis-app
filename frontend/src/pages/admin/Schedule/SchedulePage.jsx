import React, { useEffect, useState } from 'react';
import adminApi from '../../../api/adminApi';
import ScheduleForm from './ScheduleForm';
import ScheduleTable from './ScheduleTable';
import Navbar from '../../../components/Navbar';
import { toast } from 'react-toastify';
const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
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
      await adminApi.post('/schedules', newSchedule);
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
      await adminApi.put(`/schedules/${id}`, updated);
      fetchSchedules();
      toast.success('✏️ Schedule modified');
    } catch (err) {
      toast.error('❌ Update failed');
    }
  };

  return (
    <div className="d-flex bg-dark min-vh-100 flex-column flex-lg-row">
      <Navbar />

      <main className="dashboard-content flex-grow-1 p-3 p-md-4 p-lg-5">

        <header className="mb-4 mb-lg-5 text-center text-lg-start">
          <h2 className="fw-bold text-white mb-1 fs-3 fs-md-2">Event Scheduler</h2>
          <p className="text-light opacity-75 small">Assign dates, times, and venues for all fest activities</p>
        </header>

        <div className="row g-4 g-xl-5">
          {/* Left Column: Form (Sticky only on Desktop) */}
          <div className="col-xl-4 order-2 order-xl-1">
            <div className="sticky-xl-top schedule-form-container">
              <ScheduleForm onAdd={handleAddSchedule} />

              <div className="card bg-glass border-info border-opacity-10 mt-4 d-none d-md-block">
                <div className="card-body p-3 text-center">
                  <small className="text-info opacity-75 x-small">
                    <i className="bi bi-info-circle me-2"></i>
                    All times are in 24-hour format. Changes reflect instantly on the public timeline.
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Timeline Table */}
          <div className="col-xl-8 order-1 order-xl-2">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-info" role="status"></div>
              </div>
            ) : (
              <div className="card bg-glass border-secondary shadow-lg border-opacity-10">
                <div className="card-body p-0 overflow-hidden">
                  {/* Table responsiveness handled inside ScheduleTable component usually, 
                      but we ensure container doesn't break here */}
                  <div className="table-responsive-wrapper">
                    <ScheduleTable
                      data={schedules}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  </div>
                </div>
              </div>
            )}

            {schedules.length === 0 && !loading && (
              <div className="text-center py-5 bg-glass border border-secondary border-dashed rounded mt-3">
                <p className="text-secondary mb-0 small">No events scheduled yet. Use the form to start.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        /* Desktop: Standard Sidebar Offset */
        @media (min-width: 992px) {
          .dashboard-content { margin-left: 280px; }
          .sticky-xl-top { top: 2rem; z-index: 10; }
        }

        /* Mobile View Fixes */
        @media (max-width: 991.98px) {
          .dashboard-content { 
            margin-left: 0; 
            padding-top: 10px; 
          }
          /* On mobile, we might want the table first then the form, 
             or vice versa. Standard UX suggests Table first on mobile 
             unless it's a create-focused page. */
        }

        .bg-glass { 
          background: rgba(255, 255, 255, 0.03) !important; 
          backdrop-filter: blur(20px); 
          border-radius: 20px; 
        }

        .border-dashed { border-style: dashed !important; }
        .x-small { font-size: 0.7rem; }
        
        /* Ensure the table doesn't cause page-level horizontal scroll */
        .table-responsive-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </div>
  );
};

export default SchedulePage;