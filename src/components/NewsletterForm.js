import React from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { Form, Button } from 'react-bootstrap';
import '..//components/css-folder/news.css';

function NewsletterForm() {
  const [state, handleSubmit] = useForm("myyrqqag");
  if (state.succeeded) {
      return <p>Thanks for subscribing!</p>;
  }
  return (
    <Form onSubmit={handleSubmit} className="form-add">
      <Form.Group controlId="formEmail" className="mb-2">
        <Form.Control 
          type="email" 
          name="email"
          placeholder="Enter your email" 
          required 
        />
        <ValidationError 
          prefix="Email" 
          field="email"
          errors={state.errors}
        />
      </Form.Group>
      <Button variant="outline-light" type="submit" disabled={state.submitting} className="new-button">
        Subscribe
      </Button>
    </Form>
  );
}

export default NewsletterForm;
