import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Card from './Card';

const DeckPage = () => {
  const { id } = useParams();
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const loadedDecks = JSON.parse(localStorage.getItem('jott_decks')) || [];
    const loadedCards = JSON.parse(localStorage.getItem('jott_cards')) || [];
    
    const currentDeck = loadedDecks.find(d => d.id === id);
    if (currentDeck) {
      setDeck(currentDeck);
      const deckCards = loadedCards.filter(card => currentDeck.cardIds?.includes(card.id));
      setCards(deckCards);
    }
  }, [id]);

  const handleCardUpdate = (cardId, updateData) => {
    setCards(prevCards =>
      prevCards.map(card =>
        card.id === cardId ? { ...card, ...updateData } : card
      )
    );
    // Update localStorage
    const allCards = JSON.parse(localStorage.getItem('jott_cards')) || [];
    const updatedAllCards = allCards.map(card =>
      card.id === cardId ? { ...card, ...updateData } : card
    );
    localStorage.setItem('jott_cards', JSON.stringify(updatedAllCards));
  };

  const handleCardDelete = (cardId) => {
    setCards(prevCards => prevCards.filter(card => card.id !== cardId));
    // Update localStorage
    const allCards = JSON.parse(localStorage.getItem('jott_cards')) || [];
    const updatedAllCards = allCards.filter(card => card.id !== cardId);
    localStorage.setItem('jott_cards', JSON.stringify(updatedAllCards));
  };

  if (!deck) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">{deck.name}</h1>
          <Link
            to="/"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            Back to Home
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(card => (
            <Card
              key={card.id}
              {...card}
              onUpdate={(updateData) => handleCardUpdate(card.id, updateData)}
              onDelete={() => handleCardDelete(card.id)}
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DeckPage;