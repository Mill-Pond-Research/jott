import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { FiMove, FiTrash2 } from 'react-icons/fi';
import AudioRecorder from './AudioRecorder';
import ElaborationDisplay from './ElaborationDisplay';
import TranscriptionEditor from './TranscriptionEditor';
import VolumeMeter from './VolumeMeter';
import WaveformVisualizer from './WaveformVisualizer';
import { transcribeAudio } from '../services/whisperAPI';
import { generateElaboration } from '../services/claudeAPI';

const Card = ({ id, index, moveCard, title, content, audioUrl, transcription, elaboration, onUpdate, onDelete }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'CARD',
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'CARD',
    hover(item, monitor) {
      if (!drag) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      moveCard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [isRecording, setIsRecording] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [audioBlob, setAudioBlob] = React.useState(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const [isElaborating, setIsElaborating] = React.useState(false);
  const [error, setError] = React.useState(null);

  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [cardTitle, setCardTitle] = React.useState(title);
  const titleInputRef = React.useRef(null);

  const audioRef = React.useRef(new Audio());
  const audioContextRef = React.useRef(null);
  const analyserRef = React.useRef(null);
  const sourceNodeRef = React.useRef(null);

  const handleUpdate = React.useCallback((updateData) => {
    onUpdate(id, updateData);
  }, [id, onUpdate]);

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      onDelete(id);
    }
  };

  return (
    <motion.div
      ref={(node) => drag(drop(node))}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
      whileDrag={{
        scale: 1.05,
        boxShadow: '0px 5px 10px rgba(0,0,0,0.1)',
      }}
      layout
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 card-transition"
    >
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 flex justify-between items-center">
        <FiMove className="text-white cursor-move" size={24} />
        <button
          onClick={handleDelete}
          className="text-white hover:text-red-500 transition-colors duration-200"
        >
          <FiTrash2 size={24} />
        </button>
      </div>
      <div className="p-6">
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={cardTitle}
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
            {cardTitle}
          </h3>
        )}
        
        <AudioRecorder
          isRecording={isRecording}
          isPaused={isPaused}
          onStart={handleRecordingStart}
          onStop={handleRecordingStop}
          onPause={handleRecordingPause}
          onResume={handleRecordingResume}
        />

        {isRecording && (
          <div className="mt-4">
            <VolumeMeter analyser={analyserRef.current} />
            <WaveformVisualizer analyser={analyserRef.current} />
          </div>
        )}

        {audioUrl && (
          <div className="mt-4">
            <audio ref={audioRef} src={audioUrl} />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2"
              onClick={handlePlayPause}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
        )}

        {audioBlob && !transcription && (
          <button
            className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
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
                className="mt-2 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
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
          <div className="mt-4 text-red-500">{error}</div>
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