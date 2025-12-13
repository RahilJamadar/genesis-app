import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import getApiBase from '../../../utils/getApiBase';
import Navbar from '../../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);

  const baseURL = getApiBase();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/admin/events/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          },
          withCredentials: true
        });

        const raw = res.data;
        const facultyNames = raw.faculties?.map(f => f.name) || [];
        const coordinatorNames = raw.studentCoordinators || [];

        setEvent({
          ...raw,
          faculties: facultyNames,
          studentCoordinators: coordinatorNames
        });
      } catch {
        toast.error('❌ Failed to fetch event details');
      }
    };

    fetchEvent();
  }, [id, baseURL]);

  if (!event) {
    return (
      <div className="container-fluid bg-dark text-light min-vh-100 py-5">
        <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
        <Navbar />
        <p className="text-center mt-5">Loading event details...</p>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <Navbar />
      <div className="container bg-dark text-light py-5 px-4 rounded shadow-lg mt-4" style={{ maxWidth: '720px' }}>
        <h2 className="text-center text-primary border-bottom pb-2 mb-3">{event.name}</h2>

        <div className="mb-3 text-center">
          <span className="badge bg-info text-dark px-3 py-2 fs-6 text-uppercase">
            {event.category}
          </span>
        </div>

        {event.faculties?.length > 0 && (
          <div className="mb-3">
            <strong className="text-info">Faculty In-Charge:</strong>
            <p className="mb-0">{event.faculties.join(', ')}</p>
          </div>
        )}

        {event.studentCoordinators?.length > 0 && (
          <div className="mb-3">
            <strong className="text-info">Student Coordinators:</strong>
            <p className="mb-0">{event.studentCoordinators.join(', ')}</p>
          </div>
        )}

        {event.rules && (
          <div className="mb-4">
            <strong className="text-info">Rules:</strong>
            <div className="border rounded p-3 bg-dark text-light mt-2">
              <p className="mb-0">{event.rules}</p>
            </div>
          </div>
        )}

        <button className="btn btn-outline-secondary w-100" onClick={() => navigate('/events')}>
          ← Back to Events
        </button>
      </div>
    </>
  );
};

export default EventDetails;