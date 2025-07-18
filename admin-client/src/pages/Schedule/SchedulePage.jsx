import React, { useEffect, useState } from 'react';
import ScheduleForm from './ScheduleForm';
import ScheduleTable from './ScheduleTable';
import './schedule.css';
import Navbar from '../../components/Navbar';

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    fetch('/api/schedules')
      .then((res) => res.json())
      .then((data) => setSchedules(data))
      .catch((err) => console.error('Fetch failed:', err));
  }, []);

  const handleAddSchedule = async (newSchedule) => {
    const res = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSchedule),
    });
    const added = await res.json();
    setSchedules((prev) => [...prev, added]);
  };

  const handleDelete = async (id) => {
    await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
    setSchedules((prev) => prev.filter((item) => item._id !== id));
  };

  const handleEdit = async (id, updated) => {
    const res = await fetch(`/api/schedules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    const edited = await res.json();
    setSchedules((prev) =>
      prev.map((item) => (item._id === id ? edited : item))
    );
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