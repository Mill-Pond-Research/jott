import React, { useState, useCallback } from 'react';
import Deck from './Deck';
import Header from './Header';
import Footer from './Footer';

const DeckManager = () => {
  const [decks, setDecks] = useState([
    { id: 'deck1', name: 'Deck 1', cards: [] },
    { id: 'deck2', name: 'Deck 2', cards: [] },
  ]);

  const createNewCard = () => {
    const newCard = {
      id: `card-${Date.now()}`,
      title: 'New Card',
      content: 'Click to edit this card',
    };

    setDecks(updatedDecks);
  };

  const handleRenameDeck = useCallback((deckId, newName) => {
    setDecks(prevDecks =>
      prevDecks.map(deck =>
        deck.id === deckId ? { ...deck, name: newName, updatedAt: new Date().toISOString() } : deck
      )
    );
  }, []);

  const handleDeleteDeck = useCallback((deckId) => {
    setDecks(prevDecks => {
      const updatedDecks = prevDecks.filter(deck => deck.id !== deckId);
      
      // Remove the deleted deck from all cards
      updatedDecks.forEach(deck => {
        deck.cards = deck.cards.filter(card => !card.deckIds.includes(deckId));
        deck.cards.forEach(card => {
          card.deckIds = card.deckIds.filter(id => id !== deckId);
        });
      });
  
      // Update local storage
      localStorage.setItem('decks', JSON.stringify(updatedDecks));
  
      return updatedDecks;
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onCreateNewCard={createNewCard} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Your Decks</h1>
        <div className="flex flex-wrap -mx-2">
        {decks.map((deck) => (
            <div key={deck.id} className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
              <Deck
                id={deck.id}
                name={deck.name}
                cards={deck.cards}
                onUpdate={handleRenameDeck}
                onDelete={handleDeleteDeck}
              />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DeckManager;