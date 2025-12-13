import React from 'react';
import styles from './EventCategories.module.css';

const events = [
  { name: 'Hackathon', emoji: '💻' },
  { name: 'Code Combat', emoji: '🧠' },
  { name: 'LAN Gaming', emoji: '🎮' },
  { name: 'Football', emoji: '⚽' },
  { name: 'Group Dance', emoji: '💃' },
  { name: 'Photography', emoji: '📸' },
  { name: 'Quiz', emoji: '❓' },
  { name: 'Treasure Hunt', emoji: '🗺️' }
];

function EventCategories() {
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Event Categories</h2>
      <div className={styles.grid}>
        {events.map((event, index) => (
          <div key={index} className={styles.card}>
            <span className={styles.emoji}>{event.emoji}</span>
            <p className={styles.name}>{event.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default EventCategories;