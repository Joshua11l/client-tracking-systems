import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Button, Pagination, Card } from 'react-bootstrap';
import { firestore } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import '../styles/client-card.css';  // Assuming you have a CSS file for styling

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 9;

  useEffect(() => {
    const fetchClients = async () => {
      const clientsCollection = collection(firestore, 'clients');
      const querySnapshot = await getDocs(clientsCollection);
      setClients(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };
    fetchClients();
  }, []);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const filteredClients = clients
    .filter(client => client.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(client => {
      if (filter === 'all') return true;
      if (filter === 'completed') return client.completed === true;
      if (filter === 'in-progress') return client.completed === false;
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // Pagination logic
  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

  return (
    <Container className="mt-5 ">
      <h1 className='main-head'>Clients Tracker</h1>
      <Form>
        <Form.Group controlId="search">
          <Form.Label className='search-clients'>Search Clients</Form.Label>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Enter client name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <InputGroup.Text>
              <FontAwesomeIcon icon={faSearch} />
            </InputGroup.Text>
          </InputGroup>
        </Form.Group>
      </Form>
      <Row className="mt-3">
        <Col>
          <Button variant="secondary" className="ms-2 client-progress-label2" onClick={() => handleFilterChange('all')}>
            All
          </Button>
          <Button variant="success" className="ms-2 client-progress-label1" onClick={() => handleFilterChange('completed')}>
            Completed
          </Button>
          <Button variant="warning" className="ms-2 client-progress-label " onClick={() => handleFilterChange('in-progress')}>
            In Progress
          </Button>
        </Col>
      </Row>
      <Row className="mt-3">
        {currentClients.map((client) => (
          <Col key={client.id} md={4} className="mb-3">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>{client.name}</Card.Title>
                <Card.Text>
                  <strong>Company:</strong> {client.company}
                </Card.Text>
                <Card.Text>
                  <strong>Status:</strong> <span className={`status-label ${client.completed ? 'completed' : 'in-progress'}`}>{client.completed ? 'Completed' : 'In Progress'}</span>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Row>
        <Col className="d-flex justify-content-end">
          <Pagination>
            <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
            <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Pagination.Item key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>
                {page}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
            <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
          </Pagination>
        </Col>
      </Row>
    </Container>
  );
};

export default ClientsPage;
