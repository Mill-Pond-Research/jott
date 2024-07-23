# JOTT - AI-Powered Voice Notation App

JOTT is a local AI-powered notation application that allows users to record, transcribe, and elaborate on their ideas using advanced AI technologies.

## Features

- Voice recording with real-time waveform visualization
- Speech-to-text transcription using OpenAI's Whisper API
- AI-powered text elaboration using Claude 3.5 Sonnet API
- [WIP] Card and deck organization with drag-and-drop functionality
- Rich text editing for transcriptions and elaborations
- Local data storage for offline use

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Mill-Pond-Research/jott.git
   cd jott
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your API keys:
   ```
   REACT_APP_OPENAI_API_KEY=your_openai_api_key
   REACT_APP_ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

4. Start the development server:
   ```
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

## Usage

1. Create a new card by clicking the "Create New Card" button in the header.
2. Record audio using the built-in recorder or upload an existing audio file.
3. Transcribe the audio using the "Transcribe" button.
4. Edit the transcription if needed.
5. Generate an AI elaboration by clicking the "Elaborate" button.
6. Organize cards into decks using drag-and-drop functionality.

## Project Structure

- `src/components`: React components for the user interface
- `src/services`: API integration for Whisper and Claude
- `src/App.js`: Main application component
- `src/index.js`: Entry point of the application

## Technologies Used

- React
- Tailwind CSS
- Draft.js
- React DnD
- Framer Motion
- OpenAI Whisper API
- Anthropic Claude API

## Development Stage

- pre-alpha
