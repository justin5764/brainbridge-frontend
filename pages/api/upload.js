import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { audio } = req.body;
      
      // Convert the array back to Uint8Array
      const uint8Array = new Uint8Array(audio);
      
      // Generate a unique filename using timestamp
      const filename = `recording_${Date.now()}.mp4`;
      const filePath = path.join(process.cwd(), 'uploads', filename);

      // Create the uploads directory if it doesn't exist
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      // Write the audio file to the filesystem
      fs.writeFileSync(filePath, Buffer.from(uint8Array));
      
      return res.status(200).json({ message: 'File saved successfully', filename });
    } catch (error) {
      console.error('Error saving file:', error);
      return res.status(500).json({ message: 'Error saving file' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 