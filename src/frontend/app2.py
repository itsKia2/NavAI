import streamlit as st
import requests

# Set the page title and layout
st.set_page_config(page_title="NavAI Dashboard", page_icon=":robot_face:", layout="centered")

# Custom CSS for better visuals
streamlit_style = """
    <style>
    /* Full-page background styling */
    .stApp {
        background-color: #0f0f0f; /* Dark gray background */
        color: #ffffff; /* White text */
        padding: 10px;
    }

    /* Title styling */
    h1 {
        color: #1E90FF; /* Blue */
        text-align: center;
        font-family: 'Roboto', sans-serif;
        font-size: 3em;
        font-weight: bold;
        margin-bottom: 0.3em;
    }

    /* Subheader styling */
    h2, h3 {
        text-align: center;
        color: #d3d3d3; /* Light gray */
        font-family: 'Roboto', sans-serif;
        font-size: 1.5em;
    }

    /* Input box styling */
    .stTextInput > div > div > input {
        background-color: #1c1c1c; /* Dark background input box */
        border: 2px solid #1E90FF; /* Blue border */
        color: #ffffff; /* White text */
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); /* Subtle shadow */
    }

    /* Button styling */
    .stButton button {
        background-color: #1E90FF; /* Blue button */
        color: #ffffff; /* White text */
        border: none;
        padding: 15px 25px;
        font-size: 16px;
        border-radius: 10px;
        transition: background-color 0.3s ease;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3); /* Button shadow */
        display: block;
        margin-left: auto;
        margin-right: auto;
    }

    .stButton button:hover {
        background-color: #4169E1; /* Darker blue on hover */
        box-shadow: 4px 4px 15px rgba(0, 0, 0, 0.4); /* Larger shadow on hover */
    }

    /* Footer styling */
    .footer {
        background-color: #1E90FF; /* Blue background */
        padding: 15px;
        text-align: center;
        color: white; /* White text for contrast */
        border-radius: 10px;
    }

    /* Response box styling */
    .response-box {
        background-color: #1c1c1c; /* Dark background box */
        padding: 20px;
        border-radius: 10px;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
        font-size: 1.2em;
        color: #ffffff; /* White text */
        margin: 20px 0;
    }

    /* Processing animation */
    .processing {
        color: #1E90FF;
        font-size: 1.5em;
        text-align: center;
        margin-top: 20px;
        font-family: 'Roboto', sans-serif;
        animation: blink 1s linear infinite;
    }

    @keyframes blink {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }

    </style>
"""
st.markdown(streamlit_style, unsafe_allow_html=True)

# Title section
st.title("Welcome to NavAI")

# Subheader with instructions
st.subheader("Ask NavAI your question below!")

# Add space for cleaner layout
st.markdown("<br><br>", unsafe_allow_html=True)

# Input box for the user to ask questions
st.markdown("<h3>What's on your mind?</h3>", unsafe_allow_html=True)
question = st.text_input("Type your question here:")

# Centered button and response box
col1, col2, col3 = st.columns([1, 2, 1])

with col2:
    if st.button("Ask NavAI"):
        if question:
            with st.spinner('Processing your query, please wait...'):
                st.markdown("<div class='processing'>Processing...</div>", unsafe_allow_html=True)
                res = requests.post("https://nav-ai-443601.ue.r.appspot.com/chat", json={'input': question})
                if res.status_code == 200:
                    response_json = res.json()
                    if "reply" in response_json:
                        result = response_json["reply"]
                        st.markdown(f"<div class='response-box'>{result}</div>", unsafe_allow_html=True)
                    else:
                        st.markdown("<div class='response-box'>No response from the backend.</div>", unsafe_allow_html=True)
                else:
                    st.markdown(f"<div class='response-box'>Error with backend request: {res.text}</div>", unsafe_allow_html=True)
        else:
            st.markdown("<br>", unsafe_allow_html=True)
            st.markdown("<div class='response-box'>Please enter a question to get a response!</div>", unsafe_allow_html=True)

# Footer
st.markdown("<br><br>", unsafe_allow_html=True)
st.markdown(
    """
    <div class="footer">
        Powered by NavAI & Streamlit
    </div>
    """,
    unsafe_allow_html=True,
)
