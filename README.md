# MediAssist AI - Hospitalisation Preparation Assistant

**MediAssist AI** is a professional, RAG-powered healthcare assistant designed to help patients prepare for hospitalisation with confidence. It utilizes the **DeepSeek LLM** and a robust **Retrieval-Augmented Generation (RAG)** pipeline to provide accurate, document-based guidance.

## 🚀 Key Features

- **Expert Guidance**: Accurate answers on hospital admission, surgery preparation, discharge procedures, and follow-up care.
- **RAG-Powered**: Answers are grounded in actual hospital preparation guidelines to ensure reliability and safety.
- **Premium UI/UX**: A sleek, modern, and professional interface with a focus on ease of use and readability.
- **Fully Responsive**: Optimized for seamless experiences across desktop, tablet, and mobile devices.
- **Dark Mode Support**: A polished dark theme for comfortable viewing in all lighting conditions.

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript, CSS3, Tailwind CSS.
- **Backend**: Python, Flask, Flask-CORS.
- **AI/LLM**: LangChain, LangGraph, DeepSeek API.
- **Vector Store**: FAISS (Facebook AI Similarity Search).
- **Embeddings**: Sentence-Transformers (HuggingFace).

## 📋 Prerequisites

- Python 3.12
- A DeepSeek API Key

## ⚙️ Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/manasch3/mediassist-ai-rag.git
   cd mediassist-ai-rag
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your API key:
   ```env
   DEEPSEEK_API_KEY=your_api_key_here
   HUGGINGFACE_API_KEY =your_api_key_here
   ```

4. **Run the application**:
   ```bash
   python app.py
   ```

5. **Access the interface**:
   Open your browser and navigate to `http://localhost:5000`.

## 📄 License
This project was developed by Manas as part of an internship evaluation task.

The code is shared for demonstration and evaluation purposes only. It may be viewed and used for learning, but redistribution or commercial use is not permitted without permission.

---
*Powered by DeepSeek & Hospital Knowledge AI*
