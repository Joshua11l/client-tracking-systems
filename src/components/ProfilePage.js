import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import '../styles/ProfilePage.css';

const placeholderImage = 'https://via.placeholder.com/150';

const ProfilePage = ({ handleLogout }) => {
  const [initialData, setInitialData] = useState({ name: '', position: '', profileImage: placeholderImage });
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(placeholderImage);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [showUpdateButton, setShowUpdateButton] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const storage = getStorage();
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const fetchProfileData = async () => {
      const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setImageUrl(userData.profileImage || placeholderImage);
        setName(userData.name || '');
        setEmail(userData.email || auth.currentUser.email);
        setPosition(userData.position || '');
        setInitialData({ name: userData.name || '', position: userData.position || '', profileImage: userData.profileImage || placeholderImage });
      }
    };
    fetchProfileData();
  }, [auth.currentUser.uid, auth.currentUser.email]);

  useEffect(() => {
    if (name !== initialData.name || position !== initialData.position || image) {
      setShowUpdateButton(true);
    } else {
      setShowUpdateButton(false);
    }
  }, [name, position, image, initialData]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      let newProfileImageUrl = imageUrl;
      if (image) {
        const storageRef = ref(storage, `users/${auth.currentUser.uid}/profile.jpg`);
        await uploadBytes(storageRef, image);
        newProfileImageUrl = await getDownloadURL(storageRef);
      }
      await setDoc(doc(firestore, 'users', auth.currentUser.uid), { name, position, profileImage: newProfileImageUrl }, { merge: true });
      setImageUrl(newProfileImageUrl);
      setInitialData({ name, position, profileImage: newProfileImageUrl });
      setImage(null);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000); // Hide banner after 3 seconds
    } catch (error) {
      console.error("Error updating profile", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <Container fluid className="profile-page">
      <Row className="align-items-center justify-content-center mb-3">
        <Col md={6}>
          <h1 className="text-center mb-4 main-head">Profile Page</h1>
          <div className="profile-image text-center mb-4 position-relative">
            <img src={imageUrl} alt="Profile" className="img-thumbnail" />
            <div className="image-upload-overlay">
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip>Upload Image</Tooltip>}
              >
                <Form.Control type="file" onChange={handleImageChange} className="image-upload-input" />
              </OverlayTrigger>
              <FontAwesomeIcon icon={faUpload} size="2x" className="upload-icon" />
            </div>
          </div>
          <Form onSubmit={handleProfileUpdate}>
            <div className="info-container p-4 mb-4">
              <Form.Group controlId="formName" className="mb-3">
                <Form.Label className="profile-labels">Name</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </Form.Group>
              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label className="profile-labels">Email</Form.Label>
                <Form.Control type="email" placeholder="Email" value={email} readOnly />
              </Form.Group>
              <Form.Group controlId="formPosition" className="mb-3">
                <Form.Label className="profile-labels">Position</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Position" 
                  value={position} 
                  onChange={(e) => setPosition(e.target.value)} 
                />
              </Form.Group>
            </div>
            {showUpdateButton && (
              <div className="d-flex justify-content-center mt-4">
                <Button variant="primary" className='button-profile' type="submit">Update Profile</Button>
              </div>
            )}
          </Form>
          <div className="d-flex justify-content-center mt-4">
            <Button variant="primary" className='button-profile' onClick={handleLogout}>Log Out</Button>
          </div>
        </Col>
      </Row>
      {showBanner && (
        <div className="update-banner">
          Profile Updated!
        </div>
      )}
    </Container>
  );
};

export default ProfilePage;
