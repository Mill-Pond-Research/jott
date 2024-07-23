// DraggableCard.js
import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import Card from './Card';
import { ItemTypes } from '../utils/constants';

const DraggableCard = ({ card, index, moveCard, onUpdate, onDelete }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: { id: card.id, index, type: ItemTypes.CARD },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover(item, monitor) {
      if (!drag) {
        return;
      }
      if (item.index === index) {
        return;
      }
      moveCard(item.index, index);
      item.index = index;
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
      <Card {...card} onUpdate={onUpdate} onDelete={onDelete} />
    </div>
  );
};

export default DraggableCard;
