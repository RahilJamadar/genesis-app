import React from 'react';
import Slider from 'react-slick';
import styles from './HighlightsSlider.module.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const highlights = [
  {
    src: 'https://images.pexels.com/photos/1181306/pexels-photo-1181306.jpeg?auto=compress&cs=tinysrgb&w=1600',
    caption: 'Code Combat Arena – Team Firebytes'
  },
  {
    src: 'https://images.pexels.com/photos/3052369/pexels-photo-3052369.jpeg?auto=compress&cs=tinysrgb&w=1600',
    caption: 'LAN Gaming Showdown'
  },
  {
    src: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1600',
    caption: 'Group Dance Finals – Cultural Night'
  },
  {
    src: 'https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=1600',
    caption: 'Football Blitz – Intercollege Sports'
  }
];

function HighlightsSlider() {
  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false
  };

  return (
    <section className={styles.sliderContainer}>
      <h2 className={styles.heading}>Genesis Highlights</h2>
      <Slider {...settings}>
        {highlights.map((item, index) => (
          <div key={index} className={styles.slide}>
            <img src={item.src} alt={`Highlight ${index}`} className={styles.image} />
            <p className={styles.caption}>{item.caption}</p>
          </div>
        ))}
      </Slider>
    </section>
  );
}

export default HighlightsSlider;