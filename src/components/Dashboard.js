import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import ClientList from './ClientList';
import { firestore } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import AddUpdate from './AddUpdate';
import ClientMiniatureView from './ClientMiniatureView';
import '../styles/DashboardPage.css';

const DashboardPage = () => {
  const [clients, setClients] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientDate, setNewClientDate] = useState('');
  const [newClientDescription, setNewClientDescription] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientCompletionDate, setNewClientCompletionDate] = useState('');
  const [currentClientId, setCurrentClientId] = useState(null);
  const [currentEditClient, setCurrentEditClient] = useState(null);
  const [showAddUpdateModal, setShowAddUpdateModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [showClientViewModal, setShowClientViewModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');

  useEffect(() => {
    const clientsCollection = collection(firestore, 'clients');
    const q = query(clientsCollection, orderBy('date', 'desc')); // 'desc' for newest to oldest

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const clientsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setClients(clientsData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const updatesCollection = collection(firestore, 'updates');
    const q = query(updatesCollection, orderBy('date', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const updatesData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setUpdates(updatesData);
    });

    return () => unsubscribe();
  }, []);

  const handleAddClient = async () => {
    if (!newClientName || !newClientDate || !newClientDescription || !newClientCompany || !newClientCompletionDate) {
      alert('Please fill out all fields');
      return;
    }

    const newClientId = newClientName.replace(/\s+/g, '-').toLowerCase();
    await addDoc(collection(firestore, 'clients'), {
      name: newClientName,
      date: new Date(newClientDate).toISOString(), // Ensure date is saved as an ISO string
      description: newClientDescription,
      company: newClientCompany,
      completionDate: new Date(newClientCompletionDate).toISOString(),
      completed: false,
      url: `${window.location.origin}/client/${newClientId}`
    });
    setNewClientName('');
    setNewClientDate('');
    setNewClientDescription('');
    setNewClientCompany('');
    setNewClientCompletionDate('');
    setShowAddClientModal(false);
    setBannerMessage('Client Added Successfully!');
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 3000); // Hide banner after 3 seconds
  };

  const handleEditClient = (client) => {
    setCurrentEditClient(client);
    setNewClientName(client.name || '');
    setNewClientDate(client.date || '');
    setNewClientDescription(client.description || '');
    setNewClientCompany(client.company || '');
    setNewClientCompletionDate(client.completionDate || '');
    setShowEditClientModal(true);
  };

  const handleUpdateClient = async () => {
    if (!currentEditClient) return;

    const updatedFields = {};

    if (newClientName && newClientName !== currentEditClient.name) updatedFields.name = newClientName;
    if (newClientDate && new Date(newClientDate).toString() !== 'Invalid Date') updatedFields.date = new Date(newClientDate).toISOString();
    if (newClientDescription && newClientDescription !== currentEditClient.description) updatedFields.description = newClientDescription;
    if (newClientCompany && newClientCompany !== currentEditClient.company) updatedFields.company = newClientCompany;
    if (newClientCompletionDate && new Date(newClientCompletionDate).toString() !== 'Invalid Date') updatedFields.completionDate = new Date(newClientCompletionDate).toISOString();

    const clientDoc = doc(firestore, 'clients', currentEditClient.id);
    await updateDoc(clientDoc, updatedFields);

    setShowEditClientModal(false);
    setCurrentEditClient(null);
    setBannerMessage('Client Updated Successfully!');
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 3000); // Hide banner after 3 seconds
  };

  const handleAddUpdate = (clientId) => {
    setCurrentClientId(clientId);
    setShowAddUpdateModal(true);
  };

  const saveUpdate = async (newUpdate) => {
    await addDoc(collection(firestore, 'updates'), {
      ...newUpdate,
      date: new Date().toISOString(), // Ensure date is saved as an ISO string
    });
    setShowAddUpdateModal(false);
    setCurrentClientId(null);
    setBannerMessage('Update Submitted Successfully!');
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 3000); // Hide banner after 3 seconds
  };

  const handleClientClick = (clientId) => {
    setSelectedClientId(clientId);
    setShowClientViewModal(true);
  };

  const handleCompleteClient = async (clientId) => {
    const clientDoc = doc(firestore, 'clients', clientId);
    await updateDoc(clientDoc, { completed: true });
  };

  const inProgressClients = clients.filter(client => !client.completed).sort((a, b) => new Date(b.date) - new Date(a.date));

  const getLastUpdateDate = (clientId) => {
    const clientUpdates = updates.filter(update => update.clientId === clientId);
    if (clientUpdates.length === 0) return new Date(0);
    return new Date(clientUpdates[clientUpdates.length - 1].date);
  };

  const priorityClients = inProgressClients.slice().sort((a, b) => {
    return getLastUpdateDate(a.id) - getLastUpdateDate(b.id);
  });

  console.log('Priority Clients:', priorityClients);

  return (
    <Container fluid className={`dashboard-container ${showAddClientModal || showAddUpdateModal || showClientViewModal ? 'modal-open' : ''}`}>
      <Row className="align-items-center justify-content-between mb-3">
        <Col>
          <h1 className="mb-0 main-head">Projects Hub</h1>
        </Col>
        <Col className="text-end">
          <Button variant="secondary" className="add-client-label" onClick={() => setShowAddClientModal(true)}>
            Add Client
          </Button>
        </Col>
      </Row>
      <Row className="dashboard-row">
        <Col className="dashboard-column">
          <h2 className="dash-head">In Progress Projects</h2>
          <hr className="divider"/>
          <div className="scrollable-content">
            {inProgressClients.length === 0 ? (
              <p>No clients in progress</p>
            ) : (
              <ClientList 
                clients={inProgressClients.map(client => ({
                  ...client,
                  url: `${window.location.origin}/client/${client.id}`
                }))}
                onClientClick={handleClientClick}
                onAddUpdate={handleAddUpdate} 
                onCompleteClient={handleCompleteClient}
                onEditClient={handleEditClient}
              />
            )}
          </div>
        </Col>
        <Col className="dashboard-column">
          <h2 className="dash-head">Priority Updates</h2>
          <hr className="divider"/>
          <div className="scrollable-content">
            {priorityClients.length === 0 ? (
              <p>No clients in progress</p>
            ) : (
              <Row>
                <Col>
                  <ClientList 
                    clients={priorityClients.map(client => ({
                      ...client,
                      url: `${window.location.origin}/client/${client.id}`
                    }))}
                    onClientClick={handleClientClick}
                    onAddUpdate={handleAddUpdate} 
                    onEditClient={handleEditClient}
                  />
                </Col>
              </Row>
            )}
          </div>
        </Col>
      </Row>

      {/* Add Client Modal */}
      <Modal show={showAddClientModal} onHide={() => setShowAddClientModal(false)} className="modal-card modal-card-large">
        <Modal.Header closeButton>
          <Modal.Title>Add Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col>
                <Form.Group controlId="formClientName">
                  <Form.Label className="text-black">Client Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    className="custom-input"
                    placeholder=""
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={6}>
                <Form.Group controlId="formClientDate">
                  <Form.Label className="text-black">Client Date</Form.Label>
                  <Form.Control
                    type="date"
                    className="custom-input"
                    value={newClientDate}
                    onChange={(e) => setNewClientDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formClientCompany">
                  <Form.Label className="text-black">Client Company Name</Form.Label>
                  <Form.Control
                    type="text"
                    className="custom-input"
                    placeholder=""
                    value={newClientCompany}
                    onChange={(e) => setNewClientCompany(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col>
                <Form.Group controlId="formClientCompletionDate">
                  <Form.Label className="text-black">Projected Completion Date</Form.Label>
                  <Form.Control
                    type="date"
                    className="custom-input"
                    value={newClientCompletionDate}
                    onChange={(e) => setNewClientCompletionDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col>
                <Form.Group controlId="formClientDescription">
                  <Form.Label className="text-black">Client Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    className="custom-input"
                    placeholder=""
                    value={newClientDescription}
                    onChange={(e) => setNewClientDescription(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleAddClient}>Save Changes</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Client Modal */}
      <Modal show={showEditClientModal} onHide={() => setShowEditClientModal(false)} className="modal-card modal-card-large">
        <Modal.Header closeButton>
          <Modal.Title>Edit Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col>
                <Form.Group controlId="formClientName">
                  <Form.Label className="text-black">Client Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    className="custom-input"
                    placeholder=""
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={6}>
                <Form.Group controlId="formClientDate">
                  <Form.Label className="text-black">Client Date</Form.Label>
                  <Form.Control
                    type="date"
                    className="custom-input"
                    value={newClientDate}
                    onChange={(e) => setNewClientDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formClientCompany">
                  <Form.Label className="text-black">Client Company Name</Form.Label>
                  <Form.Control
                    type="text"
                    className="custom-input"
                    placeholder=""
                    value={newClientCompany}
                    onChange={(e) => setNewClientCompany(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col>
                <Form.Group controlId="formClientCompletionDate">
                  <Form.Label className="text-black">Projected Completion Date</Form.Label>
                  <Form.Control
                    type="date"
                    className="custom-input"
                    value={newClientCompletionDate}
                    onChange={(e) => setNewClientCompletionDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col>
                <Form.Group controlId="formClientDescription">
                  <Form.Label className="text-black">Client Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    className="custom-input"
                    placeholder=""
                    value={newClientDescription}
                    onChange={(e) => setNewClientDescription(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleUpdateClient}>Save Changes</Button>
        </Modal.Footer>
      </Modal>

      {/* Add Update Modal */}
      <Modal show={showAddUpdateModal} onHide={() => setShowAddUpdateModal(false)} className="modal-card">
        <Modal.Header closeButton>
          <Modal.Title>Add Update</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddUpdate onAdd={saveUpdate} clientId={currentClientId} />
        </Modal.Body>
      </Modal>

      {/* Client View Modal */}
      <ClientMiniatureView 
        clientId={selectedClientId} 
        show={showClientViewModal} 
        handleClose={() => setShowClientViewModal(false)} 
      />

      {/* Custom Banner */}
      {showBanner && (
        <div className="custom-banner">
          {bannerMessage}
        </div>
      )}
    </Container>
  );
};

export default DashboardPage;
