const state = {
  currentPage: window.location.pathname,
};

const BASE_URL = 'https://api.spotify.com/v1/';

const getToken = async () => {
  const res = await fetch('/.netlify/functions/getToken');
  const data = await res.json();
  return data.access_token;
};

const convertMsToMinutes = (ms) => {
  if (!ms) return 'duration';
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const showResultsView = () => {
  const results = document.querySelector('.search-results');
  const details = document.getElementById('popular-tracks-container');
  if (results) results.style.display = 'flex';
  if (details) details.style.display = 'none';
};

const showDetailsView = () => {
  const results = document.querySelector('.search-results');
  const details = document.getElementById('popular-tracks-container');
  if (results) results.style.display = 'none';
  if (details) details.style.display = 'flex';
};

const createSidebar = () => {
  const sidebar = document.createElement('div');
  sidebar.classList.add('sidebar');
  return sidebar;
};

const createBestResultCard = (track) => {
  const bestTrackRow = document.createElement('div');
  bestTrackRow.classList.add('best-track-card');

  const img = document.createElement('img');
  img.classList.add('cover-img');
  img.src = track.album.images[0]?.url || './media/default-cover.png';
  img.alt = track.name ? `${track.name} cover` : 'Cover';
  img.style.display = 'block';
  img.loading = 'lazy'

  // const play = document.createElement('a');
  // play.classList.add('play-btn');
  // play.style.position = 'absolute';
  // play.style.top = '45%';
  // play.style.left = '40%';
  // play.style.transform = 'translate(-50%, -50%)';
  // play.href = track.external_urls.spotify;
  // play.target = '_blank';

  // const playIcon = document.createElement('i');
  // playIcon.classList.add('fa-solid', 'fa-play', 'play-icon');

  const info = document.createElement('div');
  info.classList.add('best-track-info');

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
  bestTrackRow.appendChild(img);
  bestTrackRow.appendChild(info);

  return bestTrackRow;
};

const createTrackCard = (track, number = null) => {
  const row = document.createElement('div');
  row.classList.add('track-row');

  if (number !== null) {
    const listNumber = document.createElement('p');
    listNumber.classList.add('list-number');
    listNumber.textContent = number;
    row.appendChild(listNumber);
  }

  const imgContainer = document.createElement('div');
  imgContainer.style.position = 'relative';

  const img = document.createElement('img');
  img.classList.add('cover-img');
  img.src = track.album.images[2]?.url || './media/default-cover.png';
  img.alt = track.name ? `${track.name} cover` : 'Cover';
  img.style.display = 'block';
  img.loading = 'lazy'

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

  info.appendChild(title);
  info.appendChild(artistsContainer);
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
};

const createAlbumCover = (album) => {
  const card = document.createElement('a');
  card.classList.add('album-card');
  card.href = `/album.html?id=${album.id}`;

  const img = document.createElement('img');
  img.classList.add('album-card-cover');
  img.src = album.images?.[0]?.url || './media/default-cover.png';
  img.alt = album.name || 'Album cover';
  img.loading = 'lazy'

  const name = document.createElement('p');
  name.classList.add('album-card-name');
  name.textContent = album.name || 'Album name';

  const info = document.createElement('div');
  info.classList.add('album-card-info');

  const year = document.createElement('span');
  year.classList.add('album-card-year');
  year.textContent = album.release_date
    ? album.release_date.slice(0, 4)
    : 'Year';

  const dot = document.createElement('span');
  dot.textContent = ' • ';

  const type = document.createElement('span');
  type.classList.add('album-card-type');
  type.textContent = album.album_type
    ? album.album_type.charAt(0).toUpperCase() + album.album_type.slice(1)
    : 'Type';

  info.appendChild(year);
  info.appendChild(dot);
  info.appendChild(type);
  card.appendChild(img);
  card.appendChild(name);
  card.appendChild(info);

  return card;
};

const createSearch = (tracks) => {
  const spotifyCard = document.createElement('div');
  spotifyCard.classList.add('spotify-card');

  const searchResults = document.createElement('div');
  searchResults.classList.add('search-results');

  const bestTrackContainer = document.createElement('div');
  bestTrackContainer.id = 'best-track-container';

  const bestTrackHeader = document.createElement('h2');
  bestTrackHeader.textContent = 'Best result';

  const bestCard = createBestResultCard(tracks[0]);

  const tracksContainer = document.createElement('div');
  tracksContainer.id = 'tracks-container';

  const tracksHeader = document.createElement('h2');
  tracksHeader.textContent = 'Tracks';
  tracksContainer.appendChild(tracksHeader);

  tracks.forEach((track) => {
    tracksContainer.appendChild(createTrackCard(track));
  });

  bestTrackContainer.appendChild(bestTrackHeader);
  bestTrackContainer.appendChild(bestCard);
  spotifyCard.appendChild(bestTrackContainer);
  searchResults.appendChild(bestTrackContainer);
  searchResults.appendChild(tracksContainer);
  spotifyCard.appendChild(searchResults);

  return spotifyCard;
};

const createArtist = (data, tracks = [], albums = []) => {
  const spotifyCard = document.createElement('div');
  spotifyCard.classList.add('spotify-card');

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
  image.src = data.images?.[1]?.url || './media/default-cover.png';
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
  followers.textContent = `${
    data.followers?.total?.toLocaleString() ?? ''
  } listeners this month`;

  const popularHeader = document.createElement('h2');
  popularHeader.textContent = 'Popular';

  const popularTracksContainer = document.createElement('div');
  popularTracksContainer.id = 'popular-tracks-container';
  popularTracksContainer.appendChild(popularHeader);

  tracks.forEach((track, index) => {
    popularTracksContainer.appendChild(createTrackCard(track, index + 1));
  });

  const discographyHeader = document.createElement('h2');
  discographyHeader.textContent = 'Discography';

  const albumsContainer = document.createElement('div');
  albumsContainer.id = 'artist-albums-container';

  albums.forEach((album) => {
    albumsContainer.appendChild(createAlbumCover(album));
  });

  p.appendChild(verifiedIcon);
  p.append(verifiedText);
  heroInfo.appendChild(p);
  heroInfo.appendChild(name);
  heroInfo.appendChild(followers);
  heroInner.appendChild(image);
  heroInner.appendChild(heroInfo);
  hero.appendChild(heroInner);
  spotifyCard.appendChild(hero);
  spotifyCard.appendChild(popularTracksContainer);
  spotifyCard.appendChild(discographyHeader);
  spotifyCard.appendChild(albumsContainer);

  return spotifyCard;
};

const displaySearch = async (e) => {
  e.preventDefault();

  const main = document.querySelector('main');
  main.innerHTML = '';

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

  const content = createSearch(tracks);

  main.appendChild(createSidebar());
  main.appendChild(content);

  showResultsView();
};

const displayArtist = async () => {
  const params = new URLSearchParams(window.location.search);
  const artistId = params.get('id');

  const main = document.querySelector('main');
  main.innerHTML = '';

  const token = await getToken();

  const [artistRes, topTracksRes, topAlbumsRes] = await Promise.all([
    fetch(`${BASE_URL}artists/${encodeURIComponent(artistId)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    fetch(`${BASE_URL}artists/${encodeURIComponent(artistId)}/top-tracks`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    fetch(`${BASE_URL}artists/${encodeURIComponent(artistId)}/albums?limit=8`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  ]);

  const artistData = await artistRes.json();
  const topTracksData = await topTracksRes.json();
  const topAlbumsData = await topAlbumsRes.json();

  const tracks = topTracksData.tracks;
  const albums = topAlbumsData.items;

  const content = createArtist(artistData, tracks, albums);

  main.appendChild(createSidebar());
  main.appendChild(content);
};

const init = () => {
  const form = document.getElementById('form');
  if (form) {
    form.addEventListener('submit', displaySearch);
    if (state.currentPage.endsWith('/artist.html')) {
      showDetailsView();
    }
  }
  if (state.currentPage.endsWith('/artist.html')) {
    displayArtist();
  } else {
    console.warn('Page not recognized:', state.currentPage);
  }
};

init();
