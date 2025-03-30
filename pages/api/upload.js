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

      // Send to Flask backend for transcription
      const response = await fetch("http://localhost:5001/transcribe", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      console.log("Flask response:", data);

      if (!data.transcript) {
        throw new Error("No transcript returned from Flask");
      }

      return res.status(200).json({ transcript: data.transcript });
    } catch (error) {
      console.error('Error saving file:', error);
      return res.status(500).json({ message: 'Error saving file' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 