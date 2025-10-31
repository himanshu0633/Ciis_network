import React from 'react';
import '../componentsCSS/Comparison.css';

const Comparison = () => {
  const features = [ 
    // {label: '', ciis: 'ciis', rest: 'The Rest' },
    { label: 'Setup Time', CiisNetwork: '<30 minutes', rest: '>30 days' },
    { label: 'Call Connect Rate', CiisNetwork: '>78%', rest: '<30%' },
    { label: 'Customization', CiisNetwork: 'Flexible', rest: 'Rigid' },
    { label: 'Lead Allocation', CiisNetwork: 'Auto-Assigned', rest: 'Manual' },
    { label: 'Price', CiisNetwork: 'ROI-Friendly', rest: 'Expensive' },
    { label: 'Reliability', CiisNetwork: 'Zero Downtime', rest: 'Unstable' },
  ];

  return (
    <div className="comparison-section">
      <h2 className="title">Upgrade Your Workflow: CiisNetwork vs The Rest</h2>

      <div className="comparison-container">
        
        <div className="column label-column">
          <div className=" column label-column col"></div>
          {features.map((item, index) => (
            <div className="cell label" key={index}>{item.label}</div>
          ))}
        </div>

        <div className="column ciis-column">
          <div className="ciis-header">Ciis Network</div>
          {features.map((item, index) => (
            <div className="cell ciis" key={index}>{item.CiisNetwork}</div>
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
