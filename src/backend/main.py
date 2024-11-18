from src.pdf_extractor import fetch_pdf_text
from src.db_inserter import connect_to_db, insert_into_db
from src.embedder import generate_embedding

def main():
    conn = connect_to_db()

    with open("data/file_links.txt", "r") as file:
        for line in file:
            pdf_url = line.strip()
            try:
                # Fetch and process the PDF
                text_content = fetch_pdf_text(pdf_url)
                embedding = generate_embedding(text_content)
                
                # Insert into database
                insert_into_db(conn, pdf_url, text_content, embedding)
                print(f"Inserted {pdf_url} successfully.")
            except Exception as e:
                print(f"Failed to process {pdf_url}: {e}")

    conn.close()

if __name__ == "__main__":
    main()
