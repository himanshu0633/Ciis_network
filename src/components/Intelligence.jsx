import React from 'react';
import '../componentsCSS/Intelligence.css'; // Make sure to update your CSS class names accordingly

const Intelligence = () => {
  const features = [
    {
      title: "AI Call Transcripts",
      description: "Get a complete, accurate text version of every call. No need to re-listen or take notes.",
      image: "images/ts.webp",
      alt: "Call transcript example",
      reversed: false
    },
    {
      title: "Call Summaries",
      description: "Highlights the key points from each call, so managers and reps don't have to replay or take notes.",
      image: "images/8.webp",
      alt: "Call summary example",
      reversed: true
    },
    {
      title: "Sentiment Analysis",
      description: "Detects the emotional tone of the conversation (positive, neutral, negative) to flag at-risk leads or unhappy customers.",
      image: "images/5.webp",
      alt: "Sentiment analysis example",
      reversed: false
    },
    {
      title: "Meeting Notes (MoM) Capture",
      description: "Automatically pulls out action items, urgency, and assignees from the call.",
      image: "images/mom.webp",
      alt: "Meeting notes example",
      reversed: true
    },
    {
      title: "AI Assistant",
      description: "A chat-style assistant for managers and reps to ask questions like 'show me all missed follow-ups this week' or 'how many positive calls did we get today'.",
      image: "images/4.webp",
      alt: "AI assistant example",
      reversed: false
    }
  ];

  return (
    <div className="intelligence-app">
      <div className="intelligence-hero">
        <h1>Make Smarter Calls With <span className="intelligence-highlight">Runo's AI Powered</span> Tools</h1>
        <p className="intelligence-subtitle">Power up your team with real-time call intelligence and actionable insights</p>
        <p className="intelligence-subtitle">Turn talk into insight</p>
      </div>
      
      <div className="intelligence-features-section">
        <div className="intelligence-feature-container">
          {features.map((feature, index) => (
            <div key={index} className={`intelligence-feature-card ${feature.reversed ? 'intelligence-reversed' : ''}`}>
              <div className="intelligence-feature-content">
                <h2 className="intelligence-feature-title">{feature.title}</h2>
                <p className="intelligence-feature-description">{feature.description}</p>
              </div>
              <div className="intelligence-feature-image">
                <img src={feature.image} alt={feature.alt} className="intelligence-screenshot" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Intelligence;