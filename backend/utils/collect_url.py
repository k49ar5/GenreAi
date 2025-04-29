import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

# Uwierzytelnienie
sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    client_id="6607f303cfd846c08da458620faef38a",
    client_secret="c2a6d87f45dc413daa47398be2a1cdb4"
))

# URL playlisty
playlist_url = "https://open.spotify.com/playlist/2PP4rHTuMem2eiOCxGunpt?si=25a9250ff41a42e9"
playlist_id = playlist_url.split("/")[-1].split("?")[0]

# Lista do przechowywania wyników
musick_info = []
limit = 100
offset = 0

# Pętla pobierająca utwory z playlisty
while True:
    results = sp.playlist_tracks(playlist_id, limit=limit, offset=offset)
    items = results['items']

    if not items:
        break  # brak więcej utworów

    for item in items:
        track = item.get('track')
        if track and 'external_urls' in track and 'spotify' in track['external_urls']:
            track_name = track['name']
            artist_name = track['artists'][0]['name']
            spotify_url = track['external_urls']['spotify']

            # Zapisanie danych w odpowiednim formacie
            musick_info.append(f"{track_name} by {artist_name} - {spotify_url}")

    offset += limit

# Zapis do pliku
with open("linki_info_rock.txt", "w", encoding="utf-8") as f:
    for info in musick_info:
        f.write(info + "\n")

print(f"Zapisano {len(musick_info)} utworów do pliku linki_info.txt.")
