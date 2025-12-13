import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HeroSection.module.css';

function HeroSection() {
  return (
    <div className={styles.hero}>
      <div className={styles.overlay}>
        <h1 className={styles.title}>GENESIS 2025</h1>
        <p className={styles.subtitle}>Code. Create. Conquer.</p>
        <p className={styles.date}>February 13–15 · Goa</p>
        <Link to="/register">
          <button className={styles.button}>🚀 Register Now</button>
        </Link>
      </div>
    </div>
  );
}

export default HeroSection;