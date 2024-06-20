import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert, Modal, Button, Form, Card } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { firestore } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../components/css-folder/ClientView.css';  // Import the CSS file
import logo from '../logo.PNG'; // Make sure to update the path to your logo file
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Footer from './Footer'; // Import the Footer component

const localizer = momentLocalizer(moment);

const ClientView = () => {
  const { clientId } = useParams();
  const [clientName, setClientName] = useState('');
  const [newUpdates, setNewUpdates] = useState([]);
  const [pastUpdates, setPastUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showAllModal, setShowAllModal] = useState(false);
  const [clientStatus, setClientStatus] = useState('In Progress');
  const [snackBarMessage, setSnackBarMessage] = useState(null);
  const [showSnackBar, setShowSnackBar] = useState(false);

  const convertToDate = (date) => {
    if (!date) return new Date();
    if (date.toDate) return date.toDate();
    return new Date(date);
  };

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const clientDoc = await getDoc(doc(firestore, 'clients', clientId));
        if (clientDoc.exists()) {
          const clientData = clientDoc.data();
          setClientName(clientData.name);
          setClientStatus(clientData.completed ? 'Completed' : 'In Progress');
        } else {
          setError('Client not found.');
        }
      } catch (err) {
        console.error("Error fetching client details:", err);
        setError('Failed to fetch client details.');
      }
    };

    if (clientId) {
      fetchClientDetails();
      const updatesCollection = collection(firestore, 'updates');
      const q = query(updatesCollection, where('clientId', '==', clientId), orderBy('date', 'asc'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const newUpdates = [];
        const pastUpdates = [];

        querySnapshot.docs.forEach((doc, index) => {
          const data = doc.data();
          data.id = doc.id;
          data.index = index + 1;  // Add an index for numbering

          if (data.completed) {
            pastUpdates.push(data);
          } else {
            newUpdates.push(data);
          }
        });

        setNewUpdates(newUpdates);
        setPastUpdates(pastUpdates);
        setLoading(false);
      }, (err) => {
        console.error("Error fetching updates:", err);
        setError('Failed to fetch updates.');
        setLoading(false);
      });

      const clientDocRef = doc(firestore, 'clients', clientId);
      const unsubscribeClient = onSnapshot(clientDocRef, (doc) => {
        if (doc.exists()) {
          const clientData = doc.data();
          setClientName(clientData.name);
          setClientStatus(clientData.completed ? 'Completed' : 'In Progress');
        } else {
          setError('Client not found.');
        }
      });

      return () => {
        unsubscribe();
        unsubscribeClient();
      };
    }
  }, [clientId]);

  const handleUpdateClick = async (update) => {
    setSelectedUpdate(update);
    setShowModal(true);
    if (!update.completed) {
      await updateDoc(doc(firestore, 'updates', update.id), { completed: true });
      setNewUpdates(newUpdates.filter(u => u.id !== update.id));
      setPastUpdates([update, ...pastUpdates]);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUpdate(null);
    if (selectedUpdate && !selectedUpdate.completed) {
      setSnackBarMessage('Update moved to past updates.');
      setShowSnackBar(true);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (selectedUpdate) {
      const updateRef = doc(firestore, 'updates', selectedUpdate.id);
      const updatedComments = [...selectedUpdate.comments, newComment];
      await updateDoc(updateRef, { comments: updatedComments });
      setSelectedUpdate({ ...selectedUpdate, comments: updatedComments });
      setNewComment('');
      setSnackBarMessage('Comment added successfully.');
      setShowSnackBar(true);
    }
  };

  const handleShowAllUpdates = () => {
    setShowAllModal(true);
  };

  const handleCloseAllModal = () => {
    setShowAllModal(false);
  };

  useEffect(() => {
    if (showSnackBar) {
      const timer = setTimeout(() => setShowSnackBar(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSnackBar]);

  if (loading) {
    return (
      <Container className="container-custom text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="container-custom">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const events = [...newUpdates, ...pastUpdates].map(update => {
    const date = convertToDate(update.date);
    return {
      id: update.id,
      title: `Update ${update.index}`,
      start: date,
      end: date,
      allDay: false,
      time: moment(date).format('LT') // Custom property for the formatted time
    };
  });

  return (
    <Container fluid className="container-custom" style={{ padding: 0 }}>
      <header className="text-center p-3 mb-4 jumbo" style={{ backgroundColor: 'black', color: 'white', height: '20vh', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', position: 'absolute', top: 0 }}>
        <img src={logo} alt="Divine Software Systems Logo" className="me-3" style={{ height: '60px' }} />
        <span style={{ fontSize: '3rem', fontWeight: 'bold' }} className='top-head'>Divine Software Systems</span>
      </header>
      <Container>
        <Row className='might-work'>
          <Col>
            <h1 style={{ marginTop: '25vh', fontWeight: 'bold' }} className='might-work'>
              <span style={{ color: 'black' }}>Project Progress: </span>
              <span style={{ color: 'rgb(0, 137, 242)', }} >{clientName ? clientName : `Client ${clientId}`}</span>
            </h1>
          </Col>
          <Col xs="auto">
            <Card className='client-status'
              style={{
                backgroundColor: clientStatus === 'In Progress' ? 'rgb(0, 137, 242)' : 'Green',
                marginTop: '25vh',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <Card.Body>
                <Card.Text style={{ margin: 0, fontWeight: 'bold' }}>{clientStatus}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={6} className="mb-4 mb-md-0">
            <h2 className='client-head'>New Updates</h2>
            <div className="update-list" style={{ maxHeight: '30vh', overflowY: 'auto' }}>
              {newUpdates.length > 0 ? (
                newUpdates.map(update => (
                  <Alert
                    key={update.id}
                    variant="primary"
                    className="update-alert"
                    style={{ backgroundColor: '#b3e5fc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}  // Light blue background
                    onClick={() => handleUpdateClick(update)}
                  >
                    <div>
                      <strong>Update {update.index}:</strong> {update.title}
                    </div>
                    <div>{convertToDate(update.date).toLocaleString()}</div>
                  </Alert>
                ))
              ) : (
                <Alert variant="info">No new updates available for this client.</Alert>
              )}
            </div>
            <h2 className='client-head'>Past Updates</h2>
            <div className="update-list" style={{ maxHeight: '30vh', overflowY: 'auto' }}>
              {pastUpdates.length > 0 ? (
                pastUpdates.map(update => (
                  <Alert
                    key={update.id}
                    variant="secondary"
                    className="update-alert"
                    style={{ backgroundColor: '#d4edda', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}  // Green background
                    onClick={() => handleUpdateClick(update)}
                  >
                    <div>
                      <strong>Update {update.index}:</strong> {update.title}
                    </div>
                    <div>{convertToDate(update.date).toLocaleString()}</div>
                  </Alert>
                ))
              ) : (
                <Alert variant="info">No past updates available for this client.</Alert>
              )}
            </div>
            <div className="d-flex justify-content-center mt-3">
              <Button variant="link" classname='see-all' onClick={handleShowAllUpdates} style={{ color: 'black',   fontSize: '1.3rem' }}>
                See All <FontAwesomeIcon icon={faArrowRight} />
              </Button>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <h2 className='client-head'>Update Calendar</h2>
            <div style={{ height: '60vh', overflowY: 'auto' }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%', backgroundColor: 'white' }}
                defaultView="agenda"
                views={['agenda']}
                showMultiDayTimes={false}
                eventPropGetter={() => ({ style: { cursor: 'default', fontWeight: 300, fontSize: 'medium', backgroundColor: 'white', marginTop: '10px',} })}
                components={{
                  event: ({ event }) => (
                    <span>
                      <strong>{event.title || 'No title'}</strong>
                    </span>
                  ),
                  time: ({ event }) => (
                    <span>
                      {event.time}
                    </span>
                  ),
                  timeGutterHeader: () => null,
                  timeGutter: () => null,
                }}
                selectable={false}
              />
            </div>
          </Col>
        </Row>
      </Container>

      {selectedUpdate && (
        <Modal
          show={showModal}
          onHide={handleCloseModal}
          className="modal-custom"
          dialogClassName="modal-90w"
          style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
          aria-labelledby="example-custom-modal-styling-title"
        >
          <Modal.Header closeButton>
            <Modal.Title>{selectedUpdate.title} <span className="text-muted" style={{ fontSize: '0.75em' }}>({convertToDate(selectedUpdate.date).toLocaleString()})</span></Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body-custom">
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Update Description:</Card.Title>
                <Card.Text>{selectedUpdate.description}</Card.Text>
              </Card.Body>
            </Card>
            {selectedUpdate.fileUrl && (
              <img src={selectedUpdate.fileUrl} alt="Update" className="img-fluid img-fluid-custom mb-3" />
            )}
            <h5>Comments</h5>
            {selectedUpdate.comments && selectedUpdate.comments.length > 0 ? (
              <div className="comment-list">
                {selectedUpdate.comments.map((comment, index) => (
                  <Card key={index} className="mb-2" style={{ backgroundColor: '#b3e5fc' }}>
                    <Card.Body>
                      <Card.Text>{comment}</Card.Text>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert variant="info">No comments yet.</Alert>
            )}
            <Form onSubmit={handleCommentSubmit}>
              <Form.Group controlId="formComment">
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </Form.Group>
              <div className="d-flex justify-content-center">
                <Button variant="primary" type="submit" className="mt-3">
                  Submit
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}

      {showAllModal && (
        <Modal
          show={showAllModal}
          onHide={handleCloseAllModal}
          size="lg"
          className="modal-custom"
          style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
        >
          <Modal.Header closeButton>
            <Modal.Title className='modal-head1'>All Updates</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {[...newUpdates, ...pastUpdates].map(update => (
              <Card key={update.id} onClick={() => handleUpdateClick(update)} style={{ marginBottom: '10px', cursor: 'pointer' }}>
                <Card.Body>
                  <Card.Title>{update.title}</Card.Title>
                  <Card.Text>{convertToDate(update.date).toLocaleString()}</Card.Text>
                </Card.Body>
              </Card>
            ))}
          </Modal.Body>
        </Modal>
      )}

      {showSnackBar && snackBarMessage && (
        <Alert
          variant="success"
          onClose={() => setShowSnackBar(false)}
          dismissible
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1050,
          }}
        >
          {snackBarMessage}
        </Alert>
      )}

      <Footer /> {/* Add the Footer component here */}
    </Container>
  );
};

export default ClientView;
