import React from 'react';
import GenesisLanding from '../components/Landing/GenesisLanding';

function Home() {
  return (
    // Added bg-black and min-h-screen to ensure no white peaks through
    <div id="genesis-root" className="bg-black min-h-screen w-full">
       <GenesisLanding />
    </div>
  );
}

export default Home;