import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState } from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [transcript, setTranscript] = useState(null);
  useEffect(() => {
    let mediaRecorder;
    let audioChunks = [];
    let micStream = null;

    const recordButton = document.getElementById("recordButton");
    const testMicButton = document.getElementById("testMicButton");
    const micStatus = document.getElementById("micStatus");

    recordButton.addEventListener("click", async () => {
      if (!mediaRecorder || mediaRecorder.state === "inactive") {
        // Start recording
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/mp4" });
          const arrayBuffer = await audioBlob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);

          try {
            const response = await fetch("/api/upload", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ 
                audio: Array.from(uint8Array) 
              }),
            });

            if (response.ok) {
              const data = await response.json();
              setTranscript(data.transcript);
              alert("Recording uploaded successfully!");
            } else {
              alert("Failed to upload recording");
            }
          } catch (error) {
            console.error("Error uploading:", error);
            alert("Error uploading recording");
          }
        };

        mediaRecorder.start();
        recordButton.textContent = "Stop Recording";
        recordButton.classList.remove("bg-red-600", "hover:bg-red-700");
        recordButton.classList.add("bg-gray-600", "hover:bg-gray-700");
      } else {
        // Stop recording
        mediaRecorder.stop();
        recordButton.textContent = "Start Recording";
        recordButton.classList.remove("bg-gray-600", "hover:bg-gray-700");
        recordButton.classList.add("bg-red-600", "hover:bg-red-700");

        // Stop all tracks in the stream
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    });

    // Handle mic test functionality
    testMicButton.addEventListener("click", async () => {
      try {
        if (!micStream) {
          // Start mic test
          micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micStatus.textContent = "Microphone is working!";
          micStatus.classList.add("text-green-500");
          testMicButton.textContent = "Stop Mic Test";
        } else {
          // Stop mic test
          micStream.getTracks().forEach(track => track.stop());
          micStream = null;
          micStatus.textContent = "Mic test stopped";
          micStatus.classList.remove("text-green-500");
          testMicButton.textContent = "Start Mic Test";
        }
      } catch (error) {
        console.error("Error accessing microphone:", error);
        micStatus.textContent = "Error accessing microphone";
        micStatus.classList.add("text-red-500");
      }
    });
  }, []); // Empty dependency array to run once on mount

  return (
    <div className="bg-gray-900 text-white font-sans flex justify-center items-center min-h-screen p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-sm w-full">
        <h1 className="text-3xl font-semibold text-center mb-6">BrainBridge Audio Recorder</h1>

        {/* Mic Test Section */}
        <div id="micTest" className="text-center mb-8">
          <h3 className="text-lg font-medium text-gray-400 mb-4">Test Your Microphone</h3>
          <button id="testMicButton" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition ease-in-out duration-300">Start Mic Test</button>
          <p id="micStatus" className="text-gray-500 mt-4">Mic test not started</p>
          <audio id="micTestAudio" controls hidden className="mt-4 w-full"></audio>
        </div>

        {/* Record Button */}
        <button id="recordButton" className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-md transition ease-in-out duration-300">Start Recording</button>
        <audio id="recordedAudio" controls className="mt-4 w-full hidden"></audio>

        {/* Transcript Display */}
        {transcript && (
          <div className="mt-4 p-4 bg-gray-700 rounded">
            <h2 className="text-xl font-semibold mb-2">Transcript</h2>
            <p>{transcript}</p>
          </div>
        )}
      </div>
    </div>
  );
}
