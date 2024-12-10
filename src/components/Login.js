import React, { useState } from 'react';
import { Container, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase';
import '../styles/login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const verifySecurityPassword = async () => {
    const docRef = doc(firestore, 'access', 'loginPassword');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const storedPassword = docSnap.data().password;
      return securityCode === storedPassword;
    } else {
      throw new Error('Security password not found in database.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      if (!email || !password || !securityCode) {
        setLoginError('All fields are required.');
        setIsLoading(false);
        return;
      }

      const isPasswordCorrect = await verifySecurityPassword();
      if (!isPasswordCorrect) {
        setLoginError('Incorrect security code.');
        setIsLoading(false);
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      setIsLoading(false);
    } catch (error) {
      console.error('Error logging in:', error);
      setLoginError('Failed to login. Please check your details.');
      setIsLoading(false);
    }
  };

  return (
    <Container className="login-container">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <div className="text-center mb-4">
            <h2 className="login-title">Client Tracking System</h2>
          </div>
          {loginError && <Alert variant="danger">{loginError}</Alert>}
          <Form onSubmit={handleLogin} className="login-form">
            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>Password</Form.Label>
              <div className="password-input-container">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  onClick={togglePasswordVisibility}
                  className="password-toggle-icon"
                />
              </div>
            </Form.Group>
            <Form.Group controlId="formSecurityCode" className="mb-3">
              <Form.Label>Security Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter security code"
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formRememberMe" className="mb-3">
              <Form.Check type="checkbox" label="Remember Me" />
            </Form.Group>
            <div className="text-center">
              <Button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
