from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import os
import whisperx
import torch


app = Flask(__name__)
CORS(app)


device = "cuda" if torch.cuda.is_available() else "cpu"
model = whisperx.load_model("base", device=device, compute_type="int8")
HF_TOKEN = os.getenv("HF_TOKEN")


@app.route('/transcribe', methods=['POST'])
def transcribe():
   if 'file' not in request.files:
       return jsonify({'error': 'No file part'})
   audio_file = request.files['file']
   file_path = "temp_audio.mp4"
   audio_file.save(file_path)


   try:
       batch_size = 8
       audio = whisperx.load_audio(file_path)
       result = model.transcribe(file_path, batch_size=batch_size)


       model_a, metadata = whisperx.load_align_model(language_code=result["language"], device=device)
       result = whisperx.align(result["segments"], model_a, metadata, audio, device, return_char_alignments=False)
       diarize_model = whisperx.DiarizationPipeline(use_auth_token=HF_TOKEN, device=device)


       diarizate_segments = diarize_model(audio)
       result = whisperx.assign_word_speakers(diarizate_segments, result)


       transcript_with_speakers = []
       for segment in result["segments"]:
           speaker = segment["speaker"]
           start = segment["start"]
           end = segment["end"]
           text = segment["text"]
           transcript_with_speakers.append({
               "speaker": speaker,
               "start": start,
               "end": end,
               "text": text
           })
      
       # transcription_record = Transcription(
       #     status="completed",
       #     error_message=None,
       #     completed_at=datetime.utcnow(),
       #     transcript=transcript_with_speakers
       # )
       # db.session.add(transcription_record)
       # db.session.commit()


       # # Prepare the JSON response with all details.
       # response_data = {
       #     "id": transcription_record.id,
       #     "status": transcription_record.status,
       #     "error_message": transcription_record.error_message,
       #     "created_at": transcription_record.created_at.isoformat(),
       #     "completed_at": transcription_record.completed_at.isoformat(),
       #     "transcript": transcript_with_speakers
       # }
       # return jsonify(response_data), 200


       return jsonify({"transcript": transcript_with_speakers}), 200


   except Exception as e:
       print(f"Error during transcription: {e}")
       return jsonify({'error': 'Transcription failed'}), 500


   finally:
       if os.path.exists(file_path):
           os.remove(file_path)


if __name__ == '__main__':
   app.run(host="0.0.0.0", port=5001, debug=True)