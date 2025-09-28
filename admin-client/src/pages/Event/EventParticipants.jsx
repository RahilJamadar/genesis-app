import React, { useEffect, useState } from 'react';
import axios from 'axios';
import getApiBase from '../../utils/getApiBase';
import Navbar from '../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function EventParticipants() {
  const [events, setEvents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [participants, setParticipants] = useState([]);

  const baseURL = getApiBase();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/admin/events`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          },
          withCredentials: true
        });
        setEvents(res.data.map(ev => ev.name));
      } catch {
        toast.error('❌ Failed to load events');
      }
    };

    fetchEvents();
  }, [baseURL]);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/admin/teams`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          },
          withCredentials: true
        });
        const collegeSet = new Set(res.data.map(team => team.college));
        setColleges([...collegeSet]);
      } catch {
        toast.error('❌ Failed to load colleges');
      }
    };

    fetchColleges();
  }, [baseURL]);

  useEffect(() => {
    if (!selectedEvent) return;

    const fetchParticipantsByEvent = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/admin/events/${selectedEvent}/participants`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          },
          withCredentials: true
        });
        setParticipants(res.data);
      } catch {
        toast.error('❌ Failed to load participants for event');
      }
    };

    fetchParticipantsByEvent();
  }, [selectedEvent, baseURL]);

  useEffect(() => {
    if (!selectedCollege) return;

    const fetchParticipantsByCollege = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/admin/events/college/${encodeURIComponent(selectedCollege)}/participants`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          },
          withCredentials: true
        });
        setParticipants(res.data);
      } catch {
        toast.error('❌ Failed to load participants for college');
      }
    };

    fetchParticipantsByCollege();
  }, [selectedCollege, baseURL]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <Navbar />
      <div className="container-fluid bg-dark text-light py-5 px-4 min-vh-100">
        <h2 className="text-center text-info border-bottom pb-2 mb-4 text-uppercase">
          👥 Event Participation Tracker
        </h2>

        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label text-info fw-semibold">🎯 Filter by Event</label>
            <select
              className="form-select bg-dark text-light border-info"
              value={selectedEvent}
              onChange={e => {
                setSelectedEvent(e.target.value);
                setSelectedCollege('');
                setParticipants([]);
              }}
            >
              <option value="">-- Select Event --</option>
              {events.map((name, i) => (
                <option key={i} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label text-info fw-semibold">🏫 Filter by College</label>
            <select
              className="form-select bg-dark text-light border-info"
              value={selectedCollege}
              onChange={e => {
                setSelectedCollege(e.target.value);
                setSelectedEvent('');
                setParticipants([]);
              }}
            >
              <option value="">-- Select College --</option>
              {colleges.map((name, i) => (
                <option key={i} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {(selectedEvent || selectedCollege) && (
          <div className="mt-4">
            <h4 className="text-info border-bottom pb-2 mb-3 text-uppercase">
              📍 {selectedEvent || selectedCollege}
            </h4>

            {participants.length === 0 ? (
              <p className="fst-italic text-muted">No participants found.</p>
            ) : (
              <div className="row g-4">
                {selectedEvent ? (
                  participants.map((block, i) => (
                    <div key={i} className="col-md-6">
                      <div className="bg-dark border-start border-4 border-info rounded shadow-sm p-3">
                        <h5 className="text-warning mb-3">🏫 {block.college}</h5>
                        <ul className="list-unstyled">
                          {block.members?.map((m, idx) => (
                            <li key={idx} className="mb-3 border-bottom pb-2">
                              <strong className="d-block text-light">{m.name}</strong>
                              <small className="d-block text-white">
                                👤 {m.teamLeader} | 📞 {m.contact}
                              </small>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div className="bg-dark border-start border-4 border-info rounded shadow-sm p-3">
                      <h5 className="text-warning mb-3">🏫 {selectedCollege}</h5>
                      <ul className="list-unstyled">
                        {participants.map((member, i) => (
                          <li key={i} className="mb-3 border-bottom pb-2">
                            <strong className="d-block text-light">{member.name}</strong>
                            <small className="d-block text-white">
                              👤 {member.teamLeader} | 📞 {member.contact}
                            </small>
                            <small className="d-block text-info fst-italic">
                              🎯 {member.events.join(', ')}
                            </small>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default EventParticipants;