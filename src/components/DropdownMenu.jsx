import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';

const DropdownMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await axios.post('/api/logout');
    navigate('/login');
  };

  return (
    <div className="dropdown" onClick={() => setOpen(!open)}>
      {open && (
        <ul className="dropdown-list">
          <li onClick={() => navigate('/settings')}>Settings</li>
          <li onClick={() => navigate('/privacy')}>Privacy Policy</li>
          <li onClick={() => navigate('/support')}>Contact Support</li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      )}
    </div>
  );
};

export default DropdownMenu;
