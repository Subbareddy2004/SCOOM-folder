import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StudentView() {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  return (
    <div>
      <h2>Student View</h2>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '30%', marginRight: '20px' }}>
          <h3>Available Books</h3>
          <ul>
            {books.map((book) => (
              <li key={book._id}>
                <button onClick={() => setSelectedBook(book)}>{book.name}</button>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ width: '70%' }}>
          {selectedBook && (
            <div>
              <h3>{selectedBook.name}</h3>
              <p>Deployed URL: <a href={selectedBook.deployedUrl} target="_blank" rel="noopener noreferrer">{selectedBook.deployedUrl}</a></p>
              <iframe 
                src={selectedBook.deployedUrl} 
                width="100%" 
                height="600px" 
                title={selectedBook.name}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentView;