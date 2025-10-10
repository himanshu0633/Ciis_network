import React from 'react';
import '../componentsCSS/AddOnSection.css';

const AddOnsSection = () => {
  const addOns = [
   {
      id: 1,
      title: "WhatsApp Business",
      description: "Send bulk WhatsApp messages directly from CIIS Network, track delivery and replies, and manage all conversations.",
      icon: "💬",
      className: "whatsapp"
    },
    {
      id: 2,
      title: "AI Chat Assistant",
      description: "Get instant answers about your sales pipeline and ask the AI to perform tasks like booking calls or setting follow-ups.",
      icon: "🤖",
      className: "ai-chat"
    },
    {
      id: 3,
      title: "Storage Boost",
      description: "Increase your storage limit to keep more call recordings, reports, and lead data without interruptions.",
      icon: "💾",
      className: "storage"
    },
    {
      id: 4,
      title: "AI Call Intelligence",
      description: "Get automatic call summaries, sentiment analysis, talk-time ratios, and call quality scores to coach reps and improve every conversation.",
      icon: "📊",
      className: "ai-call"
    },
    {
      id: 5,
      title: "Guided Onboarding",
      description: "Get help with setup, CRM customisation, and training to get your team up and running smoothly.",
      icon: "🛠️",
      className: "onboarding"
    }
  ];

  return (
    <section className="addons-section">
      <div className="addons_container">
        <div className="addons_section-title">
          <h2>Add-Ons to Power Up Your  CIIS Network Plan</h2>
          <p className="subtitle">Enhance your experience with these powerful extensions</p>
        </div>
        <div className="addons-grid">
          {addOns.map((addon) => (
            <div key={addon.id} className={`addon-card ${addon.className}`}>
              <div className="addons_card-body">
                <div className="addon-icon">{addon.icon}</div>
                <h3>{addon.title}</h3>
                <p>{addon.description}</p>
                
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AddOnsSection;