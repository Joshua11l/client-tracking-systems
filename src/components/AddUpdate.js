import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { storage } from '../firebase'; // Import the storage object
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../firebase';
import './css-folder/AddUpdate.css';

const AddUpdate = ({ onAdd, clientId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const fileType = selectedFile.type.split('/')[0];

    if (fileType !== 'image') {
      setError('Only image files are allowed');
      setFile(null);
    } else {
      setError('');
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description) {
      setError('Title and Description are required');
      return;
    }

    let uploadedFileUrl = '';
    if (file) {
      const user = auth.currentUser;
      if (!user) {
        console.error("User is not authenticated");
        return;
      }
      const storageRef = ref(storage, `updates/${file.name}`);
      try {
        await uploadBytes(storageRef, file);
        uploadedFileUrl = await getDownloadURL(storageRef);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    const newUpdate = {
      title,
      description,
      clientId,
      fileUrl: uploadedFileUrl,
      date: new Date(),
      completed: false,
      comments: []
    };

    onAdd(newUpdate);
    setTitle('');
    setDescription('');
    setFile(null);
  };

  return (
    <div>
      <Form onSubmit={handleSubmit} style={{ padding: '20px' }}>
        <Form.Group controlId="formTitle" className="mt-3">
          <Form.Label className='update-title' style={{ color: 'black', fontWeight: 'bold', fontSize: 'large' }}>Update Title:</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ outline: '2px solid #ced4da' }}
          />
        </Form.Group>
        <Form.Group controlId="formDescription" className="mt-3">
          <Form.Label style={{ color: 'black', fontWeight: 'bold', fontSize: 'large' }}>Update Description:</Form.Label>
          <Form.Control
            as="textarea"
            rows={5} // Adjusted to make the description box larger
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ outline: '2px solid #ced4da' }}
          />
        </Form.Group>
        <Form.Group controlId="formFile" className="mt-3">
          <Form.Label style={{ color: 'black', fontWeight: 'bold', fontSize: 'large' }}>Update Image:</Form.Label>
          <Form.Control
            type="file"
            onChange={handleFileChange}
            style={{ outline: '2px solid #ced4da' }}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </Form.Group>
        <div className="text-center mt-3">
          <Button style={{ fontWeight: 'bold' }} variant="primary" type="submit">
            Add Update
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddUpdate;
