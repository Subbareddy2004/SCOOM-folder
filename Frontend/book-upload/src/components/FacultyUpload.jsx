import React, { useState } from 'react';
import axios from 'axios';

function FacultyUpload() {
  const [bookName, setBookName] = useState('');
  const [files, setFiles] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('bookName', bookName);
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(`Book folder uploaded and deployed successfully! Deployed URL: ${response.data.deployedUrl}`);
      setBookName('');
      setFiles([]);
    } catch (error) {
      console.error('Error uploading book folder:', error);
      alert('Failed to upload and deploy book folder.');
    }
  };

  return (
    <div>
      <h2>Faculty Upload</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="bookName">Book Name:</label>
          <input
            type="text"
            id="bookName"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="files">Folder Contents:</label>
          <input
            type="file"
            id="files"
            webkitdirectory="true"
            directory="true"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            required
          />
        </div>
        <button type="submit">Upload and Deploy Book Folder</button>
      </form>
    </div>
  );
}

export default FacultyUpload;