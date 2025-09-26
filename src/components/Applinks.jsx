import React from 'react'
import { FaGooglePlay } from 'react-icons/fa';
import { FaStar } from 'react-icons/fa';
import { FaApple } from 'react-icons/fa6';
const Applinks = () => {
    return (
        <div>
            <div className="ero-container">
                <div className="ero-content">
                    <div className="titless">
                        <h1>One App To Manage Calls,</h1>
                        <h1>Follow-ups, and Sales</h1>
                    </div>

                    <button className="demo-btn">Schedule Your Demo</button>

                    <div className="download-section">
                        <p className="download-text">Download on the</p>
                        <div className="app-badges">
                            <div className="app-badge">
                                <FaApple className="badge-icon" />
                                <span>AppStore</span>
                            </div>
                            <div className="app-badge">
                                <FaGooglePlay className="badge-icon" />
                                <span>Google Play</span>
                            </div>
                        </div>
                    </div>

                    <div className="ratings">
                        <div className="stars">
                            {[...Array(5)].map((_, i) => (
                                <FaStar key={i} className="star" />
                            ))}
                        </div>
                        <span className="rating">4.7 Star</span>
                        <span className="downloads">50K+ Downloads</span>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Applinks
