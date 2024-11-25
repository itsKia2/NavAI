from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
import requests
from urllib.parse import urljoin

# Configure Selenium to use ChromeDriver
chrome_options = Options()
chrome_options.add_argument("--headless") 
chrome_options.add_argument("--log-level=3")
chrome_service = Service(executable_path="chromedriver.exe") 

# Scrapes for PDF files on the websites and in the tables
# Tables are generated dynamically so I had to use selenium for the pages to load
def scrape_for_pdf(url):
    # Initialize Selenium and open the webpage
    driver = webdriver.Chrome(service=chrome_service, options=chrome_options)
    driver.get(url)

    html = driver.page_source

    # Parse the HTML with Beautiful Soup
    soup = BeautifulSoup(html, 'html.parser')

    pdf_links = soup.find_all('a',href=lambda x: x and x.endswith('.pdf'))
    for link in pdf_links:
        full_url = urljoin("https://www.iso-ne.com",link['href'])
        print(full_url) 
    
    driver.quit()


# Scrapes for urls
def scrape_for_links(url):

    keywords = "/participate/rules-procedures/"
    # Sends a request to the url and parses through the HTML
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')

    links = []

    # Parses through HTML to find url links
    for link in soup.find_all('a', href=True):
        full_url = urljoin("https://www.iso-ne.com", link['href'])
        # Checks for urls strictly in the rules and procedures
        if keywords in full_url:
            # Checks for no repeating links and doesn't go to the nerc or npcc website
            if full_url not in links and not ("nerc.com" in full_url) and not ("npcc.org" in full_url):
                links.append(full_url)

    # Goes through each url to get PDF files            
    for link in links:
        print("\n")
        print(link)
        scrape_for_pdf(link)
        
url_start = "https://www.iso-ne.com/participate/rules-procedures"
scrape_for_links(url_start)