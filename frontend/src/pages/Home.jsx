import React from 'react';
import HeroSection from '../components/Home/HeroSection';
import AboutGenesis from '../components/Home/AboutGenesis';
import EventCategories from '../components/Home/EventCategories';
import HighlightsSlider from '../components/Home/HighlightsSlider';
import TimelinePreview from '../components/Home/TimelinePreview';

function Home() {
  return (
    <>
      <HeroSection />
      <AboutGenesis />
      <EventCategories />
      <HighlightsSlider />
      <TimelinePreview />
    </>
  );
}

export default Home;