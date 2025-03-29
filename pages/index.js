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
  const [isRecording, setIsRecording] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    let mediaRecorder;
    let audioChunks = [];
    let micStream = null;

    const recordButton = document.getElementById("recordButton");
    const testMicButton = document.getElementById("testMicButton");
    const micStatus = document.getElementById("micStatus");
    const recordedAudio = document.getElementById("recordedAudio");

    if (recordButton) {
      recordButton.addEventListener("click", async () => {
        if (!mediaRecorder || mediaRecorder.state === "inactive") {
          try {
            // Start recording
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
            mediaRecorder.onstop = async () => {
              const audioBlob = new Blob(audioChunks, { type: "audio/mp4" });
              const arrayBuffer = await audioBlob.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);

              // Create a URL for the recorded audio
              const url = URL.createObjectURL(audioBlob);
              setAudioUrl(url);
              if (recordedAudio) {
                recordedAudio.src = url;
                recordedAudio.classList.remove("hidden");
              }

              setUploadStatus('Uploading...');
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
                  setUploadStatus('Recording uploaded successfully!');
                } else {
                  setUploadStatus('Failed to upload recording');
                }
              } catch (error) {
                console.error("Error uploading:", error);
                setUploadStatus('Error uploading recording');
              }
            };

            mediaRecorder.start();
            setIsRecording(true);
            recordButton.textContent = "Stop Recording";
            recordButton.classList.remove("bg-indigo-600", "hover:bg-indigo-700");
            recordButton.classList.add("bg-gray-600", "hover:bg-gray-700");
          } catch (error) {
            console.error("Error starting recording:", error);
            setUploadStatus('Error accessing microphone');
          }
        } else {
          // Stop recording
          mediaRecorder.stop();
          setIsRecording(false);
          recordButton.textContent = "Start Recording";
          recordButton.classList.remove("bg-gray-600", "hover:bg-gray-700");
          recordButton.classList.add("bg-indigo-600", "hover:bg-indigo-700");

          // Stop all tracks in the stream
          mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
      });
    }

    if (testMicButton) {
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
    }

    // Cleanup function
    return () => {
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]); // Add audioUrl to dependency array

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Navigation Header */}
      <nav className="bg-black/50 backdrop-blur-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                BrainBridge
              </span>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-8">
                <a href="#features" className="hover:text-indigo-400 transition">Features</a>
                <a href="#recorder" className="hover:text-indigo-400 transition">Recorder</a>
                <a href="#about" className="hover:text-indigo-400 transition">About</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Breaking Down Barriers in Communication
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            BrainBridge helps interdisciplinary teams communicate effectively by translating specialized jargon into clear, understandable language across different fields.
          </p>
          <a href="#features" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full text-lg font-medium transition">
            Start Communicating
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-black/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-indigo-400">Real-time Translation</h3>
              <p className="text-gray-300">Instantly convert specialized terminology into clear, accessible language that everyone can understand.</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-indigo-400">Multi-disciplinary Support</h3>
              <p className="text-gray-300">Works across various fields including technology, healthcare, business, and more to bridge communication gaps.</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-indigo-400">Context Preservation</h3>
              <p className="text-gray-300">Maintains the original meaning while making complex concepts accessible to non-experts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recorder Section */}
      <section id="recorder" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800/50 p-8 rounded-xl backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-center mb-8">Start Speaking</h2>
              <p className="text-gray-300 text-center mb-6">
                Record your message in your field's terminology, and let BrainBridge translate it into clear, accessible language for your team.
              </p>

              {/* Mic Test Section */}
              <div id="micTest" className="text-center mb-8">
                <h3 className="text-lg font-medium text-gray-300 mb-4">Test Your Microphone</h3>
                <button id="testMicButton" className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-full transition">
                  Start Mic Test
                </button>
                <p id="micStatus" className="text-gray-400 mt-4">Mic test not started</p>
              </div>

              {/* Record Button */}
              <button 
                id="recordButton" 
                className={`w-full py-4 px-6 rounded-full text-lg font-medium transition ${
                  isRecording 
                    ? 'bg-gray-600 hover:bg-gray-700' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white`}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>

              {/* Upload Status */}
              {uploadStatus && (
                <p className={`mt-4 text-center ${
                  uploadStatus.includes('successfully') 
                    ? 'text-green-500' 
                    : uploadStatus.includes('Error') || uploadStatus.includes('Failed')
                    ? 'text-red-500'
                    : 'text-gray-400'
                }`}>
                  {uploadStatus}
                </p>
              )}

              {/* Audio Player */}
              <audio id="recordedAudio" controls className="mt-6 w-full hidden"></audio>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-black/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">About BrainBridge</h2>
            <p className="text-gray-300 mb-8">
              BrainBridge is a revolutionary communication platform that helps teams from different disciplines understand each other better. Our AI-powered system translates specialized jargon and terminology into clear, accessible language while preserving the original meaning and context.
            </p>
            <p className="text-gray-300 mb-8">
              Whether you're a software engineer explaining technical concepts to healthcare professionals, or a business analyst discussing market trends with scientists, BrainBridge ensures everyone on your team can communicate effectively.
            </p>
            <p className="text-gray-300">
              Join us in breaking down communication barriers and fostering better collaboration across disciplines.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 BrainBridge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
