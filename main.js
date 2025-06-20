const tracksContainer = document.getElementById('tracks-container');
const form = document.getElementById('form');

async function getToken() {
  const res = await fetch('/.netlify/functions/getToken');
  const data = await res.json();
  return data.access_token;
}

async function searchSong(e) {
  e.preventDefault();

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

  tracks.forEach((track) => {
    const card = createTrackCard(track);
    tracksContainer.appendChild(card);
  });
}

function createTrackCard(track) {
  const row = document.createElement('div');
  row.classList.add('track-row');

  const imgContainer = document.createElement('div');
  imgContainer.style.position = 'relative';

  const img = document.createElement('img');
  img.src = track.album.images[2]?.url || track.album.images[0]?.url || '';
  img.alt = `${track.name} cover`;
  img.style.display = 'block';

  const play = document.createElement('button');
  play.classList.add('play-btn');
  play.style.visibility = 'hidden';
  play.style.position = 'absolute';
  play.style.top = '50%';
  play.style.left = '50%';
  play.style.transform = 'translate(-100%, -50%)';

  const playIcon = document.createElement('i');
  playIcon.classList.add('fa-solid', 'fa-play', 'play-icon');

  const info = document.createElement('div');
  info.classList.add('track-info');

  const title = document.createElement('h3');
  title.textContent = track.name;

  const artist = document.createElement('p');
  artist.textContent = track.artists.map((a) => a.name).join(', ');

  info.appendChild(title);
  info.appendChild(artist);

  const save = document.createElement('button');
  save.classList.add('save-btn');

  const saveIcon = document.createElement('i');
  saveIcon.classList.add('fa-solid', 'fa-circle-plus');
  saveIcon.style.visibility = 'hidden';

  const duration = document.createElement('span');
  duration.textContent = convertMsToMinutes(track.duration_ms);

  const elipsis = document.createElement('button');
  elipsis.classList.add('elipsis-btn');

  const elipsisIcon = document.createElement('i');
  elipsisIcon.classList.add('fa-solid', 'fa-ellipsis');
  elipsisIcon.style.visibility = 'hidden';

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
  
  row.addEventListener('mouseenter', () => {
    saveIcon.style.visibility = 'visible';
    elipsisIcon.style.visibility = 'visible';
    img.style.opacity = '0.5';
    play.style.visibility = 'visible';
  });
  
  row.addEventListener('mouseleave', () => {
    saveIcon.style.visibility = 'hidden';
    elipsisIcon.style.visibility = 'hidden';
    img.style.opacity = '1';
    play.style.visibility = 'hidden';
  });

  return row;
}

const onRowClick = () => {};

function convertMsToMinutes(ms) {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const init = () => {
  form.addEventListener('submit', searchSong);
};

init();
