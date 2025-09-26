import React from 'react'
import RunoHeader from '../components/RunoHeader'
import FeaturesSection from '../components/FeaturesSection'
import Footer from '../components/Footer'
import Logo from '../components/Logo'
import AddOnSection from '../components/AddOnSection'
import Review from '../components/Review'
import FAQ from '../components/FAQ'
import '../App.css'
import Security from '../components/Security'
function Pricing() {
  return (
    <>
      {/*  */}
      <RunoHeader />
      {/*  */}

      <div className='p-section'>
        <section className="title-section">
          <div className="container-add">
            <div className="section-title text-center mb-40">
              <h2>Easy to start. Easy to scale.</h2>
              <p>Zero Installation Cost | Zero Hidden Charges | Setup in &lt; 30 Minutes</p>
            </div>
          </div>
        </section>

        <section className="pricing-section">
          <div className="container py-5">
            <div className="row justify-content-center">
              {/* 3 Months Plan */}
              <div className="col-md-4 mb-4 price-card">
                <div className="pricing-card h-100 text-center">
                  <div className="card-body-bc"></div>
                  <div className="card-body">
                    <div className="top-content">
                      <h5><strong>3</strong> Months</h5>
                    </div>
                    <div className="details">
                      <p className="tenure">Billed Quarterly</p>
                      <h3 className="price">₹ 899</h3>
                      <p className="text-muted small">per user/month</p>

                      <ul className="features-list">
                        <li>All core features included</li>
                        <li>24/7 customer support</li>
                        <li>99.9% uptime guarantee</li>
                        <li>10GB storage per user</li>
                      </ul>

                      <a className="btn btn-runo track-btn" href="#">Start 10-Day Free Trial</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6 Months Plan - Most Popular */}
              <div className="col-md-4 mb-4 price-card popular-container">
                <div className="badge most-popular">Most Popular</div>
                <div className="pricing-card h-100 text-center popular popular-card border">
                  <div className="card-body-bc-g"></div>
                  <div className="card-body">
                    <div className="top-content">
                      <h5><strong>6</strong> Months <span className="badge discount">22% off</span></h5>
                    </div>
                    <div className="details">
                      <p className="tenure">Billed Half Yearly</p>
                      <h3 className="price">₹ 699 <del className="text-muted">₹ 899</del></h3>
                      <p className="text-muted small">per user/month</p>

                      <ul className="features-list">
                        <li>Everything in 3-month plan</li>
                        <li>Priority customer support</li>
                        <li>25GB storage per user</li>
                        <li>Free onboarding session</li>
                      </ul>

                      <a className="btn btn-runo track-btn" href="#">Start 10-Day Free Trial</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* 12 Months Plan */}
              <div className="col-md-4 mb-4 price-card">
                <div className="pricing-card h-100 text-center">
                  <div className="card-body-bc-gr"></div>
                  <div className="card-body">
                    <div className="top-content">
                      <h5><strong>12</strong> Months <span className="badge discount">33% off</span></h5>
                    </div>
                    <div className="details">
                      <p className="tenure">Billed Yearly</p>
                      <h3 className="price">₹ 599 <del className="text-muted">₹ 899</del></h3>
                      <p className="text-muted small">per user/month</p>

                      <ul className="features-list">
                        <li>Everything in 6-month plan</li>
                        <li>Dedicated account manager</li>
                        <li>50GB storage per user</li>
                        <li>Quarterly strategy reviews</li>
                      </ul>

                      <a className="btn btn-runo track-btn" href="#">Start 10-Day Free Trial</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/*  */}
      <FeaturesSection />
      {/*  */}
      <AddOnSection />
      {/*  */}
      <FAQ />
      {/*  */}
      <Logo />
      <Security />
      <Review />

      <Footer />
    </>
  )
}

export default Pricing