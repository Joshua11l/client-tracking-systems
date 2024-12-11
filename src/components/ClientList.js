import React, { useState } from 'react';
import { ListGroup, Card, Modal, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { firestore } from '../firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import '../styles/client-card.css';

const ClientList = ({ clients, onAddUpdate, onClientClick, onEditClient }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  const handleDeleteClient = async () => {
    if (clientToDelete) {
      await deleteDoc(doc(firestore, 'clients', clientToDelete.id));
      setShowDeleteModal(false);
      setClientToDelete(null);
    }
  };

  return (
    <>
      <ListGroup>
        {clients.map((client) => (
          <ListGroup.Item key={client.id} className="p-0">
            <Card className="mb-3 border border-dark" onClick={() => onClientClick(client.id)}>
              <Card.Body>
                <Card.Title className="h4 client-name">
                  {client.name}
                </Card.Title>
                <hr />
                <Card.Text className='client-date'><strong>Date:</strong> {new Date(client.date).toLocaleDateString()}</Card.Text>
                <Card.Text className='client-desc'><strong>Company:</strong> {client.company}</Card.Text>
                <Card.Text className='client-date'><strong>Projected Completion Date:</strong> {new Date(client.completionDate).toLocaleDateString()}</Card.Text>
                <Card.Text className='url-client'><a href={client.url} target="_blank" rel="noopener noreferrer">Client URL</a></Card.Text>
                <div className="status-container">
                  <span className={`status-label ${client.completed ? 'completed' : 'in-progress'}`}>
                    {client.completed ? 'Completed' : 'In Progress'}
                  </span>
                </div>
                <hr className="icons-divider"/>
                <div className="text-end">
                  <FontAwesomeIcon 
                    icon={faPencilAlt} 
                    className="me-3 icon-action black-icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditClient(client);
                    }} 
                  />
                  <FontAwesomeIcon 
                    icon={faEdit} 
                    className="me-3 icon-action black-icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddUpdate(client.id);
                    }} 
                  />
                  <FontAwesomeIcon 
                    icon={faTrash} 
                    className="icon-action red-icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setClientToDelete(client);
                      setShowDeleteModal(true);
                    }} 
                  />
                </div>
              </Card.Body>
            </Card>
          </ListGroup.Item>
        ))}
      </ListGroup>

      {/* Delete Client Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this client?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteClient}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ClientList;
