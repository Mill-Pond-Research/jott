// src/HomePage.js
import React, { useState, useCallback, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Header from './Header';
import Footer from './Footer';
import Card from './Card';
import Deck from './Deck';
import { v4 as uuidv4 } from 'uuid';
import { debounce } from 'lodash';

const ItemTypes = {
  CARD: 'card',
  DECK: 'deck',
};

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
    <div ref={(node) => drag(drop(node))} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card {...card} onUpdate={onUpdate} onDelete={onDelete} />
    </div>
  );
};

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
    <div ref={(node) => drag(drop(node))} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Deck {...deck} cards={cards} onUpdate={onUpdate} onDelete={onDelete} />
    </div>
  );
};

const HomePage = () => {
  const [cards, setCards] = useState([]);
  const [decks, setDecks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const onDelete = useCallback((cardId) => {
    setCards(prevCards => prevCards.filter(card => card.id !== cardId));
  }, []);

  useEffect(() => {
    const loadedCards = JSON.parse(localStorage.getItem('jott_cards')) || [];
    const loadedDecks = JSON.parse(localStorage.getItem('jott_decks')) || [];
    setCards(loadedCards);
    setDecks(loadedDecks);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('jott_cards', JSON.stringify(cards));
      localStorage.setItem('jott_decks', JSON.stringify(decks));
    }
  }, [cards, decks, isLoading]);

  const moveCard = useCallback((dragIndex, hoverIndex) => {
    setCards((prevCards) => {
      const newCards = [...prevCards];
      const draggedCard = newCards[dragIndex];
      newCards.splice(dragIndex, 1);
      newCards.splice(hoverIndex, 0, draggedCard);
      return newCards;
    });
  }, []);

  const moveDeck = useCallback((dragIndex, hoverIndex) => {
    setDecks((prevDecks) => {
      const newDecks = [...prevDecks];
      const draggedDeck = newDecks[dragIndex];
      newDecks.splice(dragIndex, 1);
      newDecks.splice(hoverIndex, 0, draggedDeck);
      return newDecks;
    });
  }, []);

  const moveCardToDeck = useCallback((cardId, newDeckId) => {
    setCards(prevCards => prevCards.map(card => 
      card.id === cardId ? { ...card, deckId: newDeckId } : card
    ));
    setDecks(prevDecks => prevDecks.map(deck => {
      if (deck.id === newDeckId) {
        return { ...deck, cards: [...deck.cards, cardId] };
      } else {
        return { ...deck, cards: deck.cards.filter(id => id !== cardId) };
      }
    }));
  }, []);

  const createNewCard = useCallback(() => {
    const newCard = {
      id: uuidv4(),
      title: 'New Card',
      content: '',
      createdAt: new Date().toISOString(),
    };
    setCards(prevCards => [...prevCards, newCard]);
  }, []);

  const createNewDeck = useCallback(() => {
    const newDeck = {
      id: uuidv4(),
      name: 'New Deck',
      cards: [],
      createdAt: new Date().toISOString(),
    };
    setDecks(prevDecks => [...prevDecks, newDeck]);
  }, []);

  const updateCardContent = useCallback((cardId, newContent) => {
    setCards(prevCards =>
      prevCards.map(card =>
        card.id === cardId ? { ...card, content: newContent, updatedAt: new Date().toISOString() } : card
      )
    );
  }, []);

  const updateDeckName = useCallback((deckId, newName) => {
    setDecks(prevDecks =>
      prevDecks.map(deck =>
        deck.id === deckId ? { ...deck, name: newName, updatedAt: new Date().toISOString() } : deck
      )
    );
  }, []);

  const debouncedSearch = useCallback(
    debounce((term) => {
      setSearchTerm(term);
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const filteredCards = cards.filter(card =>
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDecks = decks.filter(deck =>
    deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deck.cards.some(cardId => {
      const card = cards.find(c => c.id === cardId);
      return card && (card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.content.toLowerCase().includes(searchTerm.toLowerCase()));
    })
  );

  const handleDeleteDeck = useCallback((deckId) => {
    setDecks(prevDecks => prevDecks.filter(deck => deck.id !== deckId));
    setCards(prevCards => prevCards.map(card => 
      card.deckId === deckId ? { ...card, deckId: null } : card
    ));
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header onCreateNewCard={createNewCard} onSearch={handleSearchChange} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Welcome to JOTT</h1>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCards.filter(card => !card.deckId).map((card, index) => (
                <DraggableCard
                  key={card.id}
                  card={card}
                  index={index}
                  moveCard={moveCard}
                  onUpdate={updateCardContent}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Decks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDecks.map((deck, index) => (
                <DraggableDeck
                key={deck.id}
                deck={deck}
                index={index}
                moveDeck={moveDeck}
                onUpdate={updateDeckName}
                onDelete={handleDeleteDeck}
                cards={cards.filter(card => card.deckId === deck.id)}
                moveCardToDeck={moveCardToDeck}  // Ensure this line is present
              />
              ))}
            </div>
          </div>
          <button
            className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
            onClick={createNewDeck}
          >
            Create New Deck
          </button>
        </main>
        <Footer />
      </div>
    </DndProvider>
  );
};

export default HomePage;