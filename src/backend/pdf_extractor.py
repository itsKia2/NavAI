import requests
import fitz  # PyMuPDF
from io import BytesIO

def fetch_pdf_text(url):
    """Download the PDF from the given URL and extract text."""
    response = requests.get(url)
    response.raise_for_status()
    pdf_data = BytesIO(response.content)
    
    text = ""
    with fitz.open(stream=pdf_data, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    
    return text
