import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { firestore } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const AddClient = ({ onAddClient }) => {
  const [clientName, setClientName] = useState('');
  const [clientDate, setClientDate] = useState('');
  const [clientDescription, setClientDescription] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientName || !clientDate || !clientDescription || !clientCompany) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    setError('');
    const newClient = {
      name: clientName,
      date: clientDate,
      description: clientDescription,
      company: clientCompany,
      completed: false,
      url: `${window.location.origin}/client/${clientName.replace(/\s+/g, '-').toLowerCase()}`
    };
    try {
      const docRef = await addDoc(collection(firestore, 'clients'), newClient);
      onAddClient({ ...newClient, id: docRef.id });
      setClientName('');
      setClientDate('');
      setClientDescription('');
      setClientCompany('');
    } catch (error) {
      console.error("Error adding client: ", error);
      setError('Failed to add client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="formClientName">
        <Form.Label>Client Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter client name"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formClientDate" className="mt-3">
        <Form.Label>Client Date</Form.Label>
        <Form.Control
          type="date"
          value={clientDate}
          onChange={(e) => setClientDate(e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formClientCompany" className="mt-3">
        <Form.Label>Client Company</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter client company"
          value={clientCompany}
          onChange={(e) => setClientCompany(e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formClientDescription" className="mt-3">
        <Form.Label>Client Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Enter client description"
          value={clientDescription}
          onChange={(e) => setClientDescription(e.target.value)}
        />
      </Form.Group>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Button variant="primary" type="submit" className="mt-3" disabled={loading}>
        {loading ? 'Adding...' : 'Add Client'}
      </Button>
    </Form>
  );
};

export default AddClient;
