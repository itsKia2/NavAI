import streamlit as st

# Page Configurations
st.set_page_config(page_title="NavAI - PDF Chatbot", layout="wide", initial_sidebar_state="expanded")

# Custom CSS for better visuals
st.markdown("""
    <style>
    /* Main app background */
    .stApp {
        background-color: #000000; /* Black background */
        color: #ffffff; /* White text */
        padding: 10px;
    }

    /* Sidebar title and text */
    .sidebar-content h1, .sidebar-content h2, .sidebar-content p {
        color: #ffffff; /* White text for sidebar */
    }

    /* Button styling with blue */
    .stButton>button {
        background-color: #1E90FF; /* Blue button */
        color: white;
        border-radius: 12px;
        font-size: 18px;
        padding: 15px 25px;
        transition: background-color 0.3s ease;
    }

    /* Button hover effect */
    .stButton>button:hover {
        background-color: #4169E1; /* Darker blue on hover */
        box-shadow: 4px 4px 15px rgba(0, 0, 0, 0.4); /* Larger shadow on hover */
    }

    /* Progress bar styling */
    .stProgress {
        margin-top: 5px;
    }

    /* Input box styling */
    .stTextInput>div>div>input {
        background-color: #1c1c1c; /* Dark input box */
        color: #ffffff; /* White text */
        border: 2px solid #1E90FF; /* Blue border */
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    }

    /* Success and warning box styling */
    .stAlert {
        border: 2px solid #1E90FF; /* Blue border for success and warning messages */
        border-radius: 10px;
        color: white;
        background-color: #1c1c1c; /* Dark background */
        padding: 15px;
    }

    /* Custom warning box for "please upload" section */
    .custom-warning {
        border: 2px solid #1E90FF; /* Blue border */
        background-color: #1E90FF; /* Blue background */
        color: white; /* White text */
        border-radius: 10px;
        padding: 15px;
    }

    /* Footer styling */
    footer {
        font-size: 14px;
        font-family: 'Arial';
        color: #ffffff; /* White text */
        margin-top: 30px;
        text-align: center;
        background-color: #1E90FF; /* Blue background for footer */
        padding: 15px;
        border-radius: 10px;
    }
    </style>
""", unsafe_allow_html=True)

# Sidebar Navigation
st.sidebar.title("🚀 Welcome to NavAI")
st.sidebar.markdown("#### Seamless PDF-based Question Answering System")

# PDF Upload Section in Sidebar
st.sidebar.subheader("📄 Upload Your PDF")
uploaded_pdf = st.sidebar.file_uploader("Choose a PDF file", type="pdf")

# Main Page Layout
st.title("NavAI: Intelligent Chatbot")
st.write("### Upload your PDF and ask questions below!")

# Layout for PDF Upload and User Input
col1, col2 = st.columns([2, 1])

with col1:
    if uploaded_pdf is not None:
        # Success message for uploaded PDF
        st.success("**PDF uploaded successfully!**")
        st.write("### Step 2: Ask your question about the uploaded document:")

        # Placeholder for PDF extraction process (not yet implemented)
        st.write("_PDF content extraction is currently a placeholder for this demo._")

        # Input for user's question
        user_question = st.text_input("Enter your question here", placeholder="e.g., What is the company's revenue for 2023?", key="user_question")

        # Show a progress bar while the bot processes the question (for demonstration)
        if st.button("Ask NavAI"):
            if user_question:
                with st.spinner("NavAI is processing your question..."):
                    # Simulating bot's response (replace with actual logic)
                    bot_response = "This is NavAI's placeholder response. Integration with PDF processing is pending."
                    st.success(f"**NavAI:** {bot_response}")

            else:
                st.warning("Please enter a question.")
    else:
        # Custom warning for missing PDF upload
        st.markdown("<div class='custom-warning'>Please upload a PDF to get started.</div>", unsafe_allow_html=True)

# Footer
st.markdown("""
    <footer>
        Developed by the NavAI Team
    </footer>
""", unsafe_allow_html=True)
