import React, { useEffect, useState } from 'react';
import ScheduleForm from './ScheduleForm';
import ScheduleTable from './ScheduleTable';
import './schedule.css';
import Navbar from '../../components/Navbar';
import API from '../../api/adminApi';

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    API.get('/schedules')
      .then((res) => setSchedules(res.data))
      .catch((err) => console.error('Fetch failed:', err));
  }, []);

  const handleAddSchedule = async (newSchedule) => {
    try {
      const res = await API.post('/schedules', newSchedule);
      setSchedules((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('Add failed:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/schedules/${id}`);
      setSchedules((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleEdit = async (id, updated) => {
    try {
      const res = await API.put(`/schedules/${id}`, updated);
      setSchedules((prev) =>
        prev.map((item) => (item._id === id ? res.data : item))
      );
    } catch (err) {
      console.error('Edit failed:', err);
    }
  };

  return (
    <>
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