import React from 'react';

interface AuthButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

const AuthButton: React.FC<AuthButtonProps> = ({ children, onClick }) => {
  return (
    <button onClick={onClick}>
      {children}
    </button>
  );
};

export default AuthButton;