# AuraMed — Advanced AI Medical Recognition System

AuraMed is a modern, responsive, single-page Flask web application integrated with Google's state-of-the-art **Gemini 1.5 Flash** model. It provides detailed identification, descriptions, clinical properties, and warnings for uploaded medical images (such as pills, packaging, prescription labels, or clinical scans).

To make development and evaluation seamless, AuraMed features a smart **Demo Mode** fallback that allows users to test the drag-and-drop mechanics, interactive image previews, and report rendering instantly without needing an API key configured.

---

## ✨ Features

- **Multimodal AI Analysis**: Powered by `gemini-1.5-flash` to parse image shapes, text, markings, and clinical details in a single pass.
- **Double-Blind Context Verification**: Validates whether the ingested image is indeed related to the medical, pharmaceutical, or clinical field. Blocks irrelevant/non-medical uploads.
- **Premium Glassmorphic Dashboard**: A clinical, responsive dark-mode dashboard built with Inter/Outfit typography, micro-interactions, and glowing ambient visual accents.
- **Interactive File Upload**: Supports click-to-browse or drag-and-drop file upload with a responsive, live image preview and clear functions.
- **Realistic Shimmer Loader**: Cycle animations with active status logs (e.g., *"Analyzing structures..."*) to guide users during LLM processing.
- **Formatted Clinical Reports**: Features on-the-fly Markdown parsing (using `marked.js`) to display headers, lists, code alerts, and properties tables cleanly.
- **Report Controls**: Quick buttons to copy the markdown text to your clipboard or print formatted medical sheets directly from the browser.
- **Auto-detected Demo Mode**: Runs out-of-the-box with pre-configured clinical templates if a valid Gemini API key is not found, letting you test the dashboard immediately.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.x, Flask (WSGI Server)
- **AI Core**: Google Generative AI Python SDK (`gemini-1.5-flash`)
- **Frontend**: Vanilla HTML5, CSS3 Grid/Flexbox, JavaScript (ES6 Fetch API)
- **Formatting Libraries**: `marked.js` (Markdown renderer), FontAwesome (Icons)

---

## 🚀 Getting Started

Follow these steps to set up the project locally:

### 1. Clone the Repository
```bash
git clone https://github.com/KalyanMurapaka45/Medicine-Recognition-System.git
cd Medicine-Recognition-System
```

### 2. Create and Activate a Virtual Environment
We recommend using a virtual environment (venv) to manage dependencies:
```bash
# Create virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate

# Activate it (macOS/Linux)
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a file named `.env` in the root of your project:
```env
# Google Gemini API Key
# Get a key from https://aistudio.google.com/
GOOGLE_API_KEY=your_actual_gemini_api_key_here

# Flask configuration
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000
```
> [!NOTE]
> If `GOOGLE_API_KEY` is not set or left as a placeholder (starting with `your_`), AuraMed will automatically activate **Demo Mode** with mock data so you can test the upload flow immediately.

### 5. Run the Application
```bash
python app.py
```
After launching the server, visit **[http://127.0.0.1:5000](http://127.0.0.1:5000)** in your web browser.

---

## 📁 Repository Structure

```text
Medicine-Recognition-System/
├── app.py                     # Flask entrypoint & routes (JSON endpoints)
├── config.py                  # Environment parsing & Prompt Templates
├── requirements.txt           # Python dependency specifications
├── .env.example               # Configuration templates
├── .gitignore                 # Excludes .env, virtual environments, and caches
├── services/
│   ├── __init__.py            # Services package entry
│   └── gemini_service.py      # Gemini SDK integration & Demo mode logic
├── static/
│   ├── css/
│   │   └── style.css          # Premium Glassmorphism styling and themes
│   └── js/
│   │   └── main.js            # Drag-and-drop upload, Fetch API, & markdown rendering
└── templates/
    └── index.html             # Dashboard skeleton layout
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

---

## ✉️ Contact Details

**Hema Kalyan Murapaka** - [kalyanmurapaka274@gmail.com](mailto:kalyanmurapaka274@gmail.com)

Project Link: [https://github.com/KalyanMurapaka45/Medicine-Recognition-System](https://github.com/KalyanMurapaka45/Medicine-Recognition-System)

---

## ⚠️ Disclaimer

This tool is powered by Generative AI and is intended **solely for informational, educational, and testing purposes**. It does not constitute medical advice, diagnosis, or prescription support. Always consult a licensed healthcare professional or physician before taking, modifying, or terminating any medication course.
