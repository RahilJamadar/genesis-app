import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import getApiBase from '../../../utils/getApiBase';
import FacultyNavbar from '../../../components/FacultyNavbar';
import { ToastContainer, toast } from 'react-toastify';

const FacultyEventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const baseURL = getApiBase();

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/faculty/dashboard/event/${id}/details`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('facultyToken')}`
          },
          withCredentials: true
        });
        setEvent(res.data);
      } catch (err) {
        toast.error('❌ Failed to fetch detailed event information');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, baseURL]);

  const getCategoryBadge = (category) => {
    const colors = {
      Tech: 'bg-info',
      Cultural: 'bg-danger',
      Sports: 'bg-success',
      Gaming: 'bg-warning text-dark',
      'Pre-events': 'bg-primary'
    };
    return colors[category] || 'bg-secondary';
  };

  if (loading) return (
    <div className="bg-dark min-vh-100 d-flex align-items-center justify-content-center">
      <div className="spinner-border text-info" role="status"></div>
    </div>
  );

  if (!event) return null;

  return (
    <div className="bg-dark min-vh-100">
      <ToastContainer theme="dark" position="top-right" autoClose={2000} />
      <FacultyNavbar />
      
      <div className="container py-5">
        <div className="card bg-glass border-secondary shadow-lg mx-auto overflow-hidden" style={{ maxWidth: '950px' }}>
          
          {/* Header Section */}
          <div className="p-4 p-md-5 border-bottom border-secondary bg-glass bg-opacity-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
              <div className="text-center text-md-start">
                <span className={`badge mb-3 px-3 py-2 ${getCategoryBadge(event.category)}`}>
                  {event.category?.toUpperCase()}
                </span>
                <h2 className="text-white fw-bold mb-1 display-5">{event.name}</h2>
                <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-md-start mt-2">
                    <span className="text-info x-small fw-bold border-end border-secondary pe-3">ROUNDS: {event.rounds}</span>
                    <span className="text-info x-small fw-bold border-end border-secondary pe-3">
                      TEAM SIZE: {event.minParticipants === event.maxParticipants ? event.minParticipants : `${event.minParticipants}-${event.maxParticipants}`}
                    </span>
                    <span className="text-info x-small fw-bold">TROPHY EVENT: {event.isTrophyEvent ? 'YES' : 'NO'}</span>
                </div>
              </div>
              <button 
                className="btn btn-info fw-bold px-5 py-3 shadow-lg hover-scale"
                onClick={() => navigate(`/faculty/event/${event._id}/score`)}
              >
                <i className="bi bi-pencil-square me-2"></i>START SCORING
              </button>
            </div>
          </div>

          <div className="card-body p-4 p-md-5">
            <div className="row g-5">
              {/* Left Column: People & Criteria */}
              <div className="col-md-5">
                
                {/* Judging Criteria */}
                <div className="mb-5">
                  <h6 className="text-info fw-bold x-small text-uppercase mb-3 d-flex align-items-center">
                    <i className="bi bi-list-check me-2 fs-5"></i>Judging Criteria
                  </h6>
                  <ul className="list-group list-group-flush bg-transparent">
                    {event.judgingCriteria?.map((criterion, idx) => (
                      <li key={idx} className="list-group-item bg-transparent text-light border-secondary px-0 py-2 d-flex align-items-center">
                        <span className="badge bg-info bg-opacity-10 text-info me-3">{idx + 1}</span>
                        {criterion}
                      </li>
                    ))}
                  </ul>
                  <small className="text-secondary d-block mt-2 fst-italic x-small">
                    Scores will be weighted for tie-breaking: C1 > C2 > C3
                  </small>
                </div>

                <div className="mb-4">
                  <h6 className="text-info fw-bold x-small text-uppercase mb-3">Panel Judges</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {event.judges?.length > 0 ? event.judges.map(j => (
                      <span key={j._id} className="badge bg-dark border border-secondary text-light p-2 fw-normal">
                        <i className="bi bi-person-badge me-2 text-info"></i>{j.name}
                      </span>
                    )) : <span className="text-muted">No judges assigned</span>}
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="text-info fw-bold x-small text-uppercase mb-3">Student Coordinators</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {event.studentCoordinators?.length > 0 ? event.studentCoordinators.map((sc, i) => (
                      <span key={sc._id || i} className="badge bg-dark border border-secondary text-light p-2 fw-normal">
                        <i className="bi bi-person-circle me-2 text-info"></i>{sc.name || sc}
                      </span>
                    )) : <span className="text-muted">No coordinators assigned</span>}
                  </div>
                </div>
              </div>

              {/* Right Column: Rules */}
              <div className="col-md-7">
                <div className="p-4 rounded-4 h-100 bg-black bg-opacity-25 border border-secondary">
                  <h6 className="text-info fw-bold x-small text-uppercase mb-4 d-flex align-items-center">
                    <i className="bi bi-shield-exclamation me-2 fs-5"></i>Official Guidelines
                  </h6>
                  <div className="text-light opacity-75" style={{ lineHeight: '1.8', whiteSpace: 'pre-line', fontSize: '0.95rem' }}>
                    {event.rules || "Guidelines have not been uploaded for this event yet."}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-top border-secondary text-center">
              <button
                className="btn btn-link text-secondary text-decoration-none"
                onClick={() => navigate('/faculty/dashboard')}
              >
                <i className="bi bi-arrow-left me-2"></i>Back to Event List
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .bg-glass { background: rgba(255, 255, 255, 0.05) !important; backdrop-filter: blur(12px); border-radius: 30px; }
        .x-small { font-size: 0.75rem; letter-spacing: 1.5px; }
        .display-5 { letter-spacing: -2px; }
        .hover-scale { transition: transform 0.2s ease; }
        .hover-scale:hover { transform: scale(1.03); }
        .list-group-item { border-style: dashed !important; }
      `}</style>
    </div>
  );
};

export default FacultyEventDetails;