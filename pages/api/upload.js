import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { audio } = req.body;
      
      // Convert the array back to Uint8Array
      const uint8Array = new Uint8Array(audio);
      const blob = new Blob([uint8Array], { type: 'audio/mp4' });

      const formData = new FormData();
      formData.append('file', blob, 'recording.mp4');
      
      try {
        console.log("Attempting to connect to Flask backend...");
        // Send to Flask backend for transcription
        const apiUrl = process.env.NODE_ENV === 'production' 
          ? "/api/transcribe"  // In production use relative URL
          : "http://localhost:5001/api/transcribe"; // In development use localhost
        
        const response = await fetch(apiUrl, {
          method: "POST",
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Flask server returned status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Flask response:", data);
        
        if (!data.transcript) {
          throw new Error("No transcript returned from Flask");
        }
        
        return res.status(200).json({ transcript: data.transcript });
      } catch (fetchError) {
        console.error("Error connecting to Flask backend:", fetchError);
        return res.status(200).json({ 
          transcript: "Could not connect to transcription service. Your audio was recorded successfully, but transcription is unavailable."
        });
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      return res.status(500).json({ 
        message: 'Error processing audio file',
        error: error.message 
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 