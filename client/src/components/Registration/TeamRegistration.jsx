import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import styles from './TeamRegistration.module.css';

function TeamRegistration() {
  const [eventOptions, setEventOptions] = useState([]);
  const [college, setCollege] = useState('');
  const [faculty, setFaculty] = useState('');
  const [leader, setLeader] = useState('');
  const [contact, setContact] = useState('');
  const [members, setMembers] = useState([{ name: '', events: [] }]);

  useEffect(() => {
    axios.get('http://localhost:5001/api/admin/events/public-events')
      .then(res => {
        const options = res.data.map(ev => ({
          value: ev.name,
          label: ev.name
        }));
        setEventOptions(options);
      })
      .catch(err => console.error('Public event fetch error:', err));
  }, []);

  const handleMemberChange = (index, type, value) => {
    const updated = [...members];
    if (type === 'name') updated[index].name = value;
    else updated[index].events = value;
    setMembers(updated);
  };

  const addMember = () => {
    if (members.length < 15) {
      setMembers([...members, { name: '', events: [] }]);
    }
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedMembers = members.map(m => ({
      name: m.name,
      events: m.events.map(ev => ev.value)
    }));

    const payload = {
      college,
      faculty,
      leader,
      contact,
      members: cleanedMembers
    };

    try {
      const res = await axios.post('http://localhost:5000/api/register', payload);
      console.log('✅ Registered:', res.data);
      alert('Team registered successfully!');
      setCollege('');
      setFaculty('');
      setLeader('');
      setContact('');
      setMembers([{ name: '', events: [] }]);
    } catch (err) {
      console.error('❌ Registration error:', err.response?.data || err.message);
      alert('Failed to register team');
    }
  };

  return (
    <section className={styles.container}>
      <h2 className={styles.heading}>Team Registration</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input type="text" placeholder="College Name" value={college} onChange={e => setCollege(e.target.value)} required />
        <input type="text" placeholder="Faculty In-Charge Name" value={faculty} onChange={e => setFaculty(e.target.value)} required />
        <input type="text" placeholder="Team Leader Name" value={leader} onChange={e => setLeader(e.target.value)} required />
        <input type="tel" placeholder="Contact Number" value={contact} onChange={e => setContact(e.target.value)} required />

        <div className={styles.members}>
          <label>Team Members (max 15):</label>
          {members.map((member, index) => (
            <div key={index} className={styles.memberBlock}>
              <input
                type="text"
                placeholder={`Member ${index + 1} Name`}
                value={member.name}
                onChange={e => handleMemberChange(index, 'name', e.target.value)}
                required
              />
              <Select
                isMulti
                options={eventOptions}
                value={member.events}
                onChange={selected => handleMemberChange(index, 'events', selected)}
                classNamePrefix="react-select"
                className={styles.select}
                placeholder="Select events participated"
              />
              {index > 0 && (
                <button type="button" onClick={() => removeMember(index)}>
                  Remove
                </button>
              )}
            </div>
          ))}
          {members.length < 15 && (
            <button type="button" onClick={addMember}>➕ Add Member</button>
          )}
        </div>

        <button type="submit" className={styles.submit}>🚀 Register Team</button>
      </form>
    </section>
  );
}

export default TeamRegistration;