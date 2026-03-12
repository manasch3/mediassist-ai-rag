from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from chat import chatbot
from langchain_core.messages import HumanMessage
import os

app = Flask(__name__, static_folder='frontend', static_url_path='')
CORS(app)

# Store chat history in memory (simple implementation)
chat_history = []

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        user_query = data.get('question')
        
        if not user_query:
            return jsonify({"error": "No question provided"}), 400

        # Add user message to history
        chat_history.append(HumanMessage(content=user_query))

        # Invoke chatbot
        result = chatbot.invoke({"messages": chat_history})
        
        # Get latest AI message
        ai_message = result["messages"][-1]
        
        # Add AI message to history
        chat_history.append(ai_message)

        return jsonify({
            "result": ai_message.content,
            "sql_query": None,
            "db_result": []
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
