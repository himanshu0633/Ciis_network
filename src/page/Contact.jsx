import React, { useState } from 'react';
import Footer from '../components/Footer';
import RunoHeader from '../components/RunoHeader';
import '../componentsCSS/Contact.css';
function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission here
  };

  return (
    <>
      <RunoHeader />
      <section className='contact-page'>
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-container">
            <button className="contact-button">CONTACT US</button>
            <h1 className="hero-title">We're Here to Help — Let's Connect</h1>
            <p className="hero-description">
              Whether you have questions, need support, or want to explore a partnership, the CiisNetwork
              team is ready to assist you. Reach out and let's start the conversation.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="contact-section">
          <div className="contact-container">
            {/* Left Side - Contact Info */}
            <div className="contact-info">
              <h2 className="contact-title">We'd Always Love to Hear From You</h2>
              <p className="contact-description">
                Have any questions about CiisNetwork, product demo or support? Shoot them away here.
              </p>

              <div className="company-info">
                <div className="info-item">
                  <div className="info-icon"></div>
                  <div className="info-content">
                    <h3>Rutakshi Technologies Private Limited</h3>
                    <p>
                      Cyber Towers, Patrika Nagar,<br />
                      HITEC City, Hyderabad,<br />
                      Telangana, INDIA.
                    </p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon"></div>
                  <div className="info-content">
                    <p><strong>Phone:</strong> +91 8179880074</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon"></div>
                  <div className="info-content">
                    <p><strong>Email:</strong> care@CiisNetwork.ai</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div className="contact-form-wrapper">
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Your Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group half">
                    <label>Your Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Your Phone</label>
                  <div className="phone-input">
                    <div className="country-code">
                      <span className="flag">🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Your Phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    name="message"
                    rows="4"
                    placeholder="Your message here..."
                    value={formData.message}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="form-footer">
                  <p className="privacy-text">
                    By submitting this form, I agree to the <span className="privacy-link">privacy policy</span>.
                  </p>
                  <button type="submit" className="submit-button">
                    Contact Us
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Floating Chat Icon */}
        <div className="floating-chat">

        </div>
      </section>
      <Footer />
    </>
  );
}

export default Contact