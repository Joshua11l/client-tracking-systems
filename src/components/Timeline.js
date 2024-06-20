import React from 'react';
import { ListGroup } from 'react-bootstrap';

const Timeline = ({ updates }) => {
  return (
    <ListGroup>
      {updates.map((update, index) => (
        <ListGroup.Item key={index}>
          <strong>{new Date(update.date).toLocaleDateString()}:</strong> {update.content}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default Timeline;
