import React, { useState } from 'react';
import { Container, Button, Form, Alert, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '../firebase';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { allowedUsers } from '../allowedEmails'; // Correct the path to allowedEmails.js
import logo from '../logo.PNG';
import './css-folder/login.css';

const Login = ({ error, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Declare name state
  const [position, setPosition] = useState(''); // Declare position state
  const [showPassword, setShowPassword] = useState(false);
  const [showSecurityPassword, setShowSecurityPassword] = useState(false); // New state for security password visibility
  const [securityPassword, setSecurityPassword] = useState(''); // For the security password
  const [signUpError, setSignUpError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [loginError, setLoginError] = useState(''); // Error state for login

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else if (field === 'securityPassword') {
      setShowSecurityPassword(!showSecurityPassword);
    }
  };

  const isEmailAllowed = (email) => {
    return allowedUsers.some(user => user.email === email);
  };

  const verifySecurityPassword = async () => {
    const docRef = doc(firestore, 'access', 'loginPassword');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const storedPassword = docSnap.data().password;
      return securityPassword === storedPassword;
    } else {
      throw new Error('Security password not found in database.');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setSignUpError('');
    setIsLoading(true);
    try {
      if (!isEmailAllowed(email)) {
        setSignUpError("Email not allowed. Please contact support.");
        setIsLoading(false);
        return;
      }

      const isPasswordCorrect = await verifySecurityPassword();
      if (!isPasswordCorrect) {
        setSignUpError("Incorrect security password.");
        setIsLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(firestore, 'users', userCredential.user.uid), { name, email, position });
      setIsLoading(false);
    } catch (error) {
      console.error("Error signing up", error);
      setSignUpError("Failed to sign up. Please check your details.");
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setSignUpError('');
    setLoginError(''); // Clear any previous error messages
    setIsLoading(true);
    try {
      if (!email || !password) {
        setLoginError("Email and Password are required.");
        setIsLoading(false);
        return;
      }

      const isPasswordCorrect = await verifySecurityPassword();
      if (!isPasswordCorrect) {
        setLoginError("Incorrect security password.");
        setIsLoading(false);
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      setIsLoading(false);
    } catch (error) {
      console.error("Error logging in", error);
      setLoginError("Failed to login. Please check your details.");
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Container className="login-form-container">
        <Row className="justify-content-md-center">
          <Col md={6}>
            <div className="text-center">
              <img src={logo} alt="Divine Software Systems Logo" className="mb-4 logo-1" />
              <h1 className="mb-4 dss-font">Divine Software Systems</h1>
            </div>
            <Tabs defaultActiveKey="login" id="login-signup-tabs" className="mb-3">
              <Tab eventKey="login" title="Login">
                {loginError && <Alert variant="danger">{loginError}</Alert>}
                <Form onSubmit={handleLogin}>
                  <Form.Group controlId="formEmail">
                    <Form.Label>Email:</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group controlId="formPassword" className="mt-3">
                    <Form.Label>Password:</Form.Label>
                    <div className="password-input-container">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                        onClick={() => togglePasswordVisibility('password')}
                        className="password-toggle-icon"
                      />
                    </div>
                  </Form.Group>
                  <Form.Group controlId="formSecurityPassword" className="mt-3">
                    <Form.Label>Security Password:</Form.Label>
                    <div className="password-input-container">
                      <Form.Control
                        type={showSecurityPassword ? 'text' : 'password'}
                        placeholder="Enter the security password"
                        value={securityPassword}
                        onChange={(e) => setSecurityPassword(e.target.value)}
                      />
                      <FontAwesomeIcon
                        icon={showSecurityPassword ? faEyeSlash : faEye}
                        onClick={() => togglePasswordVisibility('securityPassword')}
                        className="password-toggle-icon"
                      />
                    </div>
                  </Form.Group>
                  <div className="text-center">
                    <Button variant="primary" type="submit" className="mt-3 small-button" disabled={loading || isLoading}>
                      {isLoading ? <div className="spinner-border" role="status"></div> : 'Login'}
                    </Button>
                  </div>
                </Form>
              </Tab>
              <Tab eventKey="signup" title="Sign Up">
                {signUpError && <Alert variant="danger">{signUpError}</Alert>}
                <Form onSubmit={handleSignUp}>
                  <Form.Group controlId="formEmail">
                    <Form.Label>Email:</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group controlId="formName" className="mt-3">
                    <Form.Label>Name:</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group controlId="formPosition" className="mt-3">
                    <Form.Label>Job Position:</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group controlId="formPassword" className="mt-3">
                    <Form.Label>Password:</Form.Label>
                    <div className="password-input-container">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                        onClick={() => togglePasswordVisibility('password')}
                        className="password-toggle-icon"
                      />
                    </div>
                  </Form.Group>
                  <Form.Group controlId="formSecurityPassword" className="mt-3">
                    <Form.Label>Security Password:</Form.Label>
                    <div className="password-input-container">
                      <Form.Control
                        type={showSecurityPassword ? 'text' : 'password'}
                        placeholder="Enter the security password"
                        value={securityPassword}
                        onChange={(e) => setSecurityPassword(e.target.value)}
                      />
                      <FontAwesomeIcon
                        icon={showSecurityPassword ? faEyeSlash : faEye}
                        onClick={() => togglePasswordVisibility('securityPassword')}
                        className="password-toggle-icon"
                      />
                    </div>
                  </Form.Group>
                  <div className="text-center">
                    <Button variant="primary" type="submit" className="mt-3 small-button" disabled={loading || isLoading}>
                      {isLoading ? <div className="spinner-border" role="status"></div> : 'Create Account'}
                    </Button>
                  </div>
                </Form>
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
