import React from 'react';
import '../componentsCSS/Logo.css';

import ayurvedaLogo from '../image/runo/client/ayurveda-logo.webp';
import hyundaiLogo from '../image/runo/client/hyundai.webp';
import indiraLogo from '../image/runo/client/indira-logo.webp';
import mercedesLogo from '../image/runo/client/mer-benz.webp';
import progradLogo from '../image/runo/client/pro-grad-logo.webp';
import upstoxLogo from '../image/runo/client/upstox.webp';

const logos = [
  ayurvedaLogo,
  hyundaiLogo,
  indiraLogo,
  mercedesLogo,
  progradLogo,
  upstoxLogo
];

const Logo = () => {
  return (
    <div className="logo-slider-container">
      <h2 className="logo-heading">Big Names? Yeah, They're All On Board</h2>
      <div className="logo-slider">
        <div className="logo-track">
          {logos.concat(logos).map((logo, index) => (
            <div className="logo-slide" key={index}>
              <img src={logo} alt={`logo-${index}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Logo;
