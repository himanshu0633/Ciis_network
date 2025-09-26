import React from 'react'
import { FaShieldAlt, FaChartLine, FaUserTie } from 'react-icons/fa';
import '../componentsCSS/Review.css';

import upstox1 from '../image/surendranath.webp';
import upstox2 from '../image/anas-rahman.webp';
import upstox3 from '../image/monish-patel.webp';
const Review = () => {
        const testimonials = [
    {
      id: 1,
      text: "Our calling process was fairly straightforward, but we felt there was room to improve how we tracked calls and follow-ups. Runo helped us bring in that extra layer of structure without complicating anything.",
      author: "Anas Rahman Junaid",
      role: "Founder & Chief Researcher, Hurun India",
      image: upstox1
    },
    {
      id: 2,
      text: "Runo has transformed the way we manage our sales operations. The live dashboard and real-time tracking have made our processes more efficient and customer-focused.",
      author: "Manish Patel",
      role: "Founder And MD, MSwipe",
      image:  upstox2
    },
    {
      id: 3,
      text: "Since implementing Runo, our team productivity has increased by 40%. The intuitive interface and powerful analytics have been game-changers for our business.",
      author: "Sarah Williams",
      role: "CEO, TechSolutions Inc.",
      image:  upstox3
    }
  ];

  return (
    <>
    <section className="hero-section-review">
  

      {/* Testimonial Header */}
      <div className="testimonial-header">
        <h2><strong>We're Not Saying Runo's Magic... But People Think It Is</strong></h2>
      </div>

      {/* Testimonials */}
      <div className="testimonial-slider">
        <div className="slides">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="slide">
              <div className="testimonial-content">
                <p className="testimonial-text">{testimonial.text}</p>
                <div className="testimonial-author">
                  <img src={testimonial.image} alt={testimonial.author} />
                  <div className="author-info">
                    <h4>{testimonial.author}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    
    </>
  )
}

export default Review