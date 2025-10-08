import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../image/logo.png';
import '../componentsCSS/RunoHeader.css';

function RunoHeader() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleDropdownToggle = (event) => {
        event.preventDefault();
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleMobileToggle = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);
    };

    return (
        <header>
            <div className="header-logo">
                <img src={Logo} alt="Runo Logo" />
            </div>

            <button className="nav-toggle" onClick={handleMobileToggle}>
                ☰
            </button>

            <nav className={isMobileMenuOpen ? 'active' : ''}>
                <NavLink to="/" className="header-active" onClick={closeMobileMenu}>Home</NavLink>

                <div className="header-dropdown">
                    <NavLink
                        className="header-active dropdown-toggle"
                        onClick={handleDropdownToggle}
                    >
                        Products
                    </NavLink>
                    {isDropdownOpen && (
                        <div className="header-dropdown-menu">
                            <NavLink to="/callmanagement" onClick={closeMobileMenu}>Call Management CRM</NavLink>
                            <NavLink to="/leadmanagement" onClick={closeMobileMenu}>Lead Management CRM</NavLink>
                            <NavLink to="/autodialer" onClick={closeMobileMenu}>Auto Dialer</NavLink>
                            <NavLink to="/callcenter" onClick={closeMobileMenu}>Call Center App</NavLink>
                            <NavLink to="/telecaller" onClick={closeMobileMenu}>Telecaller App</NavLink>
                        </div>
                    )}
                </div>

                <NavLink to="/pricing" className="header-active" onClick={closeMobileMenu}>Pricing</NavLink>
                <NavLink to="/contact" className="header-active" onClick={closeMobileMenu}>Contact Us</NavLink>
            </nav>

            <div className="header-buttons">
                <NavLink to="/login" className="header-login-btn">Login</NavLink>
                <NavLink to="/register" className="header-login-btn">Register</NavLink>
                {/* <button className="header-demo-btn">Request A Demo</button> */}
            </div>
        </header>
    );
}

export default RunoHeader;
