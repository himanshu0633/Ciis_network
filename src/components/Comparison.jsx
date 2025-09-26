import React from 'react';
import '../componentsCSS/Comparison.css';

const Comparison = () => {
  const features = [ 
    // {label: '', runo: 'RUNO', rest: 'The Rest' },
    { label: 'Setup Time', runo: '<30 minutes', rest: '>30 days' },
    { label: 'Call Connect Rate', runo: '>78%', rest: '<30%' },
    { label: 'Customization', runo: 'Flexible', rest: 'Rigid' },
    { label: 'Lead Allocation', runo: 'Auto-Assigned', rest: 'Manual' },
    { label: 'Price', runo: 'ROI-Friendly', rest: 'Expensive' },
    { label: 'Reliability', runo: 'Zero Downtime', rest: 'Unstable' },
  ];

  return (
    <div className="comparison-section">
      <h2 className="title">Upgrade Your Workflow: Runo vs The Rest</h2>

      <div className="comparison-container">
        
        <div className="column label-column">
          <div className=" column label-column col"></div>
          {features.map((item, index) => (
            <div className="cell label" key={index}>{item.label}</div>
          ))}
        </div>

        <div className="column runo-column">
          <div className="runo-header">runo</div>
          {features.map((item, index) => (
            <div className="cell runo" key={index}>{item.runo}</div>
          ))}
        </div>

        <div className="column rest-column">
          <div className="rest-header">The Rest</div>
          {features.map((item, index) => (
            <div className="cell rest" key={index}>{item.rest}</div>
          ))}
        </div>
      </div>

      <button className="cta-button">Start 10-Day Free Trial</button>
      <p className="subtext">No Credit Card Required</p>
    </div>
  );
};

export default Comparison;
