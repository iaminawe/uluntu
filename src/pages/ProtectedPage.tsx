import React from 'react';

const ProtectedPage: React.FC = () => {
  return (
    <div>
      <h1>Protected Page</h1>
      <p>This content is only visible to authenticated users.</p>
    </div>
  );
};

export default ProtectedPage;