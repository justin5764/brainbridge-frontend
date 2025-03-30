from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import os

app = Flask(__name__)
CORS(app)

model = whisper.load_model("base")

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    audio_file = request.files['file']
    file_path = "temp_audio.mp4"
    audio_file.save(file_path)

    result = model.transcribe(file_path)
    print("Transcription result:", result)
    os.remove(file_path)

    return jsonify({'transcript': result['text']})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)

