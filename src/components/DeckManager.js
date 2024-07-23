import React, { useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
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

    // Add the new card to the first deck (you might want to change this logic)
    const updatedDecks = decks.map((deck, index) => {
      if (index === 0) {
        return {
          ...deck,
          cards: [...deck.cards, newCard],
        };
      }
      return deck;
    });

    setDecks(updatedDecks);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceDeck = decks.find((deck) => deck.id === source.droppableId);
    const destDeck = decks.find((deck) => deck.id === destination.droppableId);

    const newDecks = [...decks];

    if (source.droppableId === destination.droppableId) {
      // Reordering within the same deck
      const newCards = Array.from(sourceDeck.cards);
      const [reorderedCard] = newCards.splice(source.index, 1);
      newCards.splice(destination.index, 0, reorderedCard);

      const updatedDeck = {
        ...sourceDeck,
        cards: newCards,
      };

      const deckIndex = newDecks.findIndex((deck) => deck.id === source.droppableId);
      newDecks[deckIndex] = updatedDeck;
    } else if (destination.droppableId === 'create-new-deck') {
      // Creating a new deck
      const sourceCards = Array.from(sourceDeck.cards);
      const [movedCard] = sourceCards.splice(source.index, 1);

      const newDeck = {
        id: `deck-${Date.now()}`,
        name: 'New Deck',
        cards: [movedCard],
      };

      const updatedSourceDeck = {
        ...sourceDeck,
        cards: sourceCards,
      };

      const sourceDeckIndex = newDecks.findIndex((deck) => deck.id === source.droppableId);
      newDecks[sourceDeckIndex] = updatedSourceDeck;
      newDecks.push(newDeck);
    } else {
      // Moving card between decks
      const sourceCards = Array.from(sourceDeck.cards);
      const [movedCard] = sourceCards.splice(source.index, 1);
      const destCards = Array.from(destDeck.cards);
      destCards.splice(destination.index, 0, movedCard);

      const updatedSourceDeck = {
        ...sourceDeck,
        cards: sourceCards,
      };

      const updatedDestDeck = {
        ...destDeck,
        cards: destCards,
      };

      const sourceDeckIndex = newDecks.findIndex((deck) => deck.id === source.droppableId);
      const destDeckIndex = newDecks.findIndex((deck) => deck.id === destination.droppableId);

      newDecks[sourceDeckIndex] = updatedSourceDeck;
      newDecks[destDeckIndex] = updatedDestDeck;
    }

    setDecks(newDecks);
  };

  const handleRenameDeck = (deckId, newName) => {
    const updatedDecks = decks.map((deck) =>
      deck.id === deckId ? { ...deck, name: newName } : deck
    );
    setDecks(updatedDecks);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header onCreateNewCard={createNewCard} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Your Decks</h1>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-wrap -mx-2">
            {decks.map((deck) => (
              <div key={deck.id} className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                <Deck
                  id={deck.id}
                  name={deck.name}
                  cards={deck.cards}
                  onRename={handleRenameDeck}
                />
              </div>
            ))}
            <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
              <Droppable droppableId="create-new-deck">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-gray-200 rounded-lg p-4 h-32 flex items-center justify-center ${
                      snapshot.isDraggingOver ? 'bg-green-200' : ''
                    }`}
                  >
                    <p className="text-gray-600 text-center">
                      Drag a card here to create a new deck
                    </p>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </DragDropContext>
      </main>
      <Footer />
    </div>
  );
};

export default DeckManager;
