import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Application configuration settings."""
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    IS_KEY_MISSING = not GOOGLE_API_KEY or GOOGLE_API_KEY.startswith("your_") or GOOGLE_API_KEY == ""
    DEMO_MODE = os.getenv("DEMO_MODE", str(IS_KEY_MISSING)).lower() in ("true", "1", "yes")
    
    # Flask settings
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    DEBUG = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "yes")
    PORT = int(os.getenv("PORT", 5000))
    
    # Gemini AI model settings
    GEMINI_MODEL = "gemini-1.5-flash"
    
    # Medical recognition settings
    IMAGE_PROMPT = """
Analyze the provided medical image in detail. Follow these strict guidelines:
1. Identify and describe the visual contents (e.g., a pill, medication packaging, a label, a medical scan, etc.).
2. If it is a pill/capsule, try to identify its markings, shape, color, and potential name.
3. Highlight any visible features, text, dosage details, or barcodes.
4. Provide structured information on:
   - **Visual Details**: Colors, shape, markings, texture.
   - **Potential Identification**: Possible matching medication(s).
   - **Common Uses**: What this medication is generally prescribed for.
   - **Important Warnings & Precautions**: Safe usage guidelines.
5. Include a clear disclaimer stating that this AI tool is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a healthcare professional before taking any medication.
"""

    VALIDATION_PROMPT = """
You are a medical verification assistant. Check if the provided image analysis is related to medicine, medication, medical scans, pill recognition, or the pharmaceutical/clinical field.
Analyze the context below:
"{context}"

Does this context relate to medicine, healthcare, pharmacy, pills, or medical conditions?
Reply with exactly "Yes" or "No". Do not include any other text.
"""
