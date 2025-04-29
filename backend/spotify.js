require('dotenv').config({ path: 'config/.env' });
const axios = require('axios');
const fs = require('fs');
const spotifyPreviewFinder = require('spotify-preview-finder');

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Funkcja do uzyskania tokenu dostępu z Spotify
async function getAccessToken() {
  const auth = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching access token:', error.message);
    return null;
  }
}

// Funkcja do odczytania pliku z linkami do Spotify
async function readSpotifyLinksFromFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return data.split('\n').filter(line => line.trim() !== ''); // Usuwanie pustych linii
  } catch (error) {
    console.error('Error reading file:', error.message);
    return [];
  }
}

// Zaktualizowana funkcja do szukania podglądu piosenki
async function findPreview(trackUrl) {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.error('Unable to get access token');
      return;
    }

    const trackId = trackUrl.split('/').pop();
    const trackInfo = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const trackName = trackInfo.data.name;
    const artistName = trackInfo.data.artists.map(artist => artist.name).join(', ');

    // Szukaj tylko jednego wyniku
    const result = await spotifyPreviewFinder(`${trackName} ${artistName}`, 1);

    if (result.success && result.results.length > 0) {
      const song = result.results[0];  // tylko pierwszy wynik

      let previewText = `\nSong: ${song.name}\nSpotify URL: ${song.spotifyUrl}\nPreview URLs:\n`;
      song.previewUrls.forEach(url => {
        previewText += `- ${url}\n`;
      });

      fs.appendFileSync('podglad_url_rock.txt', previewText);
    } else {
      console.error('Brak wyników lub błąd:', result.error || 'Brak podglądu');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Główna funkcja do przetwarzania pliku
async function processSpotifyLinks(filePath) {
  const links = await readSpotifyLinksFromFile(filePath);
  for (const link of links) {
    console.log(`Processing: ${link}`);
    await findPreview(link);
  }
}

// Wywołanie funkcji
processSpotifyLinks('linki_info_rock.txt');
