import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Modal, Form, Table, InputGroup, Card, Accordion, Spinner, Alert } from 'react-bootstrap';
import ClientList from './ClientList';
import { firestore } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, getDocs, where } from 'firebase/firestore';
import AddUpdate from './AddUpdate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faFilter, faSearch } from '@fortawesome/free-solid-svg-icons';
import '../styles/DashboardPage.css';

const DashboardPage = () => {
  const [clients, setClients] = useState([]);
  const [updates, setUpdates] = useState([]);

  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [showAddUpdateModal, setShowAddUpdateModal] = useState(false);

  const [newClientName, setNewClientName] = useState('');
  const [newClientDate, setNewClientDate] = useState('');
  const [newClientDescription, setNewClientDescription] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientCompletionDate, setNewClientCompletionDate] = useState('');

  const [currentClientId, setCurrentClientId] = useState(null);
  const [currentEditClient, setCurrentEditClient] = useState(null);

  const [bannerMessage, setBannerMessage] = useState('');
  const [showBanner, setShowBanner] = useState(false);

  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedClientUpdates, setSelectedClientUpdates] = useState([]);
  const [loadingUpdates, setLoadingUpdates] = useState(false);

  // Search and sorting states for In Progress clients
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('default'); // 'default' or 'az'

  useEffect(() => {
    const clientsCollection = collection(firestore, 'clients');
    const q = query(clientsCollection, orderBy('date', 'desc'));

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

  useEffect(() => {
    const fetchSelectedClientUpdates = async () => {
      if (selectedClientId) {
        setLoadingUpdates(true);
        try {
          const updatesQuery = query(
            collection(firestore, 'updates'),
            where('clientId', '==', selectedClientId),
            orderBy('date', 'asc')
          );
          const updatesSnapshot = await getDocs(updatesQuery);
          const clientUpdates = updatesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
          setSelectedClientUpdates(clientUpdates);
        } catch (error) {
          console.error('Error fetching client updates:', error);
          setSelectedClientUpdates([]);
        }
        setLoadingUpdates(false);
      } else {
        setSelectedClientUpdates([]);
      }
    };

    fetchSelectedClientUpdates();
  }, [selectedClientId]);

  const handleAddClient = async () => {
    if (!newClientName || !newClientDate || !newClientDescription || !newClientCompany || !newClientCompletionDate) {
      alert('Please fill out all fields');
      return;
    }

    const newClientId = newClientName.replace(/\s+/g, '-').toLowerCase();
    await addDoc(collection(firestore, 'clients'), {
      name: newClientName,
      date: new Date(newClientDate).toISOString(),
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
    showTempBanner('Client Added Successfully!');
  };

  const handleEditClient = (client) => {
    setCurrentEditClient(client);
    setNewClientName(client.name || '');
    setNewClientDate(client.date ? new Date(client.date).toISOString().split('T')[0] : '');
    setNewClientDescription(client.description || '');
    setNewClientCompany(client.company || '');
    setNewClientCompletionDate(client.completionDate ? new Date(client.completionDate).toISOString().split('T')[0] : '');
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

    const clientDocRef = doc(firestore, 'clients', currentEditClient.id);
    await updateDoc(clientDocRef, updatedFields);

    setShowEditClientModal(false);
    setCurrentEditClient(null);
    showTempBanner('Client Updated Successfully!');
  };

  const handleAddUpdate = (clientId) => {
    setCurrentClientId(clientId);
    setShowAddUpdateModal(true);
  };

  const saveUpdate = async (newUpdate) => {
    await addDoc(collection(firestore, 'updates'), {
      ...newUpdate,
      date: new Date().toISOString(),
    });
    setShowAddUpdateModal(false);
    setCurrentClientId(null);
    showTempBanner('Update Submitted Successfully!');
  };

  const handleClientClick = (clientId) => {
    setSelectedClientId(clientId);
  };

  const handleCompleteClient = async (clientId) => {
    const clientDocRef = doc(firestore, 'clients', clientId);
    await updateDoc(clientDocRef, { completed: true });
    showTempBanner('Client Marked as Completed!');
  };

  const showTempBanner = (message) => {
    setBannerMessage(message);
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 3000);
  };

  const inProgressClients = clients.filter(client => !client.completed);
  const completedClients = clients.filter(client => client.completed);

  // Search filter for in-progress clients
  const filteredInProgress = inProgressClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort the filtered in-progress clients
  const sortedInProgress = [...filteredInProgress].sort((a, b) => {
    if (sortOrder === 'az') {
      return a.name.localeCompare(b.name);
    } else {
      return 0;
    }
  });

  // Get selected client details
  const selectedClient = selectedClientId ? clients.find(c => c.id === selectedClientId) : null;

  const getClientLastUpdateTime = (clientId) => {
    const clientUpdates = updates.filter(u => u.clientId === clientId);
    if (clientUpdates.length === 0) return 'No updates yet';
    const lastUpdate = clientUpdates[clientUpdates.length - 1];
    return new Date(lastUpdate.date).toLocaleString();
  };

  return (
    <Container 
      fluid 
      className={`dashboard-container ${showAddClientModal || showEditClientModal || showAddUpdateModal ? 'modal-open' : ''}`}
      style={{ backgroundColor: '#fafafa' }}
    >
      <Row className="align-items-center justify-content-between mb-3">
        <Col>
          <h1 className="mb-0 main-head" style={{ fontSize: '2rem' }}>Projects Hub</h1>
        </Col>
        <Col className="text-end">
          <Button variant="secondary" className="add-client-label" onClick={() => setShowAddClientModal(true)}>
            Add Client
          </Button>
        </Col>
      </Row>
      <Row className="dashboard-row">
        {/* Left Column: In Progress Clients */}
        <Col 
          md={5} 
          className="dashboard-column" 
          style={{ borderRight: '1px solid #ddd', padding: '20px', overflowY: 'auto' }}
        >
          <h2 className="dash-head" style={{ color: '#004a8f', marginBottom: '20px' }}>In Progress Clients</h2>
          <hr className="divider"/>

          <Row className="mb-3">
            <Col xs={7}>
              <InputGroup>
                <InputGroup.Text><FontAwesomeIcon icon={faSearch} /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col xs={5}>
              <InputGroup>
                <InputGroup.Text><FontAwesomeIcon icon={faFilter} /></InputGroup.Text>
                <Form.Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="default">Sort</option>
                  <option value="az">A-Z</option>
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>

          <div 
            className="scrollable-content" 
            style={{ 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              padding: '10px', 
              overflowY: 'auto', 
              maxHeight: 'calc(100vh - 20px)',
            }}
          >
            {sortedInProgress.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888' }}>No in-progress clients</p>
            ) : (
              <ClientList
                clients={sortedInProgress.map(client => ({
                  ...client,
                  url: `${window.location.origin}/client/${client.id}`
                }))}
                onClientClick={handleClientClick}
                onAddUpdate={handleAddUpdate}
                onEditClient={handleEditClient}
              />
            )}
          </div>
        </Col>

        {/* Right Column: Selected Client Details & Completed Clients */}
        <Col 
          md={7} 
          className="dashboard-column d-flex flex-column" 
          style={{ padding: '20px', overflowY: 'auto'}}
        >
          <h2 className="dash-head" style={{ color: '#004a8f', marginBottom: '10px' }}>Client Details</h2>
          <hr className="divider"/>
          <div className="flex-grow-1" style={{ overflowY: 'auto', marginBottom: '1rem', paddingBottom: '20px' }}>
            {selectedClient ? (
              <Card style={{ border: '1px solid #ccc', padding: '20px', backgroundColor: '#ffffff' }}>
                <h4 style={{ color: '#004a8f', marginBottom: '20px' }}>{selectedClient.name}</h4>
                <Table bordered responsive>
                  <thead style={{ backgroundColor: '#e9f2fa' }}>
                    <tr>
                      <th>Client Name</th>
                      <th>Company</th>
                      {/* Removed "Projected Completion" column */}
                      <th>Last Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{selectedClient.name}</td>
                      <td>{selectedClient.company}</td>
                      {/* Removed the Projected Completion date cell */}
                      <td>{getClientLastUpdateTime(selectedClientId)}</td>
                    </tr>
                  </tbody>
                </Table>
                <div>
                  <strong>Description: </strong>
                  <p>{selectedClient.description}</p>
                </div>

                {/* Accordion for Updates */}
                <div className="updates-section" style={{ marginTop: '20px' }}>
                  <h5>Updates</h5>
                  {loadingUpdates ? (
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  ) : selectedClientUpdates.length === 0 ? (
                    <p>No updates available.</p>
                  ) : (
                    <Accordion>
                      {selectedClientUpdates.map((update, index) => (
                        <Accordion.Item eventKey={index.toString()} key={update.id}>
                          <Accordion.Header>
                            <strong>{update.title}</strong> - {new Date(update.date).toLocaleString()}
                          </Accordion.Header>
                          <Accordion.Body>
                            <p>{update.details}</p>
                            {update.comments && update.comments.length > 0 ? (
                              <div>
                                <h6>Comments:</h6>
                                <ul>
                                  {update.comments.map((comment, idx) => (
                                    <li key={idx}>{comment}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <p>No Comments</p>
                            )}
                          </Accordion.Body>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  )}
                </div>

                {/* Button to Mark as Complete */}
                {!selectedClient.completed && (
                  <Button 
                    variant="success" 
                    style={{ marginTop: '20px' }} 
                    onClick={() => handleCompleteClient(selectedClient.id)}
                  >
                    Mark as Complete
                  </Button>
                )}
              </Card>
            ) : (
              <div style={{ textAlign: 'center', color: '#777' }}>
                <FontAwesomeIcon icon={faInfoCircle} size="3x" style={{ color: '#bbb', marginBottom: '10px' }} />
                <h5 style={{ fontSize: '18px' }}>Select a client from the left to see their details.</h5>
              </div>
            )}

            {/* Completed Clients */}
            <h3 className="dash-head" style={{ color: '#004a8f', marginTop: '30px', marginBottom: '20px' }}>Completed Clients</h3>
            <hr className="divider"/>
            <div 
              className="scrollable-content" 
              style={{ 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                padding: '10px', 
                backgroundColor: '#fff',
                overflowY: 'auto',
                maxHeight: 'calc(100vh - 20px)',
              }}
            >
              {completedClients.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#888' }}>No completed clients</p>
              ) : (
                <Table bordered hover responsive style={{ backgroundColor: '#ffffff' }}>
                  <thead style={{ backgroundColor: '#e9f2fa' }}>
                    <tr>
                      <th>Client Name</th>
                      <th>Company</th>
                      <th>Completion Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedClients.map(client => (
                      <tr key={client.id}>
                        <td>{client.name}</td>
                        <td>{client.company}</td>
                        <td>{new Date(client.completionDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
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
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={6}>
                <Form.Group controlId="formClientDate">
                  <Form.Label className="text-black">Client Start Date</Form.Label>
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
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={6}>
                <Form.Group controlId="formClientDate">
                  <Form.Label className="text-black">Client Start Date</Form.Label>
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

      {/* Banner */}
      {showBanner && (
        <div className="custom-banner">
          {bannerMessage}
        </div>
      )}
    </Container>
  );
};

export default DashboardPage;
