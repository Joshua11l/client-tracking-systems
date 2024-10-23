import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Pagination } from 'react-bootstrap';
import { getDocs, collection } from 'firebase/firestore';
import { firestore } from '../firebase';
import '../styles/TeamMembersPage.css';

const TeamMembersPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 6;

  useEffect(() => {
    const fetchTeamMembers = async () => {
      const querySnapshot = await getDocs(collection(firestore, 'users'));
      const members = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeamMembers(members);
    };

    fetchTeamMembers();
  }, []);

  // Pagination logic
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = teamMembers.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(teamMembers.length / membersPerPage);

  return (
    <Container className="bootdey">
      <Row>
        <Col className="section-title mb-4 pb-2 text-start">
          <h4 className="title mb-4 main-head">Team Members</h4>
        </Col>
      </Row>
      <Row>
        {currentMembers.map(member => (
          <Col key={member.id} lg={4} md={6} className="mt-4 pt-2">
            <div className="team text-center rounded p-3 py-4">
              <img 
                src={member.profileImage || "https://via.placeholder.com/100"} 
                className="img-fluid avatar avatar-medium shadow rounded-circle" 
                alt="" 
                style={{ width: '150px', height: '150px' }} // Ensure square aspect ratio
              />
              <div className="content mt-3">
                <h4 className="title mb-0">{member.name}</h4>
                <small className="text-muted">{member.position || 'Team Member'}</small>
              </div>
            </div>
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

export default TeamMembersPage;
