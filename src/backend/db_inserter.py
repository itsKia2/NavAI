import psycopg2
import os

def connect_to_db():
    conn = psycopg2.connect(
        host=os.getenv("Saws-0-us-west-1.pooler.supabase.com"),
        database=os.getenv("postgres"),
        user=os.getenv("postgres.bfbfuhypbbknbetwsbcw"),
        password=os.getenv("NavAIRocks123"),
        port="6543"
    )
    return conn

def insert_into_db(conn, file_url, content, embedding):
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO pdf_documents (file_url, content, embedding) VALUES (%s, %s, %s)",
        (file_url, content, embedding)
    )
    conn.commit()
    cursor.close()
