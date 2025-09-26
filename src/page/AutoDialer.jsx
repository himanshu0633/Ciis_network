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
import icon9 from '../image/runo/9.png';
import icon10 from '../image/runo/10.png'; // Add if needed

import Logo from '../components/Logo'
function AutoDialer() {
  // Define your features here
  // You can replace these with actual icons or images as needed
  const myFeatures = [
    {
      title: 'Auto Dialer',
      description: 'Call leads back-to-back without dialing manually. Boost call speed and focus.',
      icon: icon1,
    },
    {
      title: 'Advanced Caller ID',
      description: 'See the lead’s name, last interaction, and notes before every call',
      icon: icon2,
    },
    {
      title: 'Call Recording',
      description: 'Record every call automatically for training, compliance, and audit purposes.',
      icon: icon3,
    },
    {
      title: 'Live Performance Dashboard',
      description: 'Track daily calling metrics, follow-ups, and lead movement with visual reports.',
      icon: icon4,
    },
    {
      title: 'Follow-Up Notifications',
      description: 'Get automatic reminders for pending follow-ups to avoid losing hot leads.',
      icon: icon5,
    },
    {
      title: 'Lead Management',
      description: 'Capture, track, and update every lead in real time from a single dashboard.',
      icon: icon6,
    },
    {
      title: 'Auto Lead Allocation',
      description: 'Distribute leads instantly to the right agent based on pre-set rules.',
      icon: icon7,
    },
    {
      title: 'CRM Integration',
      description: 'Access lead details, call notes, and previous interactions without leaving the app.',
      icon: icon8,
    },
    {
      title: 'Real-Time Team Tracking',
      description: 'Monitor agent activity live. See who is calling, who is idle, and who is behind on follow-ups.',
      icon: icon9,
    },
    {
      title: 'WhatsApp Templates',
      description: 'Send pre-approved WhatsApp templates directly from the app after each call.',
      icon: icon10,
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
            <span>AutoDialer App</span>
          </nav>
          <h1 className="call-title">
            SIM-Based Auto <br />Dialer That Ends <br />Manual Calling for<br /> Good
          </h1>
          <p className="call-subtitle">
            Integrated with Runo’s Call Management CRM, it speeds up outreach and helps your team stay on track with every lead.
          </p>
          <ul className="call-features">
            <li>Auto Dial 100+ leads/ day</li>
            <li>SIM-based calling that builds trust with every ring</li>
            <li>Live call updates in the CRM
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
        title="Your Sales Toolkit, Simplified"
        subheading="Speed up your sales process with our powerful tools"
        features={myFeatures}
      />

      <Bannerbtn
        title="Give it a spin with your
team today"
        buttonText="Start 10-day free trial"
        backgroundImage="/src/image/runo/background-cta.webp"
        onClick={() => alert("Demo scheduled")}
      />

      <section class="ai-tools-section">
        <div class="ai-tools-container">
          <h1 class="ai-tools-title">
            Make Smarter Calls With <span class="ai-gradient">Runo’s <span class="blue">AI</span></span> Tools
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
        title="Take a closer look at how Runo
works for real teams like yours"
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
            Simplify Your <br />
            Telecalling Operations
          </h1>

          {/* Description */}
          <p className="telecalling-description">
            Streamline your telecalling workflow. Runo simplifies call management,
            lead tracking, and team monitoring in one app.
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

export default AutoDialer