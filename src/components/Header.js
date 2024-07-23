import React from 'react';

const Header = ({ onCreateNewCard }) => {
  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">JOTT</h1>
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          onClick={onCreateNewCard}
        >
          Create New Card
        </button>
      </div>
    </header>
  );
};

export default Header;
