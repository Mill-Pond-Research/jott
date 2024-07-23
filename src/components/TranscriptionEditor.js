import React, { useState, useEffect } from 'react';
import { Editor, EditorState, ContentState } from 'draft-js';
import 'draft-js/dist/Draft.css';

const TranscriptionEditor = ({ initialText, onSave, onElaborate, onRedoTranscription }) => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createWithContent(ContentState.createFromText(initialText))
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isElaborated, setIsElaborated] = useState(false);
  const [originalTranscription, setOriginalTranscription] = useState(initialText);

  useEffect(() => {
    setEditorState(EditorState.createWithContent(ContentState.createFromText(initialText)));
    setOriginalTranscription(initialText);
    setIsElaborated(false);
  }, [initialText]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    const content = editorState.getCurrentContent().getPlainText();
    onSave(content);
    setIsEditing(false);
  };

  const handleElaborate = async () => {
    const currentText = editorState.getCurrentContent().getPlainText();
    try {
      const elaboratedText = await onElaborate(currentText);
      setEditorState(EditorState.createWithContent(ContentState.createFromText(elaboratedText)));
      setIsElaborated(true);
    } catch (error) {
      console.error('Elaboration failed:', error);
      // Here, you might want to show an error message to the user
    }
  };

  const handleRedoTranscription = () => {
    setEditorState(EditorState.createWithContent(ContentState.createFromText(originalTranscription)));
    setIsElaborated(false);
    onRedoTranscription();
  };

  return (
    <div className="mt-4 border rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out">
      <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700">
          {isEditing ? 'Edit Text' : (isElaborated ? 'Elaborated Text' : 'Transcription')}
        </h3>
        <div className="flex space-x-2">
          {!isEditing && (
            <button
              className="px-4 py-2 rounded-full text-sm font-medium bg-purple-500 hover:bg-purple-600 text-white transition-colors duration-300"
              onClick={handleElaborate}
              disabled={isEditing}
              aria-label="Elaborate text"
            >
              Elaborate
            </button>
          )}
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
              isEditing
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            onClick={isEditing ? handleSave : handleEdit}
            aria-label={isEditing ? 'Save edits' : 'Edit text'}
          >
            {isEditing ? 'Save Edits' : 'Edit Text'}
          </button>
          {isElaborated && !isEditing && (
            <button
              className="px-4 py-2 rounded-full text-sm font-medium bg-gray-500 hover:bg-gray-600 text-white transition-colors duration-300"
              onClick={handleRedoTranscription}
              aria-label="Redo transcription"
            >
              Redo Transcription
            </button>
          )}
        </div>
      </div>
      <div className={`p-4 ${isEditing ? 'bg-white' : 'bg-gray-50'}`}>
        {isEditing ? (
          <div className="border rounded focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-300">
            <Editor
              editorState={editorState}
              onChange={setEditorState}
              readOnly={!isEditing}
              placeholder="Edit your text here..."
            />
          </div>
        ) : (
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
            {editorState.getCurrentContent().getPlainText() || 'No text available.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptionEditor;
