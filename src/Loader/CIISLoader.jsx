import React from "react";
import logo from "../../public/logoo.png"; // yaha apna logo file rakho

export default function CIISLoader() {
  return (
    <div className="ciis-wrapper">
      <div className="ciis-card">
        
        <img src={logo} alt="CIIS Network" className="ciis-logo" />

        <div className="spinner"></div>

        <p className="loading-text">
          Connecting Intelligence...
        </p>

        <div className="dots">
          <span></span>
          <span></span>
          <span></span>
        </div>

      </div>
    </div>
  );
}


// index.css me ye styles add karo