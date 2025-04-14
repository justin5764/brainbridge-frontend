from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import os

app = Flask(__name__)
CORS(app)

# Load model only when needed to optimize cold starts
model = None

def get_model():
    global model
    if model is None:
        model = whisper.load_model("base")
    return model

@app.route('/api/transcribe', methods=['POST'])
def transcribe():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    audio_file = request.files['file']
    file_path = "/tmp/temp_audio.mp4"  # Use /tmp for Vercel
    audio_file.save(file_path)

    model = get_model()
    result = model.transcribe(file_path)
    print("Transcription result:", result)
    
    # Try to remove the file but don't fail if we can't
    try:
        os.remove(file_path)
    except:
        pass

    return jsonify({'transcript': result['text']})

# Add a health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host="0.0.0.0", port=port, debug=True)

