import React, { useState, useRef, useEffect } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Deck = ({ id, name, cards, onUpdate, onDelete }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [deckName, setDeckName] = useState(name);
  const titleInputRef = useRef(null);

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleChange = (e) => {
    setDeckName(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (deckName.trim() !== name) {
      onUpdate(id, deckName.trim());
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setDeckName(name);
    }
  };

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this deck?')) {
      onDelete(id);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-2 flex justify-end items-center">
        <button
          onClick={handleDelete}
          className="text-white hover:text-red-500 transition-colors duration-200"
        >
          <FiTrash2 size={24} />
        </button>
      </div>
      <div className="p-4">
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={deckName}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="text-xl font-semibold mb-4 w-full border-b-2 border-blue-500 focus:outline-none focus:border-blue-700"
          />
        ) : (
          <h3 
            className="text-xl font-semibold mb-4 cursor-pointer hover:text-blue-600 transition-colors duration-200"
            onClick={handleTitleClick}
          >
            {deckName}
          </h3>
        )}
        <p className="text-gray-600">{cards.length} cards</p>
        <Link to={`/deck/${id}`}>
          <button className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Open Deck
          </button>
        </Link>
      </div>
    </div>
  );
};

function DeckItem({ deck }) {
  return (
    <li>
      <h3>{deck.name}</h3>
      <p>Cards: {deck.cards.length}</p>
      <Link to={`/deck/${deck.id}`}>
        <button>Open Deck</button>
      </Link>
    </li>
  );
}

export default Deck;