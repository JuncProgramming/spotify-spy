import {
  getFavoriteAlbums,
  saveFavoriteAlbum,
  removeFavoriteAlbum,
  getFavoriteTracks,
  saveFavoriteTrack,
  removeFavoriteTrack,
  loadSidebar,
} from './storage/storage.js';

const state = {
  currentPage: window.location.pathname,
};

const mediaQuery = window.matchMedia('(max-width: 768px)');

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

const logError = (message, error) => {
  console.error(message, error);
};

const displayUIErrorMessage = (container, message) => {
  if (!container) {
    console.warn('Missing container in displayMessage');
    return null;
  }

  const emptyMessage = document.createElement('p');
  emptyMessage.classList.add('empty-message');
  emptyMessage.textContent = message;

  container.innerHTML = '';
  container.appendChild(emptyMessage);

  return container;
};

const showSpinner = () => {
  document.getElementById('loader')?.classList.remove('hidden');
};

const hideSpinner = () => {
  document.getElementById('loader')?.classList.add('hidden');
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

const onTrackSaveClick = (saveButton, saveIcon, track) => {
  if (!saveButton || !saveIcon || !track) {
    console.warn('Missing argument in onTrackSaveClick:', {
      saveButton,
      saveIcon,
      track,
    });
    return;
  }
  saveButton.addEventListener('click', () => {
    const isFavorite = getFavoriteTracks().some((t) => t?.id === track.id);
    if (!isFavorite) {
      saveFavoriteTrack(track);
      saveIcon.classList.replace('fa-circle-plus', 'fa-check');
      saveButton.classList.add('saved');
    } else {
      removeFavoriteTrack(track);
      saveIcon.classList.replace('fa-check', 'fa-circle-plus');
      saveButton.classList.remove('saved');
    }
    loadSidebar();
  });
};

const onAlbumSaveClick = (saveButton, saveIcon, album) => {
  if (!saveButton || !saveIcon || !album) {
    console.warn('Missing argument in onAlbumSaveClick:', {
      saveButton,
      saveIcon,
      album,
    });
    return;
  }
  saveButton.addEventListener('click', () => {
    const isFavorite = getFavoriteAlbums().some((a) => a?.id === album.id);
    if (!isFavorite) {
      saveFavoriteAlbum(album);
      saveIcon.className = 'fa-solid scalable';
      saveIcon.classList.add(isFavorite ? 'fa-plus' : 'fa-check');
      saveButton.classList.add('saved');
    } else {
      removeFavoriteAlbum(album);
      saveIcon.className = 'fa-solid scalable';
      saveIcon.classList.add('fa-plus');
      saveButton.classList.remove('saved');
    }
    loadSidebar();
  });
};

const createCommaSeparatedArtists = (artists, className = 'artist') => {
  const container = document.createElement('div');
  artists?.forEach((artist, index) => {
    const artistWrapper = document.createElement('span');
    artistWrapper.classList.add('artist-wrapper');
    
    const artistText = document.createElement('a');
    artistText.textContent = artist.name || 'artist';
    artistText.href = artist.id ? `/artist.html?id=${artist.id}` : '#';
    artistText.classList.add(className);
    artistWrapper.appendChild(artistText);

    if (index < artists.length - 1) {
      const comma = document.createElement('span');
      comma.classList.add('comma');
      comma.textContent = ',';
      artistWrapper.appendChild(comma);
    }
    
    container.appendChild(artistWrapper);
  });
  return container;
};

const createDotSeparatedArtists = (artists, className = 'artist') => {
  const container = document.createElement('div');
  container.style.display = 'inline';

  artists?.forEach((artist, index) => {
    const artistLink = document.createElement('a');
    artistLink.textContent = artist.name || 'artist';
    artistLink.href = artist.id ? `/artist.html?id=${artist.id}` : '#';
    artistLink.classList.add(className);
    artistLink.style.whiteSpace = 'nowrap';

    container.appendChild(artistLink);

    if (index < artists.length - 1) {
      const dot = document.createElement('span');
      dot.textContent = ' • ';
      dot.classList.add('artist-meta-separator');
      container.appendChild(dot);
    }
  });

  return container;
};

const createDotSpacer = () => {
  const dot = document.createElement('span');
  dot.textContent = '•';
  dot.classList.add('meta-separator');
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
  if (!track) {
    console.warn(`Missing track in createBestResultCard: ${track}`);
    return;
  }

  const bestTrackRow = document.createElement('div');
  bestTrackRow.classList.add('best-track-card');

  const mainContent = document.createElement('div');
  mainContent.classList.add('best-track-row-main');

  const img = document.createElement('img');
  img.classList.add('cover-img');
  img.src = track.album?.images[0]?.url || './media/default-cover.png';
  img.alt = track.name ? `${track.name} cover` : 'Cover';
  img.style.display = 'block';
  img.loading = 'lazy';

  const play = document.createElement('a');
  play.classList.add('green-play-btn');
  play.href = track.external_urls?.spotify || '#';
  play.target = '_blank';

  play.addEventListener('click', (e) => {
    e.preventDefault();
    window.open(track.album?.external_urls?.spotify, '_blank');
    window.location.href = album.id ? `/album.html?id=${track.album?.id}` : '#';
  });

  const playIcon = document.createElement('i');
  playIcon.classList.add('fa-solid', 'fa-play', 'play-icon');

  const info = document.createElement('div');
  info.classList.add('best-track-info');

  const title = document.createElement('h3');
  title.textContent = track.name || 'track name';

  const titleAndArtistsContainer = document.createElement('div');
  titleAndArtistsContainer.appendChild(title);
  titleAndArtistsContainer.appendChild(createCommaSeparatedArtists(track.artists));

  bestTrackRow.addEventListener('mouseenter', () => {
    play.classList.remove('animated-out');
    play.classList.add('animated-in');
  });

  bestTrackRow.addEventListener('mouseleave', () => {
    play.classList.remove('animated-in');
    play.classList.add('animated-out');
  });

  play.appendChild(playIcon);
  info.appendChild(titleAndArtistsContainer);
  mainContent.appendChild(img);
  mainContent.appendChild(info);
  bestTrackRow.appendChild(mainContent);
  bestTrackRow.appendChild(play);

  return bestTrackRow;
};

const createTrackCard = (track, number = null) => {
  if (!track) {
    console.warn(`Missing track in createTrackCard: ${track}`);
    return;
  }

  const row = document.createElement('div');
  row.classList.add('track-row');
  row.dataset.playUrl = track.external_urls.spotify || '#';

  const imgContainer = document.createElement('div');
  imgContainer.style.position = 'relative';

  const img = document.createElement('img');
  img.src = track.album?.images[1]?.url || './media/default-cover.png';
  img.alt = track.name ? `${track.name} cover` : 'Cover';
  img.style.display = 'block';
  img.loading = 'lazy';

  if (number) {
    const numberContainer = document.createElement('div');
    numberContainer.classList.add('container-list-number');

    const listNumber = document.createElement('p');
    listNumber.classList.add('list-number');
    listNumber.textContent = number;

    const play = document.createElement('a');
    play.classList.add('play-btn');
    play.style.position = 'absolute';
    play.style.lineHeight = '1';
    play.style.top = '50%';
    play.style.left = '50%';
    play.style.transform = 'translate(-50%, -50%)';
    play.href = track.external_urls?.spotify || '#';
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
    play.style.lineHeight = '1';
    play.style.top = '50%';
    play.style.left = '50%';
    play.style.transform = 'translate(-50%, -50%)';
    play.href = track.external_urls?.spotify || '#';
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

  const isFavorite = getFavoriteTracks().some((t) => t?.id === track.id);

  const saveBtn = document.createElement('button');
  const saveIcon = document.createElement('i');
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
  duration.id = 'track-duration';
  duration.textContent = convertDuration(track.duration_ms);

  const elipsis = document.createElement('button');
  elipsis.classList.add('elipsis-btn');

  const elipsisIcon = document.createElement('i');
  elipsisIcon.classList.add('fa-solid', 'fa-ellipsis', 'scalable');

  const artistWrap = createCommaSeparatedArtists(track.artists);
  artistWrap.classList.add('artist-wrap');

  info.appendChild(title);
  info.appendChild(artistWrap);
  saveBtn.appendChild(saveIcon);
  elipsis.appendChild(elipsisIcon);
  imgContainer.appendChild(img);
  row.appendChild(imgContainer);
  row.appendChild(info);
  row.appendChild(saveBtn);
  onTrackSaveClick(saveBtn, saveIcon, track);
  row.appendChild(duration);
  row.appendChild(elipsis);

  return row;
};

const createAlbumCover = (album) => {
  if (!album) {
    console.warn(`Missing album in createAlbumCover: ${album}`);
    return;
  }

  const card = document.createElement('a');
  card.classList.add('album-card');
  card.href = album.id ? `/album.html?id=${album.id}` : '#';

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
    window.open(album.external_urls?.spotify, '_blank');
    window.location.href = album.id ? `/album.html?id=${album.id}` : '#';
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

  const container = document.createElement('div');
  container.classList.add('page-container');
  spotifyCard.appendChild(container);

  const searchResults = document.createElement('div');
  searchResults.classList.add('search-results');

  if (!tracks || tracks.length === 0) {
    console.warn(`Missing tracks in createSearch: ${tracks}`);
    return displayUIErrorMessage(spotifyCard, 'No results found');
  }

  const bestTrackContainer = document.createElement('div');
  bestTrackContainer.id = 'best-track-container';

  const bestTrackHeader = document.createElement('h2');
  bestTrackHeader.id = 'best-track-header';
  bestTrackHeader.textContent = 'Best result';

  const bestCard = createBestResultCard(tracks[0]);

  const tracksContainer = document.createElement('div');
  tracksContainer.id = 'tracks-container';

  const tracksHeader = document.createElement('h2');
  tracksHeader.id = 'tracks-header';
  tracksHeader.textContent = 'Tracks';
  tracksContainer.appendChild(tracksHeader);

  tracks.forEach((track) => {
    const row = createTrackCard(track);
    row.classList.add('track-row', 'search-track-row');
    tracksContainer.appendChild(row);
  });

  bestTrackContainer.appendChild(bestTrackHeader);
  bestTrackContainer.appendChild(bestCard);
  searchResults.appendChild(bestTrackContainer);
  searchResults.appendChild(tracksContainer);
  container.appendChild(searchResults);

  return spotifyCard;
};

const createMain = (newReleases) => {
  const spotifyCard = document.createElement('div');
  spotifyCard.classList.add('spotify-card');

  const container = document.createElement('div');
  container.classList.add('page-container');
  spotifyCard.appendChild(container);

  if (!newReleases || newReleases.length === 0) {
    console.warn(`Missing new releases in createMain: ${newReleases}`);
    return displayUIErrorMessage(spotifyCard, 'No new releases found');
  }

  const newReleasesContainer = document.createElement('div');
  newReleasesContainer.id = 'new-releases-container';

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
  newReleasesContainer.appendChild(sectionHeader);
  newReleasesContainer.appendChild(albumGridContainer);
  container.appendChild(newReleasesContainer);

  return spotifyCard;
};

const createArtist = (artist, tracks = [], albums = []) => {
  const spotifyCard = document.createElement('div');
  spotifyCard.classList.add('spotify-card');

  const container = document.createElement('div');
  container.classList.add('page-container');
  spotifyCard.appendChild(container);

  if (!artist) {
    console.warn(`Missing artist in createArtist: ${artist}`);
    return displayUIErrorMessage(spotifyCard, 'No artist found');
  }

  document.title = artist.name || 'Spotify Spy';

  const hero = document.createElement('div');
  hero.classList.add('artist-hero');
  const bgImage = artist.images?.[0]?.url;

  if (bgImage) {
    const imgForColor = new Image();
    imgForColor.crossOrigin = 'anonymous';
    imgForColor.src = bgImage;

    imgForColor.onload = () => {
      const colorThief = new ColorThief();
      const [r, g, b] = colorThief.getColor(imgForColor);
      hero.style.setProperty('--artist-bg-mobile', `url(${bgImage})`);
      spotifyCard.style.setProperty('--album-accent', `rgb(${r}, ${g}, ${b})`);
      hero.style.backgroundImage = `linear-gradient(to bottom, rgba(${r}, ${g}, ${b}, 0.5), transparent 90%)`;
    };
  } else {
    spotifyCard.style.setProperty('--album-accent', '#1c1c1c');
  }

  const heroInner = document.createElement('div');
  heroInner.classList.add('hero-inner');

  const image = document.createElement('img');
  image.classList.add('artist-hero-img');
  image.src = artist.images?.[1]?.url || './media/default-cover.png';
  image.alt = artist.name ? `Picture of ${artist.name}` : 'Artist picture';

  const heroInfo = document.createElement('div');
  heroInfo.classList.add('artist-hero-info');

  const verifiedWrapper = document.createElement('p');
  verifiedWrapper.classList.add('artist-verified');
  const verifiedText = document.createTextNode('Verified artist');

  const badgeContainer = document.createElement('span');
  badgeContainer.classList.add('verified-badge-wrapper');

  const badgeIcon = document.createElement('i');
  badgeIcon.classList.add('fa-solid', 'fa-certificate');

  const checkIcon = document.createElement('i');
  checkIcon.classList.add('fa-solid', 'fa-check', 'check-inside');
  checkIcon.setAttribute('aria-hidden', 'true');

  const name = document.createElement('h1');
  name.classList.add('artist-name');
  name.textContent = artist.name;

  const followers = document.createElement('p');
  followers.classList.add('artist-followers');
  followers.textContent = `${
    artist.followers?.total?.toLocaleString() ?? 'Unknown number of'
  } listeners this month`;

  container.appendChild(hero);

  if (tracks.length) {
    const popularHeader = document.createElement('h2');
    popularHeader.classList.add('popular-header');
    popularHeader.textContent = 'Popular';

    const popularTracksContainer = document.createElement('div');
    popularTracksContainer.id = 'popular-tracks-container';
    popularTracksContainer.appendChild(popularHeader);

    const MAXIMUM_TRACK_COUNT = 5;

    tracks?.forEach((track, index) => {
      const row = createTrackCard(track, index + 1);
      row.classList.add('artist-track-row');
      if (index + 1 > MAXIMUM_TRACK_COUNT) {
        row.classList.add('hidden');
      }
      popularTracksContainer.appendChild(row);
    });

    const showLessMoreBtn = document.createElement('button');
    showLessMoreBtn.textContent = 'Show more';
    showLessMoreBtn.classList.add('show-less-more-btn');

    let isExpanded = false;

    showLessMoreBtn.addEventListener('click', () => {
      const allRows =
        popularTracksContainer.querySelectorAll('.artist-track-row');
      // If the list is not expanded, show the last 5 tracks and change the button text
      if (isExpanded === false) {
        allRows.forEach((row) => row.classList.remove('hidden'));
        showLessMoreBtn.textContent = 'Show less';
      }
      // If the list is expanded, hide the last 5 tracks and change the button text
      else {
        allRows.forEach((row, index) => {
          if (index + 1 > MAXIMUM_TRACK_COUNT) {
            row.classList.add('hidden');
          }
        });
        showLessMoreBtn.textContent = 'Show more';
      }
      // Switch the isExpanded
      isExpanded = !isExpanded;
    });

    popularTracksContainer.appendChild(showLessMoreBtn);

    container.appendChild(popularTracksContainer);
  }

  if (albums.length) {
    const discographyHeader = document.createElement('h2');
    discographyHeader.classList.add('discography-header');
    discographyHeader.textContent = 'Discography';

    const albumsContainer = document.createElement('div');
    albumsContainer.id = 'artist-albums-container';
    container.appendChild(discographyHeader);

    albums?.forEach((album) => {
      const albumCover = createAlbumCover(album);
      albumCover.classList.add('album-card', 'artist-album-card');
      albumsContainer.appendChild(albumCover);
    });
    container.appendChild(albumsContainer);
  }

  badgeContainer.appendChild(badgeIcon);
  badgeContainer.appendChild(checkIcon);
  verifiedWrapper.appendChild(badgeContainer);
  verifiedWrapper.append(verifiedText);
  heroInfo.appendChild(verifiedWrapper);
  heroInfo.appendChild(name);
  heroInfo.appendChild(followers);
  heroInner.appendChild(image);
  heroInner.appendChild(heroInfo);
  hero.appendChild(heroInner);

  return spotifyCard;
};

const createAlbum = (album, tracks) => {
  const spotifyCard = document.createElement('div');
  spotifyCard.classList.add('spotify-card');

  const container = document.createElement('div');
  container.classList.add('page-container');
  spotifyCard.appendChild(container);

  if (!album || !tracks || tracks.length === 0) {
    console.warn('Missing arguments in createAlbum:', { album, tracks });
    return displayUIErrorMessage(spotifyCard, 'No album found');
  }

  document.title = album.name || 'Spotify Spy';

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
    spotifyCard.style.setProperty('--album-accent-rgb', `${r}, ${g}, ${b})`);
    container.style.setProperty('--album-bg-url', `url(${albumImgUrl})`);
  };

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

  const albumArtistsContainer = createDotSeparatedArtists(
    album.artists,
    'album-artist'
  );
  albumArtistsContainer.id = 'album-artists-container';

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

  const isFavorite = getFavoriteAlbums().some((a) => a?.id === album.id);
  const saveIcon = document.createElement('i');
  saveIcon.className = 'fa-solid scalable';
  saveIcon.classList.add('fa-solid', isFavorite ? 'fa-check' : 'fa-plus');

  const saveBtn = document.createElement('button');
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
  headerTitle.textContent = 'Title';

  const headerPlays = document.createElement('div');
  headerPlays.classList.add('album-tracklist-col', 'plays');
  headerPlays.textContent = 'Plays';

  const headerTime = document.createElement('div');
  headerTime.classList.add('album-tracklist-col', 'time');
  const timeIcon = document.createElement('i');
  timeIcon.classList.add('fa-regular', 'fa-clock');

  playBtn.appendChild(playIcon);
  saveBtn.appendChild(saveIcon);
  moreBtn.appendChild(moreIcon);
  albumControls.appendChild(playBtn);
  albumControls.appendChild(saveBtn);
  onAlbumSaveClick(saveBtn, saveIcon, album);
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
    albumTrackRow.dataset.playUrl = track.external_urls.spotify || '#';

    const numberContainer = document.createElement('div');
    numberContainer.classList.add('container-list-number');
    numberContainer.style.position = 'relative';

    const number = document.createElement('p');
    number.classList.add('list-number', 'album-list-number');
    number.textContent = index + 1;

    const play = document.createElement('a');
    play.classList.add('play-btn');
    play.style.position = 'absolute';
    play.style.lineHeight = '1';
    play.style.top = '50%';
    play.style.left = '50%';
    play.style.transform = 'translate(-50%, -50%)';
    play.href = track.external_urls?.spotify || '#';
    play.target = '_blank';

    const playIcon = document.createElement('i');
    playIcon.classList.add('fa-solid', 'fa-play', 'play-icon');

    const infoDiv = document.createElement('div');
    infoDiv.classList.add('track-info');
    const trackName = document.createElement('h3');
    trackName.textContent = track.name;

    const playInfo = document.createElement('div');
    playInfo.classList.add('play-info');
    // Random ass number, because the API doesn't return it :(
    playInfo.textContent = (
      Math.floor(Math.random() * (9000000 - 1000)) + 1000
    ).toLocaleString();

    const saveIcon = document.createElement('i');
    const isFavorite = getFavoriteTracks().some((t) => t?.id === track.id);
    saveIcon.classList.add('fa-solid', isFavorite ? 'fa-check' : 'fa-plus');

    const saveBtn = document.createElement('button');
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

    play.appendChild(playIcon);
    numberContainer.appendChild(play);
    numberContainer.appendChild(number);
    infoDiv.appendChild(trackName);
    infoDiv.appendChild(createCommaSeparatedArtists(track.artists));
    saveBtn.appendChild(saveIcon);
    elipsisBtn.appendChild(elipsisIcon);
    albumTrackRow.appendChild(numberContainer);
    albumTrackRow.appendChild(infoDiv);
    albumTrackRow.appendChild(playInfo);
    albumTrackRow.appendChild(saveBtn);
    onTrackSaveClick(saveBtn, saveIcon, track);
    albumTrackRow.appendChild(trackDuration);
    albumTrackRow.appendChild(elipsisBtn);
    albumTracklist.appendChild(albumTrackRow);
  });

  albumTracklistContainer.appendChild(albumTracklist);
  container.appendChild(albumHero);
  container.appendChild(albumControls);
  container.appendChild(albumTracklistContainer);

  return spotifyCard;
};

const createFavorites = (tracks) => {
  const spotifyCard = document.createElement('div');
  spotifyCard.classList.add('spotify-card');

  const container = document.createElement('div');
  container.classList.add('page-container');
  spotifyCard.appendChild(container);

  if (!tracks || tracks.length === 0) {
    console.warn(`Missing tracks in createFavorites: ${tracks}`);
    return displayUIErrorMessage(spotifyCard, 'No favorite tracks');
  }

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
  };

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
  albumTitle.textContent = 'Liked Songs';

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
  playBtn.href = tracks[0].external_urls?.spotify || '#';
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
  headerTitle.textContent = 'Title';

  const headerPlays = document.createElement('span');
  headerPlays.classList.add('album-tracklist-col', 'album');
  headerPlays.textContent = 'Album';

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
    albumTrackRow.dataset.playUrl = track.external_urls.spotify || '#';

    const numberContainer = document.createElement('div');
    numberContainer.classList.add('container-list-number');
    numberContainer.style.position = 'relative';

    const number = document.createElement('p');
    number.classList.add('list-number', 'album-list-number');
    number.textContent = index + 1;

    const play = document.createElement('a');
    play.classList.add('play-btn');
    play.style.position = 'absolute';
    play.style.lineHeight = '1';
    play.style.top = '50%';
    play.style.left = '50%';
    play.style.transform = 'translate(-50%, -50%)';
    play.href = track.external_urls?.spotify || '#';
    play.target = '_blank';

    const playIcon = document.createElement('i');
    playIcon.classList.add('fa-solid', 'fa-play', 'play-icon');

    play.appendChild(playIcon);
    numberContainer.appendChild(play);
    albumTrackRow.appendChild(numberContainer);

    const infoDiv = document.createElement('div');
    infoDiv.classList.add('track-info');
    const trackName = document.createElement('h3');
    trackName.textContent = track.name;

    const albumInfo = document.createElement('a');
    albumInfo.classList.add('album-name', 'play-info');
    albumInfo.textContent = track.album?.name || 'Unknown album';
    albumInfo.href = track.album?.id ? `/album.html?id=${track.album.id}` : '#';

    const isFavorite = getFavoriteTracks().some((t) => t?.id === track.id);
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
    infoDiv.appendChild(createCommaSeparatedArtists(track.artists));
    saveBtn.appendChild(saveIcon);
    elipsisBtn.appendChild(elipsisIcon);
    albumTrackRow.appendChild(numberContainer);
    albumTrackRow.appendChild(infoDiv);
    albumTrackRow.appendChild(albumInfo);
    albumTrackRow.appendChild(saveBtn);
    onTrackSaveClick(saveBtn, saveIcon, track);
    albumTrackRow.appendChild(trackDuration);
    albumTrackRow.appendChild(elipsisBtn);
    albumTracklist.appendChild(albumTrackRow);
  });

  albumTracklistContainer.appendChild(albumTracklist);
  container.appendChild(albumHero);
  container.appendChild(albumControls);
  container.appendChild(albumTracklistContainer);

  return spotifyCard;
};

const displaySearch = async (e) => {
  e.preventDefault();

  const main = document.querySelector('main');
  const searchField = document.getElementById('search');
  const query = searchField.value.trim();

  if (!query) {
    console.warn('Search query is empty');
    return;
  }

  try {
    showSpinner();

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

    if (!res.ok) {
      throw new Error(`Error: ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const tracks = data.tracks?.items ?? [];

    const content = createSearch(tracks);
    const sidebar = createSidebar();

    main.innerHTML = '';
    main.appendChild(sidebar);
    main.appendChild(content);
    loadSidebar();

    showResultsView();
  } catch (err) {
    logError('Fetching search results failed:', err);
    main.innerHTML = '';
    displayUIErrorMessage(main, 'Failed to load search results.');
  } finally {
    hideSpinner();
  }
};

const displayMain = async () => {
  const main = document.querySelector('main');

  try {
    showSpinner();

    const token = await getToken();

    const newReleasesRes = await fetch(
      `${BASE_URL}browse/new-releases?limit=50`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!newReleasesRes.ok) {
      throw new Error(
        `Error: ${newReleasesRes.status}: ${newReleasesRes.statusText}`
      );
    }

    const newReleasesData = await newReleasesRes.json();

    const newReleases = newReleasesData.albums?.items;

    const content = createMain(newReleases);
    const sidebar = createSidebar();

    main.innerHTML = '';
    main.appendChild(sidebar);
    main.appendChild(content);
    loadSidebar();
  } catch (err) {
    logError('Fetching new releases failed:', err);
    main.innerHTML = '';
    displayUIErrorMessage(main, 'Failed to load new releases.');
  } finally {
    hideSpinner();
  }
};

const displayArtist = async () => {
  const params = new URLSearchParams(window.location.search);
  const artistId = params.get('id');
  const main = document.querySelector('main');

  try {
    showSpinner();

    const token = await getToken();

    const [artistRes, topTracksRes, topAlbumsRes] = await Promise.all([
      fetch(`${BASE_URL}artists/${encodeURIComponent(artistId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${BASE_URL}artists/${encodeURIComponent(artistId)}/top-tracks`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(
        `${BASE_URL}artists/${encodeURIComponent(artistId)}/albums?limit=8`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ),
    ]);

    if (!artistRes.ok || !topTracksRes.ok || !topAlbumsRes.ok) {
      throw new Error(
        `Displaying artist failed: ${artistRes.status}, tracks: ${topTracksRes.status}, albums: ${topAlbumsRes.status}`
      );
    }

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
    main.appendChild(sidebar);
    main.appendChild(content);
    loadSidebar();
  } catch (err) {
    logError('Fetching artist failed:', err);
    main.innerHTML = '';
    displayUIErrorMessage(main, 'Failed to load artist details.');
  } finally {
    hideSpinner();
  }
};

const displayAlbum = async () => {
  const params = new URLSearchParams(window.location.search);
  const albumId = params.get('id');

  const main = document.querySelector('main');

  try {
    showSpinner();

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

    if (!albumRes.ok || !albumTracksRes.ok) {
      throw new Error(
        `Displaying album failed: ${albumRes.status}, tracks: ${albumTracksRes.status}`
      );
    }

    const albumData = await albumRes.json();
    const albumTracksData = await albumTracksRes.json();

    const tracks = albumTracksData.items;

    const content = createAlbum(albumData, tracks);
    const sidebar = createSidebar();

    main.innerHTML = '';
    main.appendChild(sidebar);
    main.appendChild(content);
    loadSidebar();
  } catch (err) {
    logError('Fetching album failed:', err);
    main.innerHTML = '';
    displayUIErrorMessage(main, 'Failed to load album.');
  } finally {
    hideSpinner();
  }
};

const displayFavorites = () => {
  const main = document.querySelector('main');

  // Not adding any error handling since this line will return [] if empty and createFavorites will handle empty tracks
  const tracks = getFavoriteTracks();

  const content = createFavorites(tracks);
  const sidebar = createSidebar();

  main.innerHTML = '';
  main.appendChild(sidebar);
  main.appendChild(content);
  loadSidebar();
};

const init = () => {
  state.currentPage = window.location.pathname;
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
  } else if (state.currentPage.endsWith('/artist.html')) {
    displayArtist();
  } else if (state.currentPage.endsWith('/album.html')) {
    displayAlbum();
  } else if (state.currentPage.endsWith('/favorites.html')) {
    displayFavorites();
  } else {
    console.warn('Page not recognized:', state.currentPage);
  }
};

init();

// Reload the app after navigating back or forward
window.addEventListener('pageshow', () => {
  init();
});

document.addEventListener('click', (e) => {
  if (!mediaQuery.matches) return;
  const row = e.target.closest('.track-row');
  if (!row) return;
  // Dont click on visible buttons or anchors
  if (e.target.closest('button, a')) return;
  const url = row.dataset.playUrl;
  if (url) window.open(url, '_blank');
});
