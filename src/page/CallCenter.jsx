import React from 'react'
import RunoHeader from '../components/RunoHeader'
import Footer from '../components/Footer'
import { FaPhone, FaPlay, FaChartBar } from 'react-icons/fa';
import callImage from '../image/runo/call-management.webp'; // Assuming you have an image for the call management section
import '../componentsCSS/callManagement.css'; // Assuming you have a CSS file for styling
import FeaturesSection from '../components/FeaturesSection';
import FAQ from '../components/FAQ'; // Assuming you have a FAQ component
import '../componentsCSS/telecaller.css'; // Assuming \
import Review from '../components/Review'
// 
import Security from '../image/security.webp';

import Bannerbtn from '../components/Bannerbtn';
import icon1 from '../image/runo/1.png';
import icon2 from '../image/runo/2.png';
import icon3 from '../image/runo/3.png';
import icon4 from '../image/runo/4.png';
import icon5 from '../image/runo/5.png';
import icon6 from '../image/runo/6.png';
import icon7 from '../image/runo/7.png';
import icon8 from '../image/runo/8.png';


import Logo from '../components/Logo'
function CallCenter() {
  // Define your features here
  // You can replace these with actual icons or images as needed
  const myFeatures = [
    {
      title: 'Auto Dialer',
      description: 'Call faster without manual dialing between calls.',
      icon: icon1,
    },
    {
      title: 'Call Recording',
      description: 'Record every call for training, compliance, and quality checks.',
      icon: icon2,
    },
    {
      title: 'Real-Time Call Tracking',
      description: 'See every call status, duration, and outcome instantly.',
      icon: icon3,
    },
    {
      title: 'Lead Auto Allocation',
      description: 'Assign leads instantly based on source, region, or rules you set.',
      icon: icon4,
    },
    {
      title: 'Follow-Up Reminders',
      description: 'Get notified when it’s time to call back or check in on a lead.',
      icon: icon5,
    },
    {
      title: 'Built-in CRM',
      description: 'No switching between tools, CRM is built right in.',
      icon: icon6,
    },
    {
      title: 'Live Agent Status',
      description: 'Know who’s active, available, or idle at any given moment.',
      icon: icon7,
    },
    {
      title: 'Interaction Timeline',
      description: 'Access full call history and notes for every lead instantly.',
      icon: icon8,
    },
  ];





  return (
    <>
      <RunoHeader />
      {/* Hero Section */}
      <div className="call-hero-section">
        {/* Text Section */}
        <div className="call-text">
          <nav className="call-breadcrumb">
            <span className="call-highlight">Home</span> &gt;
            <span className="call-highlight">Product</span> &gt;
            <span>Call Center App</span>
          </nav>
          <h1 className="call-title">
            Call Center App With<br />
            No Complex Infrastructure
          </h1>
          <p className="call-subtitle">
            Run high-performance call operations with 2x calling productivity
          </p>
          <ul className="call-features">
            <li>SIM-based calling without IVR drop-offs</li>
            <li>Real-time call, follow-up, and lead tracking</li>
            <li>Auto lead allocation with no manual effort
            </li>
            <li>Call recording, monitoring, and CRM built in
            </li>
          </ul>
          <div className="call-buttons">
            <button className="call-demo-btn">Book A Demo</button>
            <button className="call-trial-btn">Start 10-Day Free Trial</button>
          </div>
          <p className="call-note">No Credit Card Required</p>
        </div>

        {/* Image Section */}
        <div className="call-image">
          <img src={callImage} alt="Call Management" />
        </div>


      </div>
      <Logo />


      {/* Features Section */}
      <FeaturesSection
        title="Features Built for High-Performance Calling Teams"
        subheading="Simplifies how your team calls and converts"
        features={myFeatures}
      />

      <Bannerbtn
        title="Manage your entire call flow
without the clutter"
        buttonText="Start 10-day free trial"
        backgroundImage="/src/image/runo/background-cta.webp"
        onClick={() => alert("Demo scheduled")}
      />

      <section class="ai-tools-section">
        <div class="ai-tools-container">
          <h1 class="ai-tools-title">
            Make Smarter Calls With <span class="ai-gradient">CiisNetwork <span class="blue">AI</span></span> Tools
          </h1>
          <p class="ai-tools-subtitle">Power up your team with real call intelligence</p>

          <div class="ai-tools-content">
            <div class="ai-text-content">
              <h3 class="ai-feature-title">AI Call Transcripts</h3>
              <p class="ai-feature-description">
                Get a complete, accurate text version of every call. No need to re-listen or take notes.
              </p>
            </div>

            <div class="ai-card">
              <div class="chat-item">
                <div class="chat-header">
                  <div class="avatar pink">👤</div>
                  <div class="name-time">
                    <span class="name">Navjot Kaur</span>
                    <span class="time">00:10</span>
                  </div>
                  <div class="bar yellow"></div>
                </div>
                <p class="chat-text">Ha ji regarding the usages sir, I just wanted to know that how the usage is happening.</p>
              </div>
              <div class="chat-item">
                <div class="chat-header">
                  <div class="avatar green">👤</div>
                  <div class="name-time">
                    <span class="name">Vikas Tiwari</span>
                    <span class="time">00:15</span>
                  </div>
                  <div class="bar green"></div>
                </div>
                <p class="chat-text">Apne check kiya tha apne team ka kaise use kar rahe hain. Hum bahut kam dekh rahe the…</p>
              </div>

            </div>


          </div>

        </div>
      </section>
      <FeaturesSection />
      <Bannerbtn
        title="Ready to see what smart
calling actually feels like?"
        buttonText="Book A Demo"
        backgroundImage="/src/image/runo/background-cta.webp"
        onClick={() => alert("Demo scheduled")}
      />
      <Review />
      <FAQ />


      <section className="data-protection-section">
        <div className="data-protection-container">
          {/* Heading */}
          <h2 className="protection-heading">
            Committed to the Highest <br />
            Standards of Data Protection
          </h2>

          {/* Logos Grid */}
          <div className="standards-grid">
            <img src={Security} alt="" />
          </div>
        </div>
      </section>
      <section className="telecalling-section">
        <div className="telecalling-container">
          {/* Heading */}
          <h1 className="telecalling-heading">
            A Call Center App <br />
            Built for Mobile Teams

          </h1>

          {/* Description */}
          <p className="telecalling-description">
            Stay connected to every call and every rep, whether you're in the office or on the move. Track lead activity, assign follow-ups, and monitor team performance directly from your phone using CiisNetwork
             SIM-based call center app. No desktops, no delays.
          </p>

          {/* Download Buttons */}
          <div className="download-buttons">
            <button className="download-button">
              <span className="button-icon">📱</span>
              Download on the App Store
            </button>

            <button className="download-button">
              <span className="button-icon">▶️</span>
              <span className="button-text">GET IT ON <br /> Google Play</span>
            </button>
          </div>

          {/* Rating */}
          <div className="rating-section">
            <div className="stars">
              ★★★★★
              <span className="rating-text">4.7 Star</span>
            </div>
            <p className="downloads-text">50K+ Downloads</p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}

export default CallCenter