// DraggableDeck.js
import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import Deck from './Deck';
import { ItemTypes } from '../utils/constants';

const DraggableDeck = ({ deck, index, moveDeck, onUpdate, cards, moveCardToDeck, onDelete }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.DECK,
    item: { id: deck.id, index, type: ItemTypes.DECK },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: [ItemTypes.DECK, ItemTypes.CARD],
    hover(item, monitor) {
      if (item.type === ItemTypes.DECK) {
        if (item.index === index) {
          return;
        }
        moveDeck(item.index, index);
        item.index = index;
      }
    },
    drop(item, monitor) {
      if (item.type === ItemTypes.CARD) {
        moveCardToDeck(item.id, deck.id);
      }
    },
  });

  return (
    <div 
      ref={(node) => drag(drop(node))} 
      style={{ 
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        transition: 'opacity 0.2s ease-in-out'
      }}
      className="mb-4"
    >
      <Deck
        {...deck}
        cards={cards}
        onUpdate={onUpdate}
        onDelete={onDelete}
        moveCardToDeck={moveCardToDeck}
      />
    </div>
  );
};

export default DraggableDeck;
