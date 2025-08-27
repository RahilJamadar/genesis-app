import React, { useEffect, useState } from 'react';
import API from '../../api/adminApi';
import Navbar from '../../components/Navbar';
import './EventParticipants.css';

function EventParticipants() {
  const [events, setEvents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [participants, setParticipants] = useState([]);

  // Load all event names
  useEffect(() => {
    API.get('/admin/events')
      .then(res => {
        const names = res.data.map(ev => ev.name);
        setEvents(names);
      })
      .catch(err => console.error('Event list error:', err));
  }, []);

  // Load all college names
  useEffect(() => {
    API.get('/admin/teams')
      .then(res => {
        const collegeSet = new Set(res.data.map(team => team.college));
        setColleges([...collegeSet]);
      })
      .catch(err => console.error('College list error:', err));
  }, []);

  // Fetch by event
  useEffect(() => {
    if (!selectedEvent) return;
    API.get(`/admin/events/${selectedEvent}/participants`)
      .then(res => setParticipants(res.data))
      .catch(err => console.error('Participant fetch error:', err));
  }, [selectedEvent]);

  // Fetch by college
  useEffect(() => {
    if (!selectedCollege) return;
    API.get(`/admin/events/college/${encodeURIComponent(selectedCollege)}/participants`)
      .then(res => setParticipants(res.data))
      .catch(err => console.error('College participant fetch error:', err));
  }, [selectedCollege]);

  return (
    <>
      <Navbar />
      <div className="event-participants">
        <h2>👥 Event Participation Tracker</h2>

        <div className="filter-section">
          <div>
            <label>Filter by Event:</label>
            <select
              value={selectedEvent}
              onChange={e => {
                setSelectedEvent(e.target.value);
                setSelectedCollege('');
                setParticipants([]); // ✅ Reset to prevent structure mismatch
              }}
            >
              <option value="">-- Select Event --</option>
              {events.map((name, i) => (
                <option key={i} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Filter by College:</label>
            <select
              value={selectedCollege}
              onChange={e => {
                setSelectedCollege(e.target.value);
                setSelectedEvent('');
                setParticipants([]); // ✅ Reset to prevent structure mismatch
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
          <div className="dashboard">
            <h3>📍 {selectedEvent || selectedCollege}</h3>
            {participants.length === 0 ? (
              <p>No participants found.</p>
            ) : (
              <ul className="college-list">
                {selectedEvent ? (
                  participants.map((block, i) => (
                    <li key={i} className="college-card">
                      <strong>{block.college}</strong>
                      <ul>
                        {block.members?.map((m, idx) => (
                          <li key={idx}>
                            {m.name}
                            <span className="team-info">({m.teamLeader}, {m.contact})</span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))
                ) : (
                  <li className="college-card">
                    <strong>{selectedCollege}</strong>
                    <ul>
                      {participants.map((member, i) => (
                        <li key={i}>
                          {member.name}
                          <span className="team-info">({member.teamLeader}, {member.contact})</span>
                          <span className="event-tag">🎯 {member.events.join(', ')}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                )}
              </ul>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default EventParticipants;