async function getToken() {
  const res = await fetch('/.netlify/functions/getToken');
  const data = await res.json();
  return data.access_token;
}

async function searchArtist() {
  const query = document.getElementById('search').value;
  const token = await getToken();

  const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();
  document.getElementById('output').textContent = JSON.stringify(data, null, 2);
}
