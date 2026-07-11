import os
from PIL import Image
from flask import Flask, request, render_template, jsonify
from config import Config
from services import GeminiService

app = Flask(__name__)
app.config.from_object(Config)

# Initialize Gemini Service
gemini_service = GeminiService()

@app.route('/', methods=['GET'])
def index():
    """Renders the main dashboard page."""
    # Check if API Key is configured to show a banner/alert to the user if missing
    api_key_configured = bool(Config.GOOGLE_API_KEY) and not (
        Config.GOOGLE_API_KEY.startswith("your_") or Config.GOOGLE_API_KEY == ""
    )
    return render_template('index.html', api_key_configured=api_key_configured, demo_mode=Config.DEMO_MODE)

@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Handles image uploads, runs them through the Gemini model, 
    and validates whether the image is medical content.
    Returns JSON response.
    """
    if not Config.DEMO_MODE and (not Config.GOOGLE_API_KEY or Config.GOOGLE_API_KEY.startswith("your_")):
        return jsonify({
            'success': False,
            'error': 'Google Gemini API Key is missing or configured with a placeholder. Please set a valid GOOGLE_API_KEY in your .env file.'
        }), 400

    if 'file' not in request.files:
        return jsonify({
            'success': False,
            'error': 'No file part in the request.'
        }), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({
            'success': False,
            'error': 'No file selected.'
        }), 400

    try:
        # Open and process the image
        img = Image.open(file.stream)
        
        # Verify it's a valid image format by attempting to load it
        img.verify()
        
        # Re-open because verify() closes the file descriptor or resets pointers
        file.seek(0)
        img = Image.open(file.stream)
        
        # Limit image resolution/size if needed to avoid large payload errors, 
        # but PIL + Gemini handle standard image sizes fine.
        
        # 1. Generate detailed description
        analysis_text = gemini_service.analyze_medicine_image(img)
        
        if not analysis_text:
            return jsonify({
                'success': False,
                'error': 'Could not extract description from the image. Please try again with a clearer image.'
            }), 500
            
        # 2. Validate medical relevance
        is_medical = gemini_service.is_medical_content(analysis_text)
        
        if is_medical:
            return jsonify({
                'success': True,
                'analysis': analysis_text,
                'is_medical': True
            })
        else:
            return jsonify({
                'success': False,
                'error': 'The uploaded image does not appear to have medical relevance. Please upload a valid medical image (e.g., pill, medicine label, prescription, or clinical scan).',
                'is_medical': False
            }), 422
            
    except IOError:
        return jsonify({
            'success': False,
            'error': 'Invalid image file. Please upload a valid JPG, JPEG, or PNG image.'
        }), 400
    except Exception as e:
        app.logger.error(f"Error processing upload: {e}")
        return jsonify({
            'success': False,
            'error': f"An error occurred during analysis: {str(e)}"
        }), 500

if __name__ == '__main__':
    # Get port from environment or default to 5000
    port = Config.PORT
    debug = Config.DEBUG
    print(f"Starting Medicine Recognition System on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=debug)