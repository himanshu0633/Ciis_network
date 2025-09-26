import React, { useState } from 'react';
import '../componentsCSS/Crm.css';
import connect from '../image/crm/call-connect.webp';
import efficiency from '../image/crm/call-efficiency.webp';
import followUps from '../image/crm/follow-ups.webp';
import liveTracking from '../image/crm/live-tracking.webp';
import userFriendly from '../image/crm/user-friendly.webp';
import setup from '../image/crm/30-min-setup.webp';

const Crm = () => {
    const [currentImage, setCurrentImage] = useState(0);

    const images = [
        connect,
        efficiency,
        followUps,
        liveTracking,
        userFriendly,
        setup,
    ];

    const headings = [
        'Boost Call Connect Rate With SIM-Based Calling',
        'Improve Call Efficiency With AI Call Scoring & Evaluation',
        'Never Miss Follow-Ups With Smart Reminders',
        'Get Instant Visibility With Live Team Tracking',
        'Improve CRM Adoption With User-Friendly Interface',
        'Get Started With 30-Minute Quick Setup',
    ];

    const handleClick = (index) => {
        setCurrentImage(index);
    };

    return (<>
         <div className='crm-text'>
                <h1>Whooosh…That’s the Sound of Closing Deals Faster</h1>
            </div>
        <div className="crm-container">
           
            <div className="crm-left">
                {headings.map((text, index) => (
                    <div
                        key={index}
                        onClick={() => handleClick(index)}
                        className={`crm-item ${index === currentImage ? 'active' : ''}`}
                    >
                        {text}
                    </div>
                ))}
            </div>

            <div className="crm-right">
                <img
                    src={images[currentImage]}
                    alt="CRM Feature"
                    className="crm-image"
                />
            </div>
        </div>
        </>
    );
};

export default Crm;
