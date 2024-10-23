import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert, Accordion } from 'react-bootstrap';
import { doc, getDoc, collection, query, where, orderBy, getDocs, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import '../styles/ClientMiniatureView.css';  // Assuming you have a CSS file for styling

const ClientMiniatureView = ({ clientId, show, handleClose }) => {
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState(null); // State to control active accordion item

  useEffect(() => {
    if (show) {
      const fetchClientData = async () => {
        setLoading(true);
        try {
          const clientDoc = await getDoc(doc(firestore, 'clients', clientId));
          if (clientDoc.exists()) {
            const updatesQuery = query(collection(firestore, 'updates'), where('clientId', '==', clientId), orderBy('date', 'asc'));
            const updatesSnapshot = await getDocs(updatesQuery);

            const updates = updatesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setClientData({ ...clientDoc.data(), updates });
          } else {
            console.error('No such client document!');
          }
        } catch (error) {
          console.error('Error fetching client data:', error);
        }
        setLoading(false);
      };

      if (clientId) {
        fetchClientData();
        setActiveKey(null); // Reset the active key when the modal is opened
      }
    }
  }, [clientId, show]);

  const handleProjectCompletion = async () => {
    if (clientData) {
      const clientRef = doc(firestore, 'clients', clientId);
      await updateDoc(clientRef, { completed: true });
      handleClose();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Client View</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        ) : clientData ? (
          <div className="client-miniature-view">
            <h3>{clientData.name}</h3>
            <div className="updates-container">
              <h5>Updates</h5>
              <Accordion activeKey={activeKey} onSelect={(key) => setActiveKey(key)}>
                {clientData.updates?.length > 0 ? (
                  clientData.updates.map((update, index) => (
                    <Accordion.Item eventKey={index.toString()} key={index}>
                      <Accordion.Header>
                        <strong>{update.title}</strong>
                        <span className="update-date">({new Date(update.date.toDate ? update.date.toDate() : update.date).toLocaleString()})</span>
                      </Accordion.Header>
                      <Accordion.Body>
                        {update.comments && update.comments.length > 0 ? (
                          <div className="comments-section">
                            <h6>Comments</h6>
                            <ul className="comments-list">
                              {update.comments.map((comment, commentIndex) => (
                                <li key={commentIndex} className="comment-item">{comment}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p>No Comments</p>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  ))
                ) : (
                  <p>No updates available.</p>
                )}
              </Accordion>
            </div>
          </div>
        ) : (
          <Alert variant="danger">Client data not found.</Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
        <Button variant="success" onClick={handleProjectCompletion}>Project Completed</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ClientMiniatureView;
