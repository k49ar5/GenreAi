import requests
import os
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

i = 0
download_dir = "rock_mp3"
os.makedirs(download_dir, exist_ok=True)

# Retry logic
session = requests.Session()
retries = Retry(
    total=3,
    backoff_factor=1,
    status_forcelist=[500, 502, 503, 504],
    raise_on_status=False,
)
session.mount("https://", HTTPAdapter(max_retries=retries))

# Wczytaj linki
with open("podglad_url_rock.txt", "r") as f:
    lines = [line.strip() for line in f if line.strip()]

preview_urls = [
    line.lstrip("- ").strip()
    for line in lines
    if line.startswith("- https://p.scdn.co/mp3-preview/")
]

print(f"Znaleziono {len(preview_urls)} linków do pobrania.")

# Pobieranie z pomijaniem błędów
for url in preview_urls:
    try:
        response = session.get(url, stream=True, timeout=10)
        response.raise_for_status()
        filepath = os.path.join(download_dir, f"rock{i}.mp3")
        with open(filepath, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        print(f"[✓] Pobrano: {filepath}")
        i += 1
    except requests.exceptions.RequestException as e:
        print(f"[×] Pominięto {url}: {e}")
        # Można też zapisywać do logu:
        with open("bledy_pobierania.log", "a") as log:
            log.write(f"{url} - {e}\n")
