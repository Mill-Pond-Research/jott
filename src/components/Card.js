import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiTrash2, FiEdit, FiPlay, FiPause } from 'react-icons/fi';
import AudioRecorder from './AudioRecorder';
import ElaborationDisplay from './ElaborationDisplay';
import TranscriptionEditor from './TranscriptionEditor';
import VolumeMeter from './VolumeMeter';
import WaveformVisualizer from './WaveformVisualizer';
import { transcribeAudio } from '../services/whisperAPI';
import { generateElaboration } from '../services/claudeAPI';

const Card = ({ id, title, content, audioUrl, transcription, elaboration, onUpdate, onDelete, decks, addCardToDeck }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isElaborating, setIsElaborating] = useState(false);
  const [error, setError] = useState(null);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [cardTitle, setCardTitle] = useState(title);
  const titleInputRef = useRef(null);

  const audioRef = useRef(new Audio());
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);

  const [selectedDeck, setSelectedDeck] = useState('');

  const handleUpdate = useCallback((updateData) => {
    onUpdate(id, updateData);
  }, [id, onUpdate]);

  useEffect(() => {
    const audio = audioRef.current;

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(audio.duration);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const handleRecordingStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceNodeRef.current.connect(analyserRef.current);

      setIsRecording(true);
      setIsPaused(false);
      setError(null);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Failed to access microphone. Please check your permissions and try again.');
    }
  };

  const handleRecordingStop = (blob) => {
    setIsRecording(false);
    setIsPaused(false);
    setAudioBlob(blob);
    sourceNodeRef.current?.disconnect();
    audioContextRef.current?.close();

    const url = URL.createObjectURL(blob);
    audioRef.current.src = url;
    handleUpdate({ audioUrl: url });
  };

  const handleRecordingPause = () => {
    setIsPaused(true);
  };

  const handleRecordingResume = () => {
    setIsPaused(false);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTranscribe = async () => {
    if (!audioBlob) return;

    setIsTranscribing(true);
    try {
      const text = await transcribeAudio(audioBlob);
      handleUpdate({ transcription: text });
    } catch (error) {
      console.error('Transcription failed:', error);
      setError('Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleElaborate = async () => {
    if (!transcription) return;

    setIsElaborating(true);
    try {
      const elaboratedText = await generateElaboration(transcription);
      handleUpdate({ elaboration: elaboratedText });
    } catch (error) {
      console.error('Elaboration failed:', error);
      setError('Failed to elaborate text. Please try again.');
    } finally {
      setIsElaborating(false);
    }
  };

  const handleTranscriptionUpdate = (newTranscription) => {
    handleUpdate({ transcription: newTranscription });
  };

  const handleElaborationUpdate = (newElaboration) => {
    handleUpdate({ elaboration: newElaboration });
  };

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleChange = (e) => {
    setCardTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (cardTitle.trim() !== title) {
      handleUpdate({ title: cardTitle.trim() });
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setCardTitle(title);
    }
  };

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      onDelete(id);
    }
  };

  const handleDeckChange = (e) => {
    const deckId = e.target.value;
    console.log(`Selected deck: ${deckId}`);
    console.log('Available decks:', decks);
    setSelectedDeck(deckId);
    if (deckId && deckId !== "") {
      addCardToDeck(id, deckId);
    }
  };

  return (
    <motion.div
      layout
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 card-transition"
    >
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 flex justify-between items-center">
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={cardTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="text-xl font-semibold text-white bg-transparent border-b-2 border-white focus:outline-none focus:border-blue-200 w-full"
          />
        ) : (
          <h3 
            className="text-xl font-semibold text-white cursor-pointer hover:text-blue-200 transition-colors duration-200 flex items-center"
            onClick={handleTitleClick}
          >
            {cardTitle}
            <FiEdit className="ml-2" size={16} />
          </h3>
        )}
        <div className="flex items-center">
          <select
            value={selectedDeck}
            onChange={handleDeckChange}
            className="mr-2 text-sm border-none bg-blue-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white transition-colors duration-200 hover:bg-blue-600 cursor-pointer appearance-none px-3 py-1"
          >
            <option value="" className="bg-white text-gray-800">Add to deck</option>
            {decks && decks.map((deck) => (
              <option key={deck.id} value={deck.id} className="bg-white text-gray-800">
                {typeof deck.name === 'string' ? deck.name : JSON.stringify(deck.name)}
              </option>
            ))}
          </select>
          <button
            onClick={handleDelete}
            className="text-white hover:text-red-300 transition-colors duration-200"
          >
            <FiTrash2 size={20} />
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <AudioRecorder
            isRecording={isRecording}
            isPaused={isPaused}
            onStart={handleRecordingStart}
            onStop={handleRecordingStop}
            onPause={handleRecordingPause}
            onResume={handleRecordingResume}
          />
          {audioUrl && (
            <div className="flex items-center">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold p-2 rounded-full mr-2"
                onClick={handlePlayPause}
              >
                {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
              </button>
              <span className="text-sm text-gray-600">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
          )}
        </div>

        {isRecording && (
          <div className="mt-4">
            <VolumeMeter analyser={analyserRef.current} />
            <WaveformVisualizer analyser={analyserRef.current} />
          </div>
        )}

        {audioBlob && !transcription && (
          <button
            className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-full"
            onClick={handleTranscribe}
            disabled={isTranscribing}
          >
            {isTranscribing ? 'Transcribing...' : 'Transcribe'}
          </button>
        )}

        {transcription && (
          <div className="mt-4">
            <TranscriptionEditor
              initialText={transcription}
              onSave={handleTranscriptionUpdate}
            />
            {!elaboration && (
              <button
                className="mt-2 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded w-full"
                onClick={handleElaborate}
                disabled={isElaborating}
              >
                {isElaborating ? 'Elaborating...' : 'Elaborate'}
              </button>
            )}
          </div>
        )}

        {elaboration && (
          <ElaborationDisplay
            text={elaboration}
            onUpdate={handleElaborationUpdate}
          />
        )}

        {error && (
          <div className="mt-4 text-red-500 bg-red-100 border border-red-400 rounded p-2">{error}</div>
        )}
      </div>
    </motion.div>
  );
};

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default Card;