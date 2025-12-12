import React, { useState } from 'react';
import './ContactUs.css';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Clock, 
  CheckCircle, 
  Building2,
  Users,
  Shield,
  Zap,
  MessageSquare,
  Globe,
  ArrowRight,
  Star,
  Award,
  Headphones
} from 'lucide-react';
import Header from "../Components/CiisNavbar.jsx";
import Footer from "../Components/CiisFooter.jsx";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setLoading(false);
    
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ 
        name: '', 
        email: '', 
        company: '', 
        phone: '', 
        subject: '', 
        message: '' 
      });
    }, 4000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: <Mail size={24} />,
      title: 'Email Us',
      details: ['info@ciisnetwork.com'],
      color: '#4F46E5'
    },
    {
      icon: <Phone size={24} />,
      title: 'Call Us',
      details: ['+91 98759 29761'],
      color: '#10B981'
    },
    {
      icon: <MapPin size={24} />,
      title: 'Visit Office',
      details: ['📍5th Floor, C210 8B ,Sector-74, Mohali ,Punjab, India', 'Mohali, Punjab - 160059', 'India'],
      color: '#F59E0B'
    },
    {
      icon: <Clock size={24} />,
      title: 'Working Hours',
      details: ['Mon-Fri: 9:00 AM - 6:00 PM', 'Sat: 10:00 AM - 4:00 PM', 'Sun: Emergency Support'],
      color: '#8B5CF6'
    }
  ];

  const features = [
    { icon: <Shield size={20} />, text: 'Enterprise Security' },
    { icon: <Zap size={20} />, text: 'Fast Response' },
    { icon: <Headphones size={20} />, text: '24/7 Support' },
    { icon: <Award size={20} />, text: 'Certified Team' }
  ];

  return (
    <div className="Contact">
      <Header />
      
      {/* Hero Banner */}
      <section className="Contact-hero-banner">
        <div className="Contact-hero-overlay"></div>
        <div className="Contact-hero-content">
          <div className="Contact-hero-badge">
            <span className="Contact-hero-badge-dot"></span>
            Get in Touch
          </div>
          <h1 className="Contact-hero-title">Contact Our Team</h1>
          <p className="Contact-hero-subtitle">
            Ready to transform your workforce management? Our experts are here to help you every step of the way.
          </p>
          
          <div className="Contact-hero-features">
            {features.map((feature, index) => (
              <div key={index} className="Contact-hero-feature">
                <div className="Contact-hero-feature-icon">
                  {feature.icon}
                </div>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="Contact-main-container">
        <div className="Contact-grid">
          {/* Left Column - Contact Form & Map */}
          <div className="Contact-left-column">
            <div className="Contact-form-card">
              <div className="Contact-form-header">
                <div className="Contact-form-header-icon">
                  <MessageSquare size={28} />
                </div>
                <div>
                  <h2 className="Contact-form-title">Send Us a Message</h2>
                  <p className="Contact-form-description">
                    Fill out the form below and our team will get back to you within 24 hours.
                  </p>
                </div>
              </div>

              {submitted && (
                <div className="Contact-success-card">
                  <CheckCircle size={24} />
                  <div>
                    <h4>Message Sent Successfully!</h4>
                    <p>Thank you for contacting us. We'll respond shortly.</p>
                  </div>
                </div>
              )}

              <form className="Contact-form" onSubmit={handleSubmit}>
                <div className="Contact-form-grid">
                  <div className="Contact-form-group">
                    <label htmlFor="name" className="Contact-form-label">
                      <span>Full Name</span>
                      <span className="Contact-form-required">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Name"
                      className="Contact-form-input"
                      required
                    />
                  </div>
                  
                  <div className="Contact-form-group">
                    <label htmlFor="email" className="Contact-form-label">
                      <span>Email Address</span>
                      <span className="Contact-form-required">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email Id"
                      className="Contact-form-input"
                      required
                    />
                  </div>

                  <div className="Contact-form-group">
                    <label htmlFor="company" className="Contact-form-label">
                      <span>Company Name</span>
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Your Company"
                      className="Contact-form-input"
                    />
                  </div>

                  <div className="Contact-form-group">
                    <label htmlFor="phone" className="Contact-form-label">
                      <span>Phone Number</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      className="Contact-form-input"
                    />
                  </div>
                </div>

                <div className="Contact-form-group">
                  <label htmlFor="subject" className="Contact-form-label">
                    <span>Subject</span>
                    <span className="Contact-form-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    className="Contact-form-input"
                    required
                  />
                </div>

                <div className="Contact-form-group">
                  <label htmlFor="message" className="Contact-form-label">
                    <span>Message</span>
                    <span className="Contact-form-required">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your requirements..."
                    className="Contact-form-textarea"
                    rows="6"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="Contact-submit-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="Contact-submit-loader"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map Section - Now below the form in left column */}
            <div className="Contact-map-section">
              <div className="Contact-map-container">
                <div className="Contact-map-overlay">
                  <h3 className="Contact-map-title">Visit Our Office</h3>
                  <div className="Contact-map-address">
                    <MapPin size={20} />
                    <div>
                      <p>📍5th Floor, C210 8B ,Sector-74, Mohali ,Punjab, India</p>
                    </div>
                  </div>
                  <div className="Contact-map-actions">
                    <button 
                      className="Contact-map-button Contact-map-button-primary"
                      onClick={() => window.open('https://maps.google.com/?q=Career Infowis IT Solution Private Limited | Digital Marketing Agency | Web & App Development | Social Media Marketing, 5th Floor, C210c Phase, 8B, Phase 8B, Industrial Area, Sector 74, Sahibzada Ajit Singh Nagar, Punjab 140308', '_blank')}
                    >
                      Get Directions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Info & Response Card */}
          <div className="Contact-right-column">
            <div className="Contact-info-card">
              <div className="Contact-info-header">
                <h3 className="Contact-info-title">Contact Information</h3>
                <p className="Contact-info-description">
                  Connect with us through any channel. Our team is always ready to assist you.
                </p>
              </div>

              <div className="Contact-info-grid">
                {contactInfo.map((info, index) => (
                  <div 
                    key={index} 
                    className="Contact-info-item"
                    style={{ '--info-color': info.color }}
                  >
                    <div className="Contact-info-icon" style={{ backgroundColor: info.color }}>
                      {info.icon}
                    </div>
                    <div className="Contact-info-content">
                      <h4 className="Contact-info-item-title">{info.title}</h4>
                      <div className="Contact-info-details">
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="Contact-info-detail">{detail}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="Contact-team-highlight">
                <div className="Contact-team-icon">
                  <Users size={24} />
                </div>
                <div>
                  <h4>Dedicated Support Team</h4>
                  <p>Get personalized assistance from our certified experts</p>
                </div>
              </div>
            </div>

            {/* Quick Response Card */}
            <div className="Contact-response-card">
              <div className="Contact-response-header">
                <div className="Contact-response-icon">
                  <Zap size={24} />
                </div>
                <h4>Quick Response Time</h4>
              </div>
              <div className="Contact-response-stats">
                <div className="Contact-response-stat">
                  <div className="Contact-response-number">≤ 1</div>
                  <div className="Contact-response-label">Hour Response</div>
                </div>
                <div className="Contact-response-stat">
                  <div className="Contact-response-number">24/7</div>
                  <div className="Contact-response-label">Support Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactUs;