import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import getApiBase from '../../../utils/getApiBase';
import FacultyNavbar from '../../../components/FacultyNavbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FacultyEventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);

  const baseURL = getApiBase();

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/faculty/event/${id}/details`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('facultyToken')}`
          },
          withCredentials: true
        });
        setEvent(res.data);
      } catch {
        toast.error('❌ Failed to fetch event details');
      }
    };

    fetchEventDetails();
  }, [id, baseURL]);

  if (!event) {
    return (
      <>
        <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
        <p className="text-center text-light mt-5">Loading...</p>
      </>
    );
  }

  const facultyNames = event.faculties?.map(f => f.name).join(', ') || 'N/A';
  const coordinatorNames = event.studentCoordinators?.join(', ') || 'N/A';

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <FacultyNavbar />
      <div className="container py-5" style={{ backgroundColor: '#0D0D15', minHeight: '100vh' }}>
        <div
          className="mx-auto p-4 rounded shadow-sm text-light"
          style={{
            maxWidth: '800px',
            backgroundColor: '#161b22',
            border: '1px solid #2b2f3a'
          }}
        >
          <h2 className="text-center text-info fw-bold mb-3">{event.name}</h2>
          <span
            className="badge mb-3 px-3 py-2 fw-semibold"
            style={{
              backgroundColor: getCategoryColor(event.category),
              borderRadius: '14px',
              fontSize: '0.9rem'
            }}
          >
            {event.category}
          </span>

          <div className="mb-3">
            <strong className="text-info me-2">Faculty In-Charge:</strong>
            <span className="text-light">{facultyNames}</span>
          </div>

          <div className="mb-3">
            <strong className="text-info me-2">Student Coordinators:</strong>
            <span className="text-light">{coordinatorNames}</span>
          </div>

          {event.rules && (
            <div
              className="mt-4 p-3 rounded"
              style={{ backgroundColor: '#10141f', border: '1px solid #2b2f3a' }}
            >
              <strong className="text-info d-block mb-2">Rules:</strong>
              <p className="text-light mb-0" style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
                {event.rules}
              </p>
            </div>
          )}

          <div className="text-center mt-4">
            <button
              className="btn btn-info fw-semibold px-4 py-2"
              onClick={() => navigate('/admin/faculty/dashboard')}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper to map category to color
const getCategoryColor = (category) => {
  switch (category) {
    case 'Tech': return '#00bfff';
    case 'Cultural': return '#e07c9c';
    case 'Sports': return '#4cb050';
    case 'Gaming': return '#ffa500';
    case 'Pre-events': return '#9370db';
    default: return '#6c757d';
  }
};

export default FacultyEventDetails;