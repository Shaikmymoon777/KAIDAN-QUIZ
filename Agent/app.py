from flask import Flask, request, jsonify, send_file
import json
import random
import base64
import requests
import pandas as pd
import os
import io

app = Flask(__name__)

# Use the provided API key
API_KEY = "AIzaSyCO0KLByi9Z4pkgUCk_VMyNArybamoW4EM"

# Load vocabulary data from the React project's src/data folder (adjust path as needed)
with open('../src/data/vocab/vocabulary.json', 'r', encoding='utf-8') as f:
    vocabulary_data = json.load(f)

# Helper functions (from your original script)
def generate_options(meaning, vocab_data):
    incorrect = [item['meaning'] for item in vocab_data if item['meaning'] != meaning]
    random.shuffle(incorrect)
    incorrect = incorrect[:3]
    options = [meaning] + incorrect
    random.shuffle(options)
    return options

def generate_correct_index(meaning, options):
    return options.index(meaning)

def get_random_questions(count, vocab_data):
    shuffled = random.sample(vocab_data, min(count, len(vocab_data)))
    return [{
        'japanese': item['japanese'],
        'reading': item['reading'],
        'meaning': item['meaning'],
        'options': generate_options(item['meaning'], vocab_data),
        'correct': generate_correct_index(item['meaning'], generate_options(item['meaning'], vocab_data))
    } for item in shuffled]

def synthesize_speech(text):
    url = f"https://texttospeech.googleapis.com/v1/text:synthesize?key={API_KEY}"
    data = {
        "input": {"text": text},
        "voice": {"languageCode": "ja-JP", "name": "ja-JP-Standard-A"},
        "audioConfig": {"audioEncoding": "MP3"}
    }
    response = requests.post(url, json=data)
    if response.status_code != 200:
        return None
    return response.json()['audioContent']  # Base64 audio

def transcribe_audio(audio_b64):
    url = f"https://speech.googleapis.com/v1/speech:recognize?key={API_KEY}"
    audio_content = base64.b64decode(audio_b64)
    data = {
        "config": {
            "encoding": "LINEAR16",
            "sampleRateHertz": 16000,
            "languageCode": "ja-JP"
        },
        "audio": {"content": base64.b64encode(audio_content).decode('utf-8')}
    }
    response = requests.post(url, json=data)
    if response.status_code != 200:
        return ""
    results = response.json().get('results', [])
    return results[0]['alternatives'][0]['transcript'].strip() if results else ""

# API Endpoints
@app.route('/api/questions/<section>', methods=['GET'])
def get_questions(section):
    count = 25  # Fixed number of questions per section
    questions = get_random_questions(count, vocabulary_data)
    return jsonify(questions)

@app.route('/api/tts', methods=['POST'])
def get_tts():
    text = request.json.get('text')
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    audio_b64 = synthesize_speech(text)
    if not audio_b64:
        return jsonify({'error': 'TTS failed'}), 500
    return jsonify({'audio': audio_b64})

@app.route('/api/stt', methods=['POST'])
def get_stt():
    audio_b64 = request.json.get('audio')
    if not audio_b64:
        return jsonify({'error': 'No audio provided'}), 400
    transcript = transcribe_audio(audio_b64)
    return jsonify({'transcript': transcript})

@app.route('/api/submit', methods=['POST'])
def submit_exam():
    results = request.json.get('results')
    if not results:
        return jsonify({'error': 'No results provided'}), 400

    # Calculate scores
    vocab_score = sum(1 for r in results if r['section'] == 'vocabulary' and r['correct'])
    listen_score = sum(1 for r in results if r['section'] == 'listening' and r['correct'])
    speak_score = sum(1 for r in results if r['section'] == 'speaking' and r['correct'])
    total_score = vocab_score + listen_score + speak_score
    total_questions = len(results)

    # Prepare data for Excel
    df = pd.DataFrame(results)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Exam Results')
    output.seek(0)

    return send_file(
        output,
        as_attachment=True,
        download_name='exam_results.xlsx',
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

if __name__ == '__main__':
    if not os.path.exists('temp'):
        os.makedirs('temp')
    app.run(debug=True, host='0.0.0.0', port=5000)