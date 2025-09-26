import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import '../componentsCSS/FAQ.css';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqItems = [
    {
      question: "What are the billing cycles available for Runo?",
      answer: "You can choose from quarterly, half-yearly, or annual billing. The longer the cycle, the more you save."
    },
    {
      question: "How much does Runo cost per user?",
      answer: "Runo starts at ₹599 per user per month when billed annually. If you prefer shorter billing cycles, it's ₹699 per user per month for 6 months and ₹899 per user per month for 3 months. All plans come with a 10-day free trial and no setup cost."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes! We offer a 14-day free trial with full access to all features. No credit card is required to start your trial. You can upgrade to a paid plan anytime during or after your trial."
    },
    {
      question: "Are there any discounts for longer commitments?",
      answer: "Yes. Annual plans come with the biggest savings compared to quarterly or half-yearly plans."
    },
    {
      question: "Are there any setup or implementation fees?",
      answer: "No. Runo setup is completely free and takes less than 30 minutes. If your team needs personalised help with setup, CRM customisation, or training, we offer an optional guided onboarding."
    },
    {
      question: "Can I change my billing cycle later?",
      answer: "Yes, you can switch your billing cycle any time. Just reach out to our support team."
    },
    {
      question: "What payment methods can I use?",
      answer: "We accept cheque, UPI, credit and debit cards, and net banking."
    },
    {
      question: "Do I need a minimum number of users to get started?",
      answer: "Not at all. You can start with just one user and add more as your team grows."
    },
    {
      question: "Can I add or remove users during my subscription period?",
      answer: "Yes. You can scale your team up or down anytime. Charges are adjusted in your next billing cycle."
    },
    {
      question: "How do I cancel my subscription?",
      answer: "You can cancel from your account dashboard or contact support. Your data will remain safe and can be restored if you come back."
    }
  ];

  return (
    <section className="faq-section">
      <div className="container">
        <h2 className="section-title">Still Curious? Let's Clear It Up.</h2>
        
        <div className="faq-container">
          {faqItems.map((item, index) => (
            <div 
              key={index} 
              className={`faq-item ${activeIndex === index ? 'active' : ''}`}
            >
              <button 
                className="faq-question" 
                onClick={() => toggleFAQ(index)}
              >
                <span>{item.question}</span>
                {activeIndex === index ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;