const state = {
  currentPage: window.location.pathname,
};

const BASE_URL = 'https://api.spotify.com/v1/';

async function getToken() {
  const res = await fetch('/.netlify/functions/getToken');
  const data = await res.json();
  return data.access_token;
}

function createTrackCard(track) {
  const row = document.createElement('div');
  row.classList.add('track-row');

  const imgContainer = document.createElement('div');
  imgContainer.style.position = 'relative';

  const img = document.createElement('img');
  img.classList.add('cover-img');
  img.src = track.album.images[2]?.url || './media/default-cover.png';
  img.alt = track.name ? `${track.name} cover` : 'Cover';
  img.style.display = 'block';

  const play = document.createElement('a');
  play.classList.add('play-btn');
  play.style.position = 'absolute';
  play.style.top = '45%';
  play.style.left = '40%';
  play.style.transform = 'translate(-50%, -50%)';
  play.href = track.external_urls.spotify;
  play.target = '_blank';

  const playIcon = document.createElement('i');
  playIcon.classList.add('fa-solid', 'fa-play', 'play-icon');

  const info = document.createElement('div');
  info.classList.add('track-info');

  const title = document.createElement('h3');
  title.textContent = track.name || 'track name';

  const artistsContainer = document.createElement('div');

  track.artists.forEach((artist, index) => {
    const artistText = document.createElement('a');
    artistText.textContent = artist.name || 'artist';
    artistText.href = `/artist.html?id=${artist.id}`;
    artistText.classList.add('artist');
    artistsContainer.appendChild(artistText);

    if (index < track.artists.length - 1) {
      const comma = document.createElement('span');
      comma.classList.add('comma');
      comma.textContent = ',';
      comma.style.color = '#bbbbbb';
      artistsContainer.appendChild(comma);
    }
  });

  info.appendChild(title);
  info.appendChild(artistsContainer);

  const save = document.createElement('button');
  save.classList.add('save-btn');

  const saveIcon = document.createElement('i');
  saveIcon.classList.add('fa-solid', 'fa-circle-plus', 'scalable');

  saveIcon.addEventListener('click', () => {
    const isFavorite = saveIcon.classList.toggle('isFavorite');
    if (isFavorite) {
      saveIcon.classList.replace('fa-circle-plus', 'fa-circle-check');
    } else {
      saveIcon.classList.replace('fa-circle-check', 'fa-circle-plus');
    }
  });

  const duration = document.createElement('span');
  duration.textContent = convertMsToMinutes(track.duration_ms);

  const elipsis = document.createElement('button');
  elipsis.classList.add('elipsis-btn');

  const elipsisIcon = document.createElement('i');
  elipsisIcon.classList.add('fa-solid', 'fa-ellipsis', 'scalable');

  play.appendChild(playIcon);
  save.appendChild(saveIcon);
  elipsis.appendChild(elipsisIcon);
  imgContainer.appendChild(img);
  imgContainer.appendChild(play);
  row.appendChild(imgContainer);
  row.appendChild(info);
  row.appendChild(save);
  row.appendChild(duration);
  row.appendChild(elipsis);

  return row;
}

async function searchSong(e) {
  e.preventDefault();

  const tracksContainer = document.getElementById('tracks-container');
  const searchField = document.getElementById('search');
  const query = searchField.value;
  const token = await getToken();
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      query
    )}&type=track`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();
  const tracks = data.tracks.items;

  tracksContainer.innerHTML = '';

  if (tracks.length === 0) {
    tracksContainer.textContent = 'No tracks found.';
    return;
  }

  const tracksHeader = document.createElement('h2');
  tracksHeader.textContent = 'Tracks';
  tracksContainer.appendChild(tracksHeader);

  tracks.forEach((track) => {
    const card = createTrackCard(track);
    tracksContainer.appendChild(card);
  });
}

async function displayArtist() {
  const params = new URLSearchParams(window.location.search);
  const artistId = params.get('id');

  const token = await getToken();
  const res = await fetch(
    `${BASE_URL}artists/${encodeURIComponent(artistId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  const spotifyCard = document.querySelector('.spotify-card');
  console.log(spotifyCard);

  const hero = document.createElement('div');
  const bgImage = data.images?.[0]?.url;
  hero.classList.add('artist-hero');
  if (bgImage) {
    hero.style.backgroundImage = `
    linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)),
    url(${bgImage})
  `;
  } else {
    hero.style.backgroundImage = `
    linear-gradient(135deg, #1c1c1c, #121212)
  `;
  }
  hero.style.backgroundSize = 'cover';
  hero.style.backgroundPosition = 'center';
  hero.style.backgroundRepeat = 'no-repeat';

  const heroInner = document.createElement('div');
  heroInner.classList.add('hero-inner');

  const image = document.createElement('img');
  image.classList.add('artist-hero-img');
  image.src = data.images[1]?.url || './media/default-cover.png';
  image.alt = data.name ? `Picture of ${data.name}` : 'Artist picture';
  image.loading = 'lazy';

  const heroInfo = document.createElement('div');
  heroInfo.classList.add('artist-hero-info');

  const p = document.createElement('p');
  p.classList.add('artist-verified');

  const verifiedText = document.createTextNode('Verified artist');

  const verifiedIcon = document.createElement('i');
  verifiedIcon.classList.add('fa-solid', 'fa-certificate');

  const name = document.createElement('h1');
  name.classList.add('artist-name');
  name.textContent = data.name;

  const followers = document.createElement('p');
  followers.classList.add('artist-followers');
  followers.textContent = `${data.followers.total.toLocaleString()} listeners this month`;

  const popularHeader = document.createElement('h2');
  popularHeader.textContent = 'Popular';

  p.appendChild(verifiedIcon);
  p.append(verifiedText);

  heroInfo.appendChild(p);
  heroInfo.appendChild(name);
  heroInfo.appendChild(followers);

  heroInner.appendChild(image);
  heroInner.appendChild(heroInfo);

  hero.appendChild(heroInner);

  spotifyCard.appendChild(hero);
  spotifyCard.appendChild(popularHeader);
}

function convertMsToMinutes(ms) {
  if (!ms) return 'duration';
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const init = () => {
  const page = state.currentPage;
  if (page.endsWith('/') || page.endsWith('/index.html')) {
    const form = document.getElementById('form');
    if (!form) return;
    form.addEventListener('submit', searchSong);
  } else if (page.endsWith('/artist.html')) {
    displayArtist();
  } else {
    console.warn('Page not recognized:', page);
  }
};

init();
