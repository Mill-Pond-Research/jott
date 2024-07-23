import React, { useState, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { FiMove, FiTrash2 } from 'react-icons/fi';

const Deck = ({ id, name, cards, onUpdate, onDelete, moveCardToDeck }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [deckName, setDeckName] = useState(name);
  const titleInputRef = useRef(null);

  const [, drop] = useDrop({
    accept: 'CARD',
    drop: (item) => {
      moveCardToDeck(item.id, id);
    },
  });

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleChange = (e) => {
    setDeckName(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (deckName.trim() !== name) {
      onUpdate(id, { name: deckName.trim() });
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
    <div ref={drop} className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-2 flex justify-between items-center">
        <FiMove className="text-white cursor-move" size={24} />
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
      </div>
    </div>
  );
};

export default Deck;