// src/components/SearchClients.js
import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const SearchClients = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ searchTerm, startDate, endDate });
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      <Form.Group controlId="formSearchTerm">
        <Form.Label>Search by Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter client name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formStartDate" className="mt-3">
        <Form.Label>Start Date</Form.Label>
        <Form.Control
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formEndDate" className="mt-3">
        <Form.Label>End Date</Form.Label>
        <Form.Control
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </Form.Group>
      <Button variant="primary" type="submit" className="mt-3">
        Search
      </Button>
    </Form>
  );
};

export default SearchClients;
