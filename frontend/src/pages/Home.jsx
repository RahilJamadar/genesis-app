import React from 'react';
import GenesisLanding from '../components/Landing/GenesisLanding'; // Adjust path

function Home() {
  return (
    // This ID must match the 'important' selector in tailwind.config.js
    <div id="genesis-root">
       <GenesisLanding />
    </div>
  );
}

export default Home;