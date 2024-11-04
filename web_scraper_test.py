from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time

# --------------------- Configuration ---------------------

# Path to your ChromeDriver executable
CHROME_DRIVER_PATH = "C:\\Users\\yraza\\Downloads\\chromedriver-win64\\chromedriver-win64\\chromedriver.exe"

# Starting URL
START_URL = "https://www.iso-ne.com/participate/rules-procedures"

# Keywords to filter relevant URLs
KEYWORD = "/participate/rules-procedures/"

# Domains to exclude
EXCLUDE_DOMAINS = ["nerc.com", "npcc.org"]

# Delay settings (in seconds)
PAGE_LOAD_DELAY = 3
LINK_EXTRACTION_DELAY = 1


# --------------------- Setup WebDriver ---------------------

def setup_webdriver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode
    chrome_options.add_argument("--log-level=3")  # Suppress logs

    service = Service(executable_path=CHROME_DRIVER_PATH)
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

# ----------------------------------------------------------

# --------------------- PDF Scraper Class ---------------------

class PDFScraper:
    def __init__(self, driver, start_url, keyword, exclude_domains):
        self.driver = driver
        self.start_url = start_url
        self.keyword = keyword
        self.exclude_domains = exclude_domains
        self.pdf_links_set = set()
        self.visited_urls = set()
        self.pdf_count = 0

    def scrape_pdfs(self):
        queue = [self.start_url]

        while queue:
            current_url = queue.pop(0)
            if current_url in self.visited_urls:
                continue
            self.visited_urls.add(current_url)

            print(f"Scraping Page: {current_url}")
            try:
                self.driver.get(current_url)
                time.sleep(PAGE_LOAD_DELAY)  # Wait for the page to load

                html = self.driver.page_source
                soup = BeautifulSoup(html, 'html.parser')

                # Extract PDF links on the current page
                pdf_links = soup.find_all('a', href=lambda x: x and x.lower().endswith('.pdf'))
                for link in pdf_links:
                    href = link['href']
                    full_url = urljoin("https://www.iso-ne.com", href)
                    if full_url not in self.pdf_links_set:
                        print(f"Found PDF: {full_url}")
                        self.pdf_links_set.add(full_url)
                        self.pdf_count += 1

                # Extract sub-page links within the specified keyword and excluding certain domains
                sub_page_links = []
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    full_url = urljoin("https://www.iso-ne.com", href)
                    parsed_url = urlparse(full_url)

                    # Filter based on keyword and exclude domains
                    if (self.keyword in parsed_url.path and
                        not any(excl in full_url for excl in self.exclude_domains)):

                        # Normalize URL by removing fragments and query parameters
                        normalized_url = parsed_url.scheme + "://" + parsed_url.netloc + parsed_url.path
                        if normalized_url not in self.visited_urls and normalized_url not in queue:
                            sub_page_links.append(normalized_url)

                print(f"Found {len(sub_page_links)} sub-page links on {current_url}")
                queue.extend(sub_page_links)

                # Politeness delay to prevent server overload
                time.sleep(LINK_EXTRACTION_DELAY)

            except Exception as e:
                print(f"Error scraping {current_url}: {e}")

        print("\n--- Scraping Completed ---")
        print(f"Total unique PDFs found: {self.pdf_count}")
        return self.pdf_links_set

# ----------------------------------------------------------

# --------------------- Main Execution ---------------------

def main():
    # Initialize WebDriver
    driver = setup_webdriver()

    # Initialize PDFScraper
    scraper = PDFScraper(
        driver=driver,
        start_url=START_URL,
        keyword=KEYWORD,
        exclude_domains=EXCLUDE_DOMAINS
    )

    # Start scraping
    pdf_links = scraper.scrape_pdfs()

    # Optionally, save the PDF links to a file
    with open('iso_ne_pdf_links.txt', 'w') as f:
        for link in pdf_links:
            f.write(link + '\n')

    # Close the WebDriver
    driver.quit()

if __name__ == "__main__":
    main()