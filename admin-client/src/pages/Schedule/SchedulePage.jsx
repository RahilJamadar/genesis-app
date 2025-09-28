import React, { useEffect, useState } from 'react';
import axios from 'axios';
import getApiBase from '../../utils/getApiBase';
import ScheduleForm from './ScheduleForm';
import ScheduleTable from './ScheduleTable';
import Navbar from '../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const baseURL = getApiBase();

  useEffect(() => {
    axios.get(`${baseURL}/api/schedules`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      },
      withCredentials: true
    })
      .then((res) => setSchedules(res.data))
      .catch(() => toast.error('❌ Failed to fetch schedules'));
  }, [baseURL]);

  const handleAddSchedule = async (newSchedule) => {
    try {
      const res = await axios.post(`${baseURL}/api/schedules`, newSchedule, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        withCredentials: true
      });
      setSchedules((prev) => [...prev, res.data]);
      toast.success('✅ Schedule added');
    } catch {
      toast.error('❌ Failed to add schedule');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      await axios.delete(`${baseURL}/api/schedules/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        withCredentials: true
      });
      setSchedules((prev) => prev.filter((item) => item._id !== id));
      toast.success('🗑️ Schedule deleted');
    } catch {
      toast.error('❌ Failed to delete schedule');
    }
  };

  const handleEdit = async (id, updated) => {
    try {
      const res = await axios.put(`${baseURL}/api/schedules/${id}`, updated, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        withCredentials: true
      });
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
        <h2 className="text-center text-info fw-bold my-4">🗓️ Genesis Scheduler</h2>
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