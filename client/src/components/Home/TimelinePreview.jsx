import React from 'react';
import styles from './TimelinePreview.module.css';

const schedule = [
  { day: 'Day 1', date: 'Feb 13', events: ['Hackathon Kickoff', 'Treasure Hunt', 'LAN Gaming'] },
  { day: 'Day 2', date: 'Feb 14', events: ['Code Combat Finals', 'Photography Walk', 'Football Matches'] },
  { day: 'Day 3', date: 'Feb 15', events: ['Group Dance Showdown', 'Prize Distribution', 'DJ Night'] }
];

function TimelinePreview() {
  return (
    <section className={styles.timelineSection}>
      <h2 className={styles.heading}>Event Schedule Preview</h2>
      <div className={styles.timeline}>
        {schedule.map((item, index) => (
          <div key={index} className={styles.dayBlock}>
            <div className={styles.circle}></div>
            <div className={styles.content}>
              <h3 className={styles.day}>{item.day} <span>{item.date}</span></h3>
              <ul className={styles.eventList}>
                {item.events.map((ev, i) => (
                  <li key={i}>{ev}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TimelinePreview;