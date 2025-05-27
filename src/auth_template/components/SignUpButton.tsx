import React from 'react';

interface SignUpButtonProps {
  onClick: () => void;
}

const SignUpButton: React.FC<SignUpButtonProps> = ({ onClick }) => {
  return (
    <button onClick={onClick}>
      Sign Up
    </button>
  );
};

export default SignUpButton;