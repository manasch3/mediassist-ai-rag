from dotenv import load_dotenv
load_dotenv()

from typing import Annotated, TypedDict
from pydantic import BaseModel
from langchain.chat_models import init_chat_model
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.tools import StructuredTool
from langchain_core.messages import HumanMessage, SystemMessage, BaseMessage
from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition

# ================== LLM ==================
llm = init_chat_model(
    "deepseek-chat",
    model_provider="deepseek",
    temperature=0.2
)

# ================== LOAD PDF ==================
loader = PyPDFLoader("PDF/Patient_Hospitalisation_Preparation_Guide.pdf")
docs = loader.load()

# ================== EMBEDDINGS ==================
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1200,
    chunk_overlap=150
)

chunks = splitter.split_documents(docs)

# ================== VECTOR STORE ==================
vector_store = FAISS.from_documents(chunks, embeddings)

retriever = vector_store.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 4}
)

# ================== RAG TOOL ==================
class RagInput(BaseModel):
    query: str

def rag_function(query: str):

    results = retriever.invoke(query)

    if not results:
        return "The document does not contain this information."

    context = "\n\n".join([doc.page_content for doc in results])

    return context


rag_tool = StructuredTool(
    name="rag_tool",
    description="Retrieve relevant information from the Patient Hospitalisation Preparation PDF.",
    args_schema=RagInput,
    func=rag_function,
)

tools = [rag_tool]

# Bind tools
llm_with_tools = llm.bind_tools(tools)

# ================== CHAT STATE ==================
class ChatState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]

# ================== SYSTEM PROMPT ==================
SYSTEM_PROMPT = """
You are an AI healthcare assistant that helps patients prepare for hospitalisation.

Guidelines:
- Provide accurate answers based only on the available hospital guidelines
- Do not mention documents, files, or sources
- If the information is not available, say: "I don't have that information."
- Keep answers clear, concise, and professional
- Use simple and patient-friendly language
- Avoid unnecessary explanations
"""

# ================== CHAT NODE ==================
def chat_node(state: ChatState):

    messages = state["messages"]

    # Add system message once
    if not any(isinstance(m, SystemMessage) for m in messages):
        messages = [SystemMessage(content=SYSTEM_PROMPT)] + messages

    response = llm_with_tools.invoke(messages)

    return {"messages": [response]}

# ================== GRAPH ==================
tool_node = ToolNode(tools)

graph = StateGraph(ChatState)
graph.add_node("chat_node", chat_node)
graph.add_node("tools", tool_node)

graph.add_edge(START, "chat_node")
graph.add_conditional_edges("chat_node", tools_condition)
graph.add_edge("tools", "chat_node")

chatbot = graph.compile()

# ================== CHAT LOOP ==================
if __name__ == "__main__":
    messages = []

    while True:

        user_input = input("You: ")

        if user_input.lower() in ["exit", "quit", "bye"]:
            print("AI: Goodbye 👋")
            break

        messages.append(HumanMessage(content=user_input))

        try:
            result = chatbot.invoke({"messages": messages})

            ai_message = result["messages"][-1]

            print(f"AI: {ai_message.content}\n")

            messages.append(ai_message)

        except Exception as e:
            import traceback
            traceback.print_exc()
            print("Error:", e)
