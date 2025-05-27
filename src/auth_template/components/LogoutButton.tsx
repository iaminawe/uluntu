import React from 'react';

interface LogoutButtonProps {
  onClick: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onClick }) => {
  return (
    <button onClick={onClick}>
      Logout
    </button>
  );
};

export default LogoutButton;