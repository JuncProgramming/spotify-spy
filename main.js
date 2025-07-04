import {
  getFavoriteAlbums,
  loadFavoriteAlbums,
  saveFavoriteAlbum,
  removeFavoriteAlbum,
  getFavoriteTracks,
  loadFavoriteTracks,
  saveFavoriteTrack,
  removeFavoriteTrack,
} from './storage/storage.js';

const state = {
  currentPage: window.location.pathname,
};

const BASE_URL = 'https://api.spotify.com/v1/';

const getToken = async () => {
  const res = await fetch('/.netlify/functions/getToken');
  const data = await res.json();
  return data.access_token;
};

const convertDuration = (ms, isTrackFormat = true) => {
  if (!ms) return 'duration';

  if (isTrackFormat) {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);

  if (hours > 0) {
    if (mins === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${mins.toString().padStart(2, '0')} min`;
    }
  } else {
    return `${mins} min`;
  }
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

const createDotSpacer = () => {
  const dot = document.createElement('span');
  dot.textContent = '•';
  return dot;
};

const createEmptyElement = () => {
  const headerEmpty = document.createElement('span');
  headerEmpty.textContent = '';
  return headerEmpty;
};

const createSidebar = () => {
  const sidebar = document.createElement('div');
  sidebar.classList.add('sidebar');
  return sidebar;
};

const createBestResultCard = (track) => {
  const bestTrackRow = document.createElement('div');
  bestTrackRow.classList.add('best-track-card');

  const mainContent = document.createElement('div');
  mainContent.classList.add('best-track-row-main');

  const img = document.createElement('img');
  img.classList.add('cover-img');
  img.src = track.album.images[0]?.url || './media/default-cover.png';
  img.alt = track.name ? `${track.name} cover` : 'Cover';
  img.style.display = 'block';
  img.loading = 'lazy';

  const play = document.createElement('a');
  play.classList.add('green-play-btn');
  play.href = track.external_urls.spotify;
  play.target = '_blank';

  play.addEventListener('click', (e) => {
    e.preventDefault();
    window.open(track.album.external_urls.spotify, '_blank');
    window.location.href = `/album.html?id=${track.album.id}`;
  });

  const playIcon = document.createElement('i');
  playIcon.classList.add('fa-solid', 'fa-play', 'play-icon');

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

  bestTrackRow.addEventListener('mouseenter', () => {
    play.classList.remove('animated-out');
    play.classList.add('animated-in');
  });

  bestTrackRow.addEventListener('mouseleave', () => {
    play.classList.remove('animated-in');
    play.classList.add('animated-out');
  });

  play.appendChild(playIcon);
  info.appendChild(title);
  info.appendChild(artistsContainer);
  mainContent.appendChild(img);
  mainContent.appendChild(info);
  bestTrackRow.appendChild(mainContent);
  bestTrackRow.appendChild(play);

  return bestTrackRow;
};

const createTrackCard = (track, number = null) => {
  const row = document.createElement('div');
  row.classList.add('track-row');

  const imgContainer = document.createElement('div');
  imgContainer.style.position = 'relative';

  const img = document.createElement('img');
  img.style.position = 'relative';
  img.style.zIndex = '1';
  img.src = track.album.images[2]?.url || './media/default-cover.png';
  img.alt = track.name ? `${track.name} cover` : 'Cover';
  img.style.display = 'block';
  img.loading = 'lazy';

  if (number) {
    const numberContainer = document.createElement('div');
    numberContainer.classList.add('container-list-number');
    numberContainer.style.position = 'relative';

    const listNumber = document.createElement('p');
    listNumber.classList.add('list-number');
    listNumber.textContent = number;

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

    play.appendChild(playIcon);
    numberContainer.appendChild(play);
    numberContainer.appendChild(listNumber);
    row.appendChild(numberContainer);
  } else {
    img.classList.add('cover-img');

    const play = document.createElement('a');
    play.classList.add('play-btn');
    play.style.position = 'absolute';
    play.style.zIndex = '2';
    play.style.top = '45%';
    play.style.left = '40%';
    play.style.transform = 'translate(-50%, -50%)';
    play.href = track.external_urls.spotify;
    play.target = '_blank';

    const playIcon = document.createElement('i');
    playIcon.classList.add('fa-solid', 'fa-play', 'play-icon');

    play.appendChild(playIcon);
    imgContainer.appendChild(play);
  }

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

  const saveIcon = document.createElement('i');
  const isFavorite = getFavoriteTracks().some((t) => t.id === track.id);
  saveIcon.classList.add('fa-solid', isFavorite ? 'fa-check' : 'fa-plus');

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.classList.add('save-btn');
  if (isFavorite) {
    saveBtn.classList.add('saved');
  }
  saveIcon.classList.add(
    'fa-solid',
    'scalable',
    isFavorite ? 'fa-check' : 'fa-circle-plus'
  );

  const duration = document.createElement('span');
  duration.textContent = convertDuration(track.duration_ms);

  const elipsis = document.createElement('button');
  elipsis.classList.add('elipsis-btn');

  const elipsisIcon = document.createElement('i');
  elipsisIcon.classList.add('fa-solid', 'fa-ellipsis', 'scalable');

  info.appendChild(title);
  info.appendChild(artistsContainer);
  saveBtn.appendChild(saveIcon);
  saveBtn.addEventListener('click', () => {
    const favoriteTracks = getFavoriteTracks();
    const isFavorite = favoriteTracks.some((t) => t.id === track.id);
    if (!isFavorite) {
      saveFavoriteTrack(track);
      saveIcon.classList.replace('fa-plus', 'fa-check');
      saveBtn.classList.add('saved');
    } else {
      removeFavoriteTrack(track);
      saveIcon.classList.replace('fa-check', 'fa-plus');
      saveBtn.classList.remove('saved');
    }
    loadFavoriteTracks();
  });
  elipsis.appendChild(elipsisIcon);
  imgContainer.appendChild(img);
  row.appendChild(imgContainer);
  row.appendChild(info);
  row.appendChild(saveBtn);
  row.appendChild(duration);
  row.appendChild(elipsis);

  return row;
};

const createAlbumCover = (album) => {
  const card = document.createElement('a');
  card.classList.add('album-card');
  card.href = `/album.html?id=${album.id}`;

  const imageContainer = document.createElement('div');
  imageContainer.classList.add('album-card-image-container');

  const img = document.createElement('img');
  img.classList.add('album-card-cover');
  img.src = album.images?.[0]?.url || './media/default-cover.png';
  img.alt = album.name || 'Album cover';
  img.loading = 'lazy';

  const play = document.createElement('a');
  play.classList.add('album-cover-green-play-btn');

  play.addEventListener('click', (e) => {
    e.preventDefault();
    window.open(album.external_urls.spotify, '_blank');
    window.location.href = `/album.html?id=${album.id}`;
  });

  const playIcon = document.createElement('i');
  playIcon.classList.add('fa-solid', 'fa-play', 'play-icon');

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

  const type = document.createElement('span');
  type.classList.add('album-card-type');
  type.textContent = album.album_type
    ? album.album_type.charAt(0).toUpperCase() + album.album_type.slice(1)
    : 'Type';

  play.appendChild(playIcon);
  imageContainer.appendChild(img);
  imageContainer.appendChild(play);
  card.appendChild(imageContainer);
  info.appendChild(year);
  info.appendChild(createDotSpacer());
  info.appendChild(type);
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

const createMain = (newReleases) => {
  const spotifyCard = document.createElement('div');
  spotifyCard.classList.add('spotify-card');

  const newRealeasesContainer = document.createElement('div');
  newRealeasesContainer.id = 'new-releases-container';

  const sectionHeader = document.createElement('h2');
  sectionHeader.textContent = 'New Releases';

  const albumGridContainer = document.createElement('div');
  albumGridContainer.classList.add('album-grid-container');

  const albumGrid = document.createElement('div');
  albumGrid.classList.add('album-grid');

  newReleases.forEach((album) => {
    const albumCard = createAlbumCover(album);
    albumGrid.appendChild(albumCard);
  });

  albumGridContainer.appendChild(albumGrid);
  newRealeasesContainer.appendChild(sectionHeader);
  newRealeasesContainer.appendChild(albumGridContainer);
  spotifyCard.appendChild(newRealeasesContainer);

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

const createAlbum = (album, tracks) => {
  const spotifyCard = document.createElement('div');
  spotifyCard.classList.add('spotify-card');

  const albumHero = document.createElement('div');
  albumHero.classList.add('album-hero');

  const albumImgUrl = album.images?.[0]?.url;
  const imgForColor = new Image();
  imgForColor.crossOrigin = 'anonymous';
  imgForColor.src = albumImgUrl;

  imgForColor.onload = () => {
    const colorThief = new ColorThief();
    const [r, g, b] = colorThief.getColor(imgForColor);
    spotifyCard.style.setProperty('--album-accent', `rgb(${r}, ${g}, ${b})`);

    albumHero.style.background = `
    linear-gradient(to bottom, rgba(${r}, ${g}, ${b}, 1), rgba(${r}, ${g}, ${b}, 0))
  `;
  };

  if (!albumImgUrl) {
    albumHero.style.background = 'linear-gradient(135deg, #1c1c1c, #121212)';
  }

  const albumImg = document.createElement('img');
  albumImg.classList.add('album-hero-img');
  albumImg.src = album.images?.[0]?.url || 'media/default-cover.png';
  albumImg.alt = album.name + ' cover';

  const albumHeroInfo = document.createElement('div');
  albumHeroInfo.classList.add('album-hero-info');

  const albumType = document.createElement('span');
  albumType.classList.add('album-type');
  albumType.textContent = album.album_type
    ? album.album_type.charAt(0).toUpperCase() + album.album_type.slice(1)
    : 'Unknown type';

  const albumTitle = document.createElement('h1');
  albumTitle.classList.add('album-title');
  albumTitle.textContent = album.name || 'Unknown title';

  const albumMeta = document.createElement('div');
  albumMeta.classList.add('album-meta');

  const albumArtistsContainer = document.createElement('div');
  albumArtistsContainer.id = 'album-artists-container';

  album.artists.forEach((artist, index) => {
    const artistText = document.createElement('a');
    artistText.textContent = artist.name || 'artist';
    artistText.href = `/artist.html?id=${artist.id}`;
    artistText.classList.add('album-artist');
    albumArtistsContainer.appendChild(artistText);

    if (index < album.artists.length - 1) {
      const comma = document.createElement('span');
      comma.classList.add('comma');
      comma.textContent = ',';
      comma.style.color = '#ffffff';
      albumArtistsContainer.appendChild(comma);
    }
  });

  const albumYear = document.createElement('span');
  albumYear.classList.add('album-year');
  albumYear.textContent = album.release_date
    ? album.release_date.slice(0, 4)
    : '';

  const totalDuration = convertDuration(
    tracks.reduce((acc, cur) => acc + cur.duration_ms, 0),
    false
  );

  const albumTrackcount = document.createElement('span');
  albumTrackcount.classList.add('album-trackcount');
  // Duration here
  albumTrackcount.textContent = `${tracks.length} tracks, ${totalDuration}`;

  albumMeta.appendChild(albumArtistsContainer);
  albumMeta.appendChild(createDotSpacer());
  albumMeta.appendChild(albumYear);
  albumMeta.appendChild(createDotSpacer());
  albumMeta.appendChild(albumTrackcount);
  albumHeroInfo.appendChild(albumType);
  albumHeroInfo.appendChild(albumTitle);
  albumHeroInfo.appendChild(albumMeta);
  albumHero.appendChild(albumImg);
  albumHero.appendChild(albumHeroInfo);

  const albumControls = document.createElement('div');
  albumControls.classList.add('album-controls');

  const playBtn = document.createElement('a');
  playBtn.classList.add('album-btn', 'album-play-btn');
  const playIcon = document.createElement('i');
  playIcon.classList.add('fa-solid', 'fa-play');
  playBtn.href = tracks[0].external_urls.spotify;
  playBtn.target = '_blank';

  const isFavorite = getFavoriteAlbums().some((a) => a.id === album.id);
  const saveIcon = document.createElement('i');
  saveIcon.classList.add('fa-solid', isFavorite ? 'fa-check' : 'fa-plus');

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.classList.add('album-btn', 'album-save-btn');
  if (isFavorite) {
    saveBtn.classList.add('saved');
  }

  const moreBtn = document.createElement('button');
  moreBtn.classList.add('album-btn', 'album-more-btn');
  const moreIcon = document.createElement('i');
  moreIcon.classList.add('fa-solid', 'fa-ellipsis');

  const albumTracklistContainer = document.createElement('div');
  albumTracklistContainer.classList.add('album-tracklist-container');

  const albumTracklistHeader = document.createElement('div');
  albumTracklistHeader.classList.add('album-tracklist-header');

  const headerNumber = document.createElement('span');
  headerNumber.classList.add('album-tracklist-col', 'number');
  headerNumber.textContent = '#';

  const headerTitle = document.createElement('span');
  headerTitle.classList.add('album-tracklist-col', 'title');
  headerTitle.textContent = 'Tytuł';

  const headerPlays = document.createElement('div');
  headerPlays.classList.add('album-tracklist-col', 'plays');
  headerPlays.textContent = 'Odtworzenia';

  const headerTime = document.createElement('div');
  headerTime.classList.add('album-tracklist-col', 'time');
  const timeIcon = document.createElement('i');
  timeIcon.classList.add('fa-regular', 'fa-clock');

  playBtn.appendChild(playIcon);
  saveBtn.appendChild(saveIcon);
  moreBtn.appendChild(moreIcon);
  albumControls.appendChild(playBtn);
  albumControls.appendChild(saveBtn);
  saveBtn.addEventListener('click', () => {
    const favoriteAlbums = getFavoriteAlbums();
    const isFavorite = favoriteAlbums.some((a) => a.id === album.id);
    if (!isFavorite) {
      saveFavoriteAlbum(album);
      saveIcon.classList.replace('fa-plus', 'fa-check');
      saveBtn.classList.add('saved');
    } else {
      removeFavoriteAlbum(album);
      saveIcon.classList.replace('fa-check', 'fa-plus');
      saveBtn.classList.remove('saved');
    }
    loadFavoriteAlbums();
  });
  albumControls.appendChild(moreBtn);
  headerTime.appendChild(timeIcon);
  albumTracklistHeader.appendChild(headerNumber);
  albumTracklistHeader.appendChild(headerTitle);
  albumTracklistHeader.appendChild(headerPlays);
  albumTracklistHeader.appendChild(createEmptyElement());
  albumTracklistHeader.appendChild(headerTime);
  albumTracklistHeader.appendChild(createEmptyElement());
  albumTracklistContainer.appendChild(albumTracklistHeader);

  const albumTracklist = document.createElement('div');
  albumTracklist.classList.add('album-tracklist');

  tracks.forEach((track, index) => {
    const albumTrackRow = document.createElement('div');
    albumTrackRow.classList.add('track-row', 'album-track-row');

    const numberContainer = document.createElement('div');
    numberContainer.classList.add('container-list-number');
    numberContainer.style.position = 'relative';

    const number = document.createElement('p');
    number.classList.add('list-number', 'album-list-number');
    number.textContent = index + 1;

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

    play.appendChild(playIcon);
    numberContainer.appendChild(play);
    numberContainer.appendChild(number);
    albumTrackRow.appendChild(numberContainer);

    const infoDiv = document.createElement('div');
    infoDiv.classList.add('track-info');
    const trackName = document.createElement('h3');
    trackName.textContent = track.name;

    const artistsContainer = document.createElement('div');

    track.artists.forEach((artist, index) => {
      const artistText = document.createElement('a');
      artistText.textContent = artist.name || 'artist';
      artistText.href = `/artist.html?id=${artist.id}`;
      artistText.classList.add('album-artist');
      artistsContainer.appendChild(artistText);

      if (index < track.artists.length - 1) {
        const comma = document.createElement('span');
        comma.classList.add('comma');
        comma.textContent = ',';
        comma.style.color = '#bbbbbb';
        artistsContainer.appendChild(comma);
      }
    });

    const playInfo = document.createElement('div');
    playInfo.classList.add('play-info');
    // Random ass number, because the API doesn't return it :(
    playInfo.textContent = (
      Math.floor(Math.random() * (9000000 - 1000)) + 1000
    ).toLocaleString();

    const saveIcon = document.createElement('i');
    const isFavorite = getFavoriteTracks().some((t) => t.id === track.id);
    saveIcon.classList.add('fa-solid', isFavorite ? 'fa-check' : 'fa-plus');

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.classList.add('save-btn');
    if (isFavorite) {
      saveBtn.classList.add('saved');
    }
    saveIcon.classList.add(
      'fa-solid',
      'scalable',
      isFavorite ? 'fa-check' : 'fa-circle-plus'
    );

    const trackDuration = document.createElement('span');
    trackDuration.classList.add('album-track-duration');
    trackDuration.textContent = convertDuration(track.duration_ms);

    const elipsisBtn = document.createElement('button');
    elipsisBtn.classList.add('elipsis-btn', 'album-track-elipsis-btn');
    const elipsisIcon = document.createElement('i');
    elipsisIcon.classList.add('fa-solid', 'fa-ellipsis', 'scalable');

    numberContainer.appendChild(number);
    infoDiv.appendChild(trackName);
    infoDiv.appendChild(artistsContainer);
    saveBtn.addEventListener('click', () => {
      const favoriteTracks = getFavoriteTracks();
      const isFavorite = favoriteTracks.some((t) => t.id === track.id);
      if (!isFavorite) {
        saveFavoriteTrack(track);
        saveIcon.classList.replace('fa-plus', 'fa-check');
        saveBtn.classList.add('saved');
      } else {
        removeFavoriteTrack(track);
        saveIcon.classList.replace('fa-check', 'fa-plus');
        saveBtn.classList.remove('saved');
      }
      loadFavoriteTracks();
    });
    saveBtn.appendChild(saveIcon);
    elipsisBtn.appendChild(elipsisIcon);
    albumTrackRow.appendChild(numberContainer);
    albumTrackRow.appendChild(infoDiv);
    albumTrackRow.appendChild(playInfo);
    albumTrackRow.appendChild(saveBtn);
    albumTrackRow.appendChild(trackDuration);
    albumTrackRow.appendChild(elipsisBtn);
    albumTracklist.appendChild(albumTrackRow);
  });

  albumTracklistContainer.appendChild(albumTracklist);
  spotifyCard.appendChild(albumHero);
  spotifyCard.appendChild(albumControls);
  spotifyCard.appendChild(albumTracklistContainer);

  return spotifyCard;
};

const createFavorites = (tracks) => {
  const spotifyCard = document.createElement('div');
  spotifyCard.classList.add('spotify-card');

  const albumHero = document.createElement('div');
  albumHero.classList.add('album-hero');

  const albumImgUrl = '/media/liked-songs.jpg';
  const imgForColor = new Image();
  imgForColor.crossOrigin = 'anonymous';
  imgForColor.src = albumImgUrl;

  imgForColor.onload = () => {
    const colorThief = new ColorThief();
    const [r, g, b] = colorThief.getColor(imgForColor);
    spotifyCard.style.setProperty('--album-accent', `rgb(${r}, ${g}, ${b})`);

    albumHero.style.background = `
    linear-gradient(to bottom, rgba(${r}, ${g}, ${b}, 1), rgba(${r}, ${g}, ${b}, 0))
  `;
  };

  if (!albumImgUrl) {
    albumHero.style.background = 'linear-gradient(135deg, #1c1c1c, #121212)';
  }

  const albumImg = document.createElement('img');
  albumImg.classList.add('album-hero-img');
  albumImg.src = 'media/liked-songs.jpg';
  albumImg.alt = 'Liked songs cover';

  const albumHeroInfo = document.createElement('div');
  albumHeroInfo.classList.add('album-hero-info');

  const albumType = document.createElement('span');
  albumType.classList.add('album-type');
  albumType.textContent = 'Playlist';

  const albumTitle = document.createElement('h1');
  albumTitle.classList.add('album-title');
  albumTitle.textContent = 'Liked songs';

  const albumMeta = document.createElement('div');
  albumMeta.classList.add('album-meta');

  const albumArtistsContainer = document.createElement('div');
  albumArtistsContainer.id = 'album-artists-container';

  const artistText = document.createElement('a');
  artistText.textContent = 'User';
  artistText.classList.add('album-artist');

  const albumTrackcount = document.createElement('span');
  albumTrackcount.classList.add('album-trackcount');
  albumTrackcount.textContent = `${tracks.length} tracks`;

  albumArtistsContainer.appendChild(artistText);
  albumMeta.appendChild(albumArtistsContainer);
  albumMeta.appendChild(createDotSpacer());
  albumMeta.appendChild(albumTrackcount);
  albumHeroInfo.appendChild(albumType);
  albumHeroInfo.appendChild(albumTitle);
  albumHeroInfo.appendChild(albumMeta);
  albumHero.appendChild(albumImg);
  albumHero.appendChild(albumHeroInfo);

  const albumControls = document.createElement('div');
  albumControls.classList.add('album-controls');

  const playBtn = document.createElement('a');
  playBtn.classList.add('album-btn', 'album-play-btn');
  const playIcon = document.createElement('i');
  playIcon.classList.add('fa-solid', 'fa-play');
  if (tracks.length > 0) {
    playBtn.href = tracks[0].external_urls.spotify;
  }
  playBtn.target = '_blank';

  const moreBtn = document.createElement('button');
  moreBtn.classList.add('album-btn', 'album-more-btn');
  const moreIcon = document.createElement('i');
  moreIcon.classList.add('fa-solid', 'fa-ellipsis');

  const albumTracklistContainer = document.createElement('div');
  albumTracklistContainer.classList.add('album-tracklist-container');

  const albumTracklistHeader = document.createElement('div');
  albumTracklistHeader.classList.add('album-tracklist-header');

  const headerNumber = document.createElement('span');
  headerNumber.classList.add('album-tracklist-col', 'number');
  headerNumber.textContent = '#';

  const headerTitle = document.createElement('span');
  headerTitle.classList.add('album-tracklist-col', 'title');
  headerTitle.textContent = 'Tytuł';

  const headerPlays = document.createElement('div');
  headerPlays.classList.add('album-tracklist-col', 'plays');
  headerPlays.textContent = 'Odtworzenia';

  const headerTime = document.createElement('div');
  headerTime.classList.add('album-tracklist-col', 'time');
  const timeIcon = document.createElement('i');
  timeIcon.classList.add('fa-regular', 'fa-clock');

  playBtn.appendChild(playIcon);
  moreBtn.appendChild(moreIcon);
  albumControls.appendChild(playBtn);
  albumControls.appendChild(moreBtn);
  headerTime.appendChild(timeIcon);
  albumTracklistHeader.appendChild(headerNumber);
  albumTracklistHeader.appendChild(headerTitle);
  albumTracklistHeader.appendChild(headerPlays);
  albumTracklistHeader.appendChild(createEmptyElement());
  albumTracklistHeader.appendChild(headerTime);
  albumTracklistHeader.appendChild(createEmptyElement());
  albumTracklistContainer.appendChild(albumTracklistHeader);

  const albumTracklist = document.createElement('div');
  albumTracklist.classList.add('album-tracklist');

  tracks.forEach((track, index) => {
    const albumTrackRow = document.createElement('div');
    albumTrackRow.classList.add('track-row', 'album-track-row');

    const numberContainer = document.createElement('div');
    numberContainer.classList.add('container-list-number');
    numberContainer.style.position = 'relative';

    const number = document.createElement('p');
    number.classList.add('list-number', 'album-list-number');
    number.textContent = index + 1;

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

    play.appendChild(playIcon);
    numberContainer.appendChild(play);
    numberContainer.appendChild(number);
    albumTrackRow.appendChild(numberContainer);

    const infoDiv = document.createElement('div');
    infoDiv.classList.add('track-info');
    const trackName = document.createElement('h3');
    trackName.textContent = track.name;

    const artistsContainer = document.createElement('div');

    track.artists.forEach((artist, index) => {
      const artistText = document.createElement('a');
      artistText.textContent = artist.name || 'artist';
      artistText.href = `/artist.html?id=${artist.id}`;
      artistText.classList.add('album-artist');
      artistsContainer.appendChild(artistText);

      if (index < track.artists.length - 1) {
        const comma = document.createElement('span');
        comma.classList.add('comma');
        comma.textContent = ',';
        comma.style.color = '#bbbbbb';
        artistsContainer.appendChild(comma);
      }
    });

    const playInfo = document.createElement('div');
    playInfo.classList.add('play-info');
    // Random ass number, because the API doesn't return it :(
    playInfo.textContent = (
      Math.floor(Math.random() * (9000000 - 1000)) + 1000
    ).toLocaleString();

    const isFavorite = getFavoriteTracks().some((t) => t.id === track.id);
    const saveIcon = document.createElement('i');
    saveIcon.classList.add(
      'fa-solid',
      'scalable',
      isFavorite ? 'fa-check' : 'fa-circle-plus'
    );

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.classList.add('save-btn');
    if (isFavorite) {
      saveBtn.classList.add('saved');
    }

    const trackDuration = document.createElement('span');
    trackDuration.classList.add('album-track-duration');
    trackDuration.textContent = convertDuration(track.duration_ms);

    const elipsisBtn = document.createElement('button');
    elipsisBtn.classList.add('elipsis-btn', 'album-track-elipsis-btn');
    const elipsisIcon = document.createElement('i');
    elipsisIcon.classList.add('fa-solid', 'fa-ellipsis', 'scalable');

    numberContainer.appendChild(number);
    infoDiv.appendChild(trackName);
    infoDiv.appendChild(artistsContainer);
    saveBtn.addEventListener('click', () => {
      const isFavorite = getFavoriteTracks().some((t) => t.id === track.id);
      if (!isFavorite) {
        saveFavoriteTrack(track);
        saveIcon.classList.replace('fa-circle-plus', 'fa-check');
        saveBtn.classList.add('saved');
      } else {
        removeFavoriteTrack(track);
        saveIcon.classList.replace('fa-check', 'fa-circle-plus');
        saveBtn.classList.remove('saved');
      }
      loadFavoriteTracks();
    });
    saveBtn.appendChild(saveIcon);
    elipsisBtn.appendChild(elipsisIcon);
    albumTrackRow.appendChild(numberContainer);
    albumTrackRow.appendChild(infoDiv);
    albumTrackRow.appendChild(playInfo);
    albumTrackRow.appendChild(saveBtn);
    albumTrackRow.appendChild(trackDuration);
    albumTrackRow.appendChild(elipsisBtn);
    albumTracklist.appendChild(albumTrackRow);
  });

  albumTracklistContainer.appendChild(albumTracklist);
  spotifyCard.appendChild(albumHero);
  spotifyCard.appendChild(albumControls);
  spotifyCard.appendChild(albumTracklistContainer);

  return spotifyCard;
};

const displaySearch = async (e) => {
  e.preventDefault();

  const main = document.querySelector('main');
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
  const sidebar = createSidebar();

  main.innerHTML = '';
  main.appendChild(sidebar);
  main.appendChild(content);
  loadFavoriteAlbums();
  loadFavoriteTracks();

  showResultsView();
};

const displayMain = async () => {
  const main = document.querySelector('main');

  const token = await getToken();

  const newReleasesRes = await fetch(
    `${BASE_URL}browse/new-releases?limit=50`,
    {
      headers: {Authorization: `Bearer ${token}`},
    }
  );

  const newReleasesData = await newReleasesRes.json();

  const newReleases = newReleasesData.albums.items;

  const content = createMain(newReleases);
  const sidebar = createSidebar();

  main.innerHTML = '';
  sidebar.innerHTML = '';
  main.appendChild(sidebar);
  main.appendChild(content);
  loadFavoriteAlbums();
  loadFavoriteTracks();
};

const displayArtist = async () => {
  const params = new URLSearchParams(window.location.search);
  const artistId = params.get('id');
  const main = document.querySelector('main');
  const token = await getToken();

  const [artistRes, topTracksRes, topAlbumsRes] = await Promise.all([
    fetch(`${BASE_URL}artists/${encodeURIComponent(artistId)}`, {
      headers: {Authorization: `Bearer ${token}`},
    }),
    fetch(`${BASE_URL}artists/${encodeURIComponent(artistId)}/top-tracks`, {
      headers: {Authorization: `Bearer ${token}`},
    }),
    fetch(`${BASE_URL}artists/${encodeURIComponent(artistId)}/albums?limit=8`, {
      headers: {Authorization: `Bearer ${token}`},
    }),
  ]);

  const artistData = await artistRes.json();
  const topTracksData = await topTracksRes.json();
  const topAlbumsData = await topAlbumsRes.json();

  const content = createArtist(
    artistData,
    topTracksData.tracks,
    topAlbumsData.items
  );
  const sidebar = createSidebar();

  main.innerHTML = '';
  sidebar.innerHTML = '';
  main.appendChild(sidebar);
  main.appendChild(content);
  loadFavoriteAlbums();
  loadFavoriteTracks();
};

const displayAlbum = async () => {
  const params = new URLSearchParams(window.location.search);
  const albumId = params.get('id');

  const main = document.querySelector('main');

  const token = await getToken();

  const albumRes = await fetch(
    `https://api.spotify.com/v1/albums/${encodeURIComponent(albumId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const albumTracksRes = await fetch(
    `https://api.spotify.com/v1/albums/${encodeURIComponent(albumId)}/tracks`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const albumData = await albumRes.json();
  const albumTracksData = await albumTracksRes.json();

  const tracks = albumTracksData.items;

  const content = createAlbum(albumData, tracks);
  const sidebar = createSidebar();

  main.innerHTML = '';
  sidebar.innerHTML = '';
  main.appendChild(sidebar);
  main.appendChild(content);
  loadFavoriteAlbums();
  loadFavoriteTracks();
};

const displayFavorites = () => {
  const main = document.querySelector('main');

  const tracks = getFavoriteTracks();

  const content = createFavorites(tracks);
  const sidebar = createSidebar();

  main.innerHTML = '';
  sidebar.innerHTML = '';
  main.appendChild(sidebar);
  main.appendChild(content);
  loadFavoriteAlbums();
  loadFavoriteTracks();
};

const init = () => {
  const form = document.getElementById('form');
  if (form) {
    form.addEventListener('submit', displaySearch);
    if (state.currentPage.endsWith('/artist.html')) {
      showDetailsView();
    }
  }
  if (
    state.currentPage.endsWith('/') ||
    state.currentPage.endsWith('/index.html')
  ) {
    displayMain();
  }
  if (state.currentPage.endsWith('/artist.html')) {
    displayArtist();
  }
  if (state.currentPage.endsWith('/album.html')) {
    displayAlbum();
  }
  if (state.currentPage.endsWith('/favorites.html')) {
    displayFavorites();
  } else {
    console.warn('Page not recognized:', state.currentPage);
  }
};

init();
