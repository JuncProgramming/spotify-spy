const ALBUMS_KEY = 'favorite-albums';
const TRACKS_KEY = 'favorite-tracks';

export const getFavoriteAlbums = () => {
  return JSON.parse(localStorage.getItem(ALBUMS_KEY)) || [];
};

export const loadFavoriteAlbums = () => {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) {
    console.warn('Sidebar element not found');
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

export const loadFavoriteTracks = () => {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) {
    console.warn('Sidebar element not found');
    return;
  }

  const tracks = getFavoriteTracks();

  if (tracks.length > 0) {
    const existing = sidebar.querySelector('a[href="/favorites.html"]');
    if (!existing) {
      const favoriteLink = document.createElement('a');
      favoriteLink.classList.add('side-tab');
      favoriteLink.href = '/favorites.html';

      const favoriteImg = document.createElement('img');
      favoriteImg.classList.add('side-tab-img');
      favoriteImg.src = 'media/liked-songs.jpg';
      favoriteImg.alt = 'Favorite tracks cover';

      favoriteLink.appendChild(favoriteImg);
      sidebar.appendChild(favoriteLink);
    }
  }
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
