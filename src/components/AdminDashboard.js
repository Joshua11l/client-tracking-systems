import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import DashboardPage from './Dashboard';
import ClientsPage from './ClientsPage';
import ProfilePage from './ProfilePage';

const AdminDashboard = ({ onAddUpdate }) => {
  const location = useLocation();

  return (
    <Container fluid>
      <Row>
        <Col md={2} className="p-0">
          <Sidebar />
        </Col>
        <Col md={10} className="p-0">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="dashboard"
                element={
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DashboardPage onAddUpdate={onAddUpdate} />
                  </motion.div>
                }
              />
              
              <Route
                path="clients"
                element={
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ClientsPage />
                  </motion.div>
                }
              />
              <Route
                path="profile"
                element={
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProfilePage />
                  </motion.div>
                }
              />
              
              <Route path="/" element={<Navigate to="dashboard" />} />
            </Routes>
          </AnimatePresence>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
