import React from 'react';
import '../componentsCSS/Logo.css';

import ayurvedaLogo from '../image/ciis/client/ayurveda-logo.webp';
import hyundaiLogo from '../image/ciis/client/hyundai.webp';
import indiraLogo from '../image/ciis/client/indira-logo.webp';
import mercedesLogo from '../image/ciis/client/mer-benz.webp';
import progradLogo from '../image/ciis/client/pro-grad-logo.webp';
import upstoxLogo from '../image/ciis/client/upstox.webp';

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
