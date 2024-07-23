import React, { useState, useRef, useEffect } from 'react';
import { transcribeAudio } from '../services/whisperAPI';
import { generateElaboration } from '../services/claudeAPI';
import TranscriptionEditor from './TranscriptionEditor';
import WaveformVisualizer from './WaveformVisualizer';
import VolumeMeter from './VolumeMeter';

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [elaboration, setElaboration] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isElaborating, setIsElaborating] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(new Audio());
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const recordingTimerRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const onDurationChange = () => {
      setDuration(audio.duration);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(audio.duration);
    };

    const onError = (e) => {
      console.error('Audio error:', e);
      setError('Failed to load audio. Please try recording again.');
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      clearInterval(recordingTimerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceNodeRef.current.connect(analyserRef.current);

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        setIsLoading(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        audioRef.current.src = url;
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      setError(null);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Failed to access microphone. Please check your permissions and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      sourceNodeRef.current.disconnect();
      audioContextRef.current.close();
      clearInterval(recordingTimerRef.current);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearInterval(recordingTimerRef.current);
    } else if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time) => {
    if (!isFinite(time) || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTranscribe = async () => {
    if (!audioUrl) return;

    setIsTranscribing(true);
    try {
      const response = await fetch(audioUrl);
      const audioBlob = await response.blob();
      const text = await transcribeAudio(audioBlob);
      setTranscription(text);
      setElaboration(''); // Clear any previous elaboration
    } catch (error) {
      console.error('Transcription failed:', error);
      setError('Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleElaborate = async (text) => {
    setIsElaborating(true);
    try {
      const elaboratedText = await generateElaboration(text);
      setElaboration(elaboratedText);
      return elaboratedText;
    } catch (error) {
      console.error('Elaboration failed:', error);
      setError('Failed to elaborate text. Please try again.');
      throw error;
    } finally {
      setIsElaborating(false);
    }
  };

  const handleSaveEdits = (newText) => {
    setElaboration(newText);
    // Here you could implement logic to save the edited text to a backend or local storage
  };

  const handleRedoTranscription = () => {
    setElaboration('');
    // Optionally, you could re-run the transcription here if needed
  };

  return (
    <div className="mt-4">
      <div className="flex space-x-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
          } text-white font-bold`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        {isRecording && (
          <button
            className={`px-4 py-2 rounded ${
              isPaused ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'
            } text-white font-bold`}
            onClick={pauseRecording}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
      </div>

      {isRecording && (
        <div className="mb-4">
          <p className="text-lg font-semibold">Recording Time: {formatTime(recordingTime)}</p>
          <VolumeMeter analyser={analyserRef.current} />
          <WaveformVisualizer analyser={analyserRef.current} />
        </div>
      )}

      {audioUrl && !isRecording && (
        <div className="mt-4">
          {isLoading ? (
            <p>Loading audio...</p>
          ) : (
            <div className="flex items-center mt-2">
              <button
                className={`px-4 py-2 rounded ${
                  isPlaying ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
                } text-white font-bold mr-2`}
                onClick={togglePlayPause}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          )}
        </div>
      )}

      {audioUrl && !isRecording && (
        <div className="mt-4">
          <button
            className="px-4 py-2 rounded bg-purple-500 hover:bg-purple-600 text-white font-bold mr-2"
            onClick={handleTranscribe}
            disabled={isTranscribing}
          >
            {isTranscribing ? 'Transcribing...' : 'Transcribe'}
          </button>
          
          {transcription && !elaboration && (
            <button
              className="mt-2 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleElaborate(transcription)}
              disabled={isElaborating}
            >
              {isElaborating ? 'Elaborating...' : 'Elaborate'}
            </button>
          )}

          {transcription && (
            <TranscriptionEditor
              initialText={elaboration || transcription}
              onSave={handleSaveEdits}
              onElaborate={handleElaborate}
              onRedoTranscription={handleRedoTranscription}
            />
          )}
        </div>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default AudioRecorder;