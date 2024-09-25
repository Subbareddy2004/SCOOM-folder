import React, { useState } from 'react';
import FacultyUpload from './components/FacultyUpload';
import StudentView from './components/StudentView';

function App() {
  const [userType, setUserType] = useState(null);

  return (
    <div className="App">
      <h1>Book Upload and View System</h1>
      {!userType && (
        <div>
          <button onClick={() => setUserType('faculty')}>Faculty</button>
          <button onClick={() => setUserType('student')}>Student</button>
        </div>
      )}
      {userType === 'faculty' && <FacultyUpload />}
      {userType === 'student' && <StudentView />}
    </div>
  );
}

export default App;