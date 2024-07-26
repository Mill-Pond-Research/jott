// src/HomePage.js
import React, { useState, useCallback, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import Card from './Card';
import Deck from './Deck';
import { v4 as uuidv4 } from 'uuid';
import { debounce } from 'lodash';

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

  const addCardToDeck = useCallback((cardId, deckId) => {
    console.log(`Adding card ${cardId} to deck ${deckId}`);
    setDecks(prevDecks =>
      prevDecks.map(deck =>
        deck.id === deckId
          ? { ...deck, cardIds: [...(deck.cardIds || []), cardId] }
          : deck
      )
    );
    setCards(prevCards =>
      prevCards.map(card =>
        card.id === cardId
          ? { ...card, deckIds: [...(card.deckIds || []), deckId] }
          : card
      )
    );
  }, []);

  const getUniqueNewCardTitle = (existingCards) => {
    let newCardNumber = 0;
    let newCardTitle = "New Card";

    while (existingCards.some(card => card.title === newCardTitle)) {
      newCardNumber++;
      newCardTitle = `New Card ${newCardNumber}`;
    }

    return newCardTitle;
  };

  const createNewCard = useCallback(() => {
    const newCardTitle = getUniqueNewCardTitle(cards);
    const newCard = {
      id: uuidv4(),
      title: newCardTitle,
      content: '',
      createdAt: new Date().toISOString(),
    };
    setCards(prevCards => [...prevCards, newCard]);
  }, [cards]);

  const createNewDeck = useCallback(() => {
    const newDeckTitle = getUniqueNewDeckTitle(decks);
    const newDeck = {
      id: uuidv4(),
      name: newDeckTitle,
      cards: [],
      createdAt: new Date().toISOString(),
    };
    setDecks(prevDecks => [...prevDecks, newDeck]);
  }, [decks]);
  
  const getUniqueNewDeckTitle = (existingDecks) => {
    let newDeckNumber = 0;
    let newDeckTitle = "New Deck";
  
    while (existingDecks.some(deck => deck.name === newDeckTitle)) {
      newDeckNumber++;
      newDeckTitle = `New Deck ${newDeckNumber}`;
    }
  
    return newDeckTitle;
  };

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
    (typeof deck.name === 'string' && deck.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (Array.isArray(deck.cards) && deck.cards.some(cardId => {
      const card = cards.find(c => c.id === cardId);
      return card && (
        (typeof card.title === 'string' && card.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (typeof card.content === 'string' && card.content.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }))
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
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header onCreateNewCard={createNewCard} onCreateNewDeck={createNewDeck} onSearch={handleSearchChange} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Welcome to JOTT</h1>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCards.filter(card => !card.deckId).map((card) => (
                <Card
                  key={card.id}
                  {...card}
                  decks={decks}
                  onUpdate={updateCardContent}
                  onDelete={onDelete}
                  addCardToDeck={addCardToDeck}
                />
              ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Decks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDecks.map((deck) => (
              <Deck
                key={deck.id}
                {...deck}
                onUpdate={updateDeckName}
                onDelete={handleDeleteDeck}
                cards={cards.filter(card => card.deckId === deck.id)}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;