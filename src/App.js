import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Button, Form, Modal } from 'react-bootstrap';
import { auth, firestore } from './firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import AdminDashboard from './components/AdminDashboard';
import ClientsPage from './components/ClientsPage';
import ClientView from './components/ClientView';
import Login from './components/Login';
import { allowedUsers } from './allowedEmails';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userDoc = await getDoc(doc(firestore, 'users', authUser.uid));
        if (userDoc.exists()) {
          setUser({ email: authUser.email, displayName: userDoc.data().name });
        } else {
          setUser({ email: authUser.email, displayName: null });
          setShowNamePopup(true);
        }
      } else {
        setUser(null);
      }
    });
  }, []);

  const isEmailAllowed = (email) => {
    return allowedUsers.some(user => user.email === email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!isEmailAllowed(email)) {
        setError("Email not allowed. Please contact support.");
        setLoading(false);
        return;
      }
      await signInWithEmailAndPassword(auth, email, password);
      const authUser = auth.currentUser;
      const userDoc = await getDoc(doc(firestore, 'users', authUser.uid));
      if (!userDoc.exists()) {
        setShowNamePopup(true);
      }
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
      setLoading(false);
    } catch (error) {
      console.error("Error logging in", error);
      setError("Failed to login. Please check your credentials.");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  const handleNameSubmit = async () => {
    try {
      const authUser = auth.currentUser;
      await setDoc(doc(firestore, 'users', authUser.uid), { name });
      setUser({ email: authUser.email, displayName: name });
      setShowNamePopup(false);
    } catch (error) {
      console.error("Error saving name", error);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/*" element={<AppRoutes user={user} email={email} setEmail={setEmail} password={password} setPassword={setPassword} handleLogin={handleLogin} error={error} handleLogout={handleLogout} handleNameSubmit={handleNameSubmit} showNamePopup={showNamePopup} setShowNamePopup={setShowNamePopup} name={name} setName={setName} loading={loading} showBanner={showBanner} />} />
      </Routes>
    </Router>
  );
};

const AppRoutes = ({ user, email, setEmail, password, setPassword, handleLogin, error, handleLogout, handleNameSubmit, showNamePopup, setShowNamePopup, name, setName, loading, showBanner }) => {
  return (
    <>
      <Routes>
        <Route path="/admin/*" element={
          user ? (
            <AdminDashboard onAddUpdate={() => {}} />
          ) : (
            <Login
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              handleLogin={handleLogin}
              error={error}
              loading={loading}
            />
          )
        } />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/client/:clientId" element={<ClientView />} />
         
        <Route path="/" element={<Navigate to="/admin" />} />
      </Routes>
      {showBanner && (
        <div className="login-banner">
          Successfully Logged In!
        </div>
      )}
      <Modal show={showNamePopup} onHide={() => {}}>
        <Modal.Header>
          <Modal.Title>Welcome! Please enter your name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleNameSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default App;
