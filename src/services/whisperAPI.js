export async function transcribeAudio(audioBlob) {
  try {
    // Create a FormData object to send the audio file
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'json');

    // Make a direct fetch request to the OpenAI API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.text;
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error("Failed to transcribe audio: " + error.message);
  }
}
