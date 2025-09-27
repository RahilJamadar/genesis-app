import React, { useEffect, useState } from 'react';
import ScheduleForm from './ScheduleForm';
import ScheduleTable from './ScheduleTable';
import Navbar from '../../components/Navbar';
import API from '../../api/adminApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    API.get('/schedules')
      .then((res) => setSchedules(res.data))
      .catch(() => toast.error('❌ Failed to fetch schedules'));
  }, []);

  const handleAddSchedule = async (newSchedule) => {
    try {
      const res = await API.post('/schedules', newSchedule);
      setSchedules((prev) => [...prev, res.data]);
      toast.success('✅ Schedule added');
    } catch {
      toast.error('❌ Failed to add schedule');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      await API.delete(`/schedules/${id}`);
      setSchedules((prev) => prev.filter((item) => item._id !== id));
      toast.success('🗑️ Schedule deleted');
    } catch {
      toast.error('❌ Failed to delete schedule');
    }
  };

  const handleEdit = async (id, updated) => {
    try {
      const res = await API.put(`/schedules/${id}`, updated);
      setSchedules((prev) =>
        prev.map((item) => (item._id === id ? res.data : item))
      );
      toast.success('✏️ Schedule updated');
    } catch {
      toast.error('❌ Failed to update schedule');
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <Navbar />
      <div className="schedule-page">
        <h2>Genesis Scheduler</h2>
        <ScheduleForm onAdd={handleAddSchedule} />
        <ScheduleTable
          data={schedules}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </div>
    </>
  );
};

export default SchedulePage;