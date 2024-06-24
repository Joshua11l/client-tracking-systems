import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faLinkedin, faYelp } from '@fortawesome/free-brands-svg-icons';
import '../components/css-folder/Footer.css'; // Create and import a CSS file for styling
import NewsletterForm from './NewsletterForm'; // Import the NewsletterForm component

const Footer = () => {
  return (
    <footer className="text-center footer-1 text-white footer">
      <Container>
        <Row className="py-3">
          <Col xs={12} md={4}>
            {/* Social Media Section */}
            <div className="mb-2">
              <a className="btn btn-outline-light btn-sm m-1" href="https://www.facebook.com" role="button">
                <FontAwesomeIcon icon={faFacebook} className="icon-large" />
              </a>
              <a className="btn btn-outline-light btn-sm m-1" href="https://www.instagram.com" role="button">
                <FontAwesomeIcon icon={faInstagram} className="icon-large" />
              </a>
              <a className="btn btn-outline-light btn-sm m-1" href="https://www.linkedin.com" role="button">
                <FontAwesomeIcon icon={faLinkedin} className="icon-large" />
              </a>
              <a className="btn btn-outline-light btn-sm m-1" href="https://www.yelp.com" role="button">
                <FontAwesomeIcon icon={faYelp} className="icon-large" />
              </a>
            </div>
          </Col>

          <Col xs={12} md={4}>
            {/* Newsletter Section */}
            <div className="mb-2">
              <p className="pt-2 mb-0 news-1">
                <strong>Sign Up For Our Newsletter</strong>
              </p>
              <NewsletterForm /> {/* Use the NewsletterForm component here */}
            </div>
          </Col>

          <Col xs={12} md={4}>
            {/* Thank You Section */}
            <div className="mb-2">
              <p className="mb-0 thank-you">Thank you for choosing Divine Software Systems. We look forward to continuing our successful partnership!</p>
              
            </div>
          </Col>
        </Row>

        <hr className="my-0" />

        <div className="text-center footer-bottom py-2">
          © {new Date().getFullYear()} Divine Software Systems. All Rights Reserved.
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
