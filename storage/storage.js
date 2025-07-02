const ALBUMS_KEY = 'favorite-albums';
const TRACKS_KEY = 'favorite-tracks';

export const getFavoriteAlbums = () => {
  return JSON.parse(localStorage.getItem(ALBUMS_KEY)) || [];
};

export const loadFavoriteAlbums = () => {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) {
    console.log('Sidebar element not found');
    return;
  }
  sidebar.innerHTML = '';
  const albums = getFavoriteAlbums();

  albums.forEach((album) => {
    const albumLink = document.createElement('a');
    albumLink.classList.add('side-tab');
    albumLink.href = `/album.html?id=${album.id}`;

    const albumImg = document.createElement('img');
    albumImg.classList.add('side-tab-img');
    albumImg.src = album.images?.[0]?.url || 'media/default-cover.png';
    albumImg.alt = `${album.name} cover`;

    albumLink.appendChild(albumImg);
    sidebar.appendChild(albumLink);
  });
};

export const saveFavoriteAlbum = (album) => {
  const albums = getFavoriteAlbums();
  if (!albums.find((a) => a.id === album.id)) {
    albums.push(album);
    localStorage.setItem(ALBUMS_KEY, JSON.stringify(albums));
    console.log('Album saved:', album);
  }
};

export const removeFavoriteAlbum = (album) => {
  const albums = getFavoriteAlbums();
  const filteredAlbums = albums.filter((a) => a.id !== album.id);
  localStorage.setItem(ALBUMS_KEY, JSON.stringify(filteredAlbums));
};

export const getFavoriteTracks = () => {
  return JSON.parse(localStorage.getItem(TRACKS_KEY)) || [];
};

export const saveFavoriteTrack = (track) => {
  const tracks = getFavoriteTracks();
  if (!tracks.find((t) => t.id === track.id)) {
    tracks.push(track);
    localStorage.setItem(TRACKS_KEY, JSON.stringify(tracks));
  }
};

export const removeFavoriteTrack = (track) => {
  const tracks = getFavoriteTracks();
  const filteredTracks = tracks.filter((t) => t.id !== track.id);
  localStorage.setItem(TRACKS_KEY, JSON.stringify(filteredTracks));
};
