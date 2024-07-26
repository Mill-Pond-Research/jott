import React from 'react';
import { FiPlus } from 'react-icons/fi';

const Header = ({ onCreateNewCard, onCreateNewDeck, onSearch }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">JOTT</h1>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search..."
            onChange={onSearch}
            className="px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={onCreateNewCard}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out flex items-center"
          >
            <FiPlus className="mr-2" />
            New Card
          </button>
          <button
            onClick={onCreateNewDeck}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out flex items-center"
          >
            <FiPlus className="mr-2" />
            New Deck
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;