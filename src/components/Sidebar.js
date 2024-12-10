// src/components/Sidebar.js

import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faChartLine, faUsers, faUsersCog } from '@fortawesome/free-solid-svg-icons';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase'; // Correct import path
import '../styles/Sidebar.css'; // Import the custom CSS file

const Sidebar = () => {
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150');
  const [profileName, setProfileName] = useState('User Name');
  const auth = getAuth();

  useEffect(() => {
    const fetchProfileData = async () => {
      const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setProfileImage(userDoc.data().profileImage || 'https://via.placeholder.com/150');
        setProfileName(userDoc.data().name || 'User Name');
      }
    };
    fetchProfileData();
  }, [auth.currentUser.uid]);

  return (
    <Navbar expand="lg" className="flex-column vh-100 sticky-top custom-sidebar">
      <Container className="flex-column align-items-start p-0">
        <Navbar.Brand className="w-100 p-0 header">
        <h1 className='siderbar-name'>Progress Tracker</h1>
        </Navbar.Brand>
        <hr className="sidebar-divider" />

        <Nav className="flex-column w-100 custom-nav p-0">
          <Nav.Link as={NavLink} to="/admin/dashboard" className="d-flex align-items-center nav-link-custom">
            <FontAwesomeIcon icon={faTachometerAlt} className="me-2 fa-icon" />
            Dashboard
          </Nav.Link>
          <Nav.Link as={NavLink} to="/admin/analytics" className="d-flex align-items-center nav-link-custom">
            <FontAwesomeIcon icon={faTachometerAlt} className="me-2 fa-icon" />
            Analytics
          </Nav.Link>
          
        </Nav>
        <div className="sidebar-profile-container">
          <hr className="sidebar-divider" />
          <Nav.Link as={NavLink} to="/admin/profile" className="p-0">
            <div className="sidebar-profile d-flex align-items-center">
              <img src={profileImage} alt="Profile" className="sidebar-profile-img img-thumbnail" />
              <div className="sidebar-profile-name">{profileName}</div>
            </div>
          </Nav.Link>
        </div>
      </Container>
    </Navbar>
  );
};

export default Sidebar;
