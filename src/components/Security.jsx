import React from 'react'
import { FaShieldAlt, FaChartLine, FaUserTie } from 'react-icons/fa';
import '../componentsCSS/Review.css';


const Security = () => {
    return (
        <div>
            {/* Security Section */}
            <div className="security-container">
                <div className="security-content">
                    <h1><strong>Enterprise-grade security</strong></h1>
                    <p>Have peace of mind that your company's data is fully secure and compliant with the latest industry standard certifications.</p>
                    <div className="security-features">
                        <div className="feature">
                            <FaShieldAlt className="feature-icon" />
                            <h3>Data Encryption</h3>
                            <p>End-to-end encryption for all your communications</p>
                        </div>
                        <div className="feature">
                            <FaChartLine className="feature-icon" />
                            <h3>Compliance</h3>
                            <p>GDPR, HIPAA, and SOC2 compliant</p>
                        </div>
                        <div className="feature">
                            <FaUserTie className="feature-icon" />
                            <h3>Access Control</h3>
                            <p>Role-based permissions and authentication</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Security
