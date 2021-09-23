const videoWrapper = document.querySelector('.video-flex-wrapper');
const videoContainer = document.querySelector('.video-container');
const controls = document.querySelector('.controls');
const player = document.querySelector('.player');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const playBtn = document.querySelector('.play-btn');
const times = document.querySelector('.times');
const curTime = document.querySelector('.cur-time');
const durTime = document.querySelector('.dur-time');
const progressBar = document.querySelector('.progress-bar');
const muteBtn = document.querySelector('.mute-btn');
const volumeBar = document.querySelector('.volume-bar');
const fsBtn = document.querySelector('.fs-btn');
const bigBtn = document.querySelector('.video-big-btn');

const videos = ['assets/video/video1.mp4', 'assets/video/Robin-21723.mp4', 'assets/video/Rose-3654.mp4', 'assets/video/Star - 6962.mp4'];

let activeVideoIndex = 0;
let volLevel = 0; //save volume level when click 'mute off' or change it to 0% on keboard


nextBtn.addEventListener('click', nextVideo);
prevBtn.addEventListener('click', prevVideo);

playBtn.addEventListener('click', videoAction);
player.addEventListener('click', videoAction);
bigBtn.addEventListener('click', videoAction);

player.addEventListener('timeupdate', updatePosition);

player.addEventListener('loadedmetadata', () => {
  durTime.innerText = convertTime(player.duration);
})
player.addEventListener('ended', () => {
  playBtn.style.backgroundImage = 'url(assets/controls/play.svg)'
});

progressBar.addEventListener('input', function() {
  const value = this.value;
  this.style.background = `linear-gradient(to right, #710707 0%, #710707 ${value}%, #C4C4C4 ${value}%, #C4C4C4 100%)`
  player.currentTime = player.duration * this.value / 100;
});

volumeBar.addEventListener('input', function() {
  const value = this.value;
  this.style.background = `linear-gradient(to right, #710707 0%, #710707 ${value}%, #C4C4C4 ${value}%, #C4C4C4 100%)`;
  changeVolume();
});

muteBtn.addEventListener('click', mute);

fsBtn.addEventListener('click', toggleFullScreen);
player.addEventListener('dblclick', toggleFullScreen);

// меняем стили плеера при наличии режима фулскрин
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
      videoContainer.style.width=`auto`;
      player.style.width=``;
      player.style.height=``;
      player.style.maxWidth=``;
      player.style.maxHeight=``;
      controls.style.bottom=``;
      fsBtn.style.backgroundImage = `url(assets/controls/fullscreen.svg)`;
  } else {
    videoContainer.style.width=`100%`;
    player.style.width=`100%`;
    player.style.height=`100%`;
    player.style.maxWidth=`none`;
    player.style.maxHeight=`none`;
    controls.style.bottom=`calc(-50vh + ${player.offsetHeight / 2}px)`;
    fsBtn.style.backgroundImage = `url(assets/controls/unfs.svg)`;
  }
  hideControls();
  }
)

//костыль: нужен чтобы при первой загрузке сразу отображалось время первого видео
function videoDuration() {
  let a = player.play();
  durTime.innerText = convertTime(player.duration || 0);
  if (a !== undefined) {
    a.then(_ => {
      setTimeout(player.pause(), 0);
    })
    .catch(error => {});
  };
}
videoDuration();

//hot-keys
document.addEventListener('keydown', (event) => {
  let keyName = event.code;
  if (!event.repeat) { //чтобы при зажатой клавише событие не срабатывало бесконечно
    switch (keyName) { 
    case 'KeyF':
      event.preventDefault();
      toggleFullScreen();
      break;
    case 'Space':
      event.preventDefault();
      videoAction();
      break;
    case 'KeyM':
      event.preventDefault();
      mute();
      break;
    case 'Period':
      event.preventDefault();
      speedPlus();
      break;
    case 'Comma':
      event.preventDefault();
      speedMinus();
      break;
    case 'ArrowLeft':
      event.preventDefault();
      if (event.ctrlKey) {
        prevVideo();
      } else {
        if (player.currentTime - 5 > 0) {
          player.currentTime -= 5;
        } else {
          player.currentTime = 0;
        }
      }
      break;
    case 'ArrowRight':
      event.preventDefault();
      if (event.ctrlKey) {
        nextVideo();
      } else {
        if (player.currentTime + 5 < player.duration) {
          player.currentTime += 5;
        } else {
          player.currentTime = player.duration;
        }
      }
      break;
    case 'ArrowUp':
      event.preventDefault();
      volumePlus();
      break;
    case 'ArrowDown':
      event.preventDefault();
      if (player.volume > 0) { //чтобы нажатие клавиши в режиме мут не сбивало запомненный уровень громкости в ноль
        volumeMinus();
      }
      break;
    default:
      break; 
    }
  }
})


//functions
function videoAction() {
  if (player.paused) {
    player.play();
    playBtn.style.backgroundImage = 'url(assets/controls/pause.svg)';
    bigBtn.classList.add('dn');
  } else {
    player.pause();
    playBtn.style.backgroundImage = 'url(assets/controls/play.svg)';
  }
}

function nextVideo() {
  activeVideoIndex++
  if (activeVideoIndex == videos.length) {
    activeVideoIndex = 0;
  }
  player.setAttribute('src', videos[activeVideoIndex]);
  playBtn.style.backgroundImage = 'url(assets/controls/play.svg)';
  bigBtn.classList.remove('dn');
}

function prevVideo() {
  activeVideoIndex--
  if (activeVideoIndex < 0) {
    activeVideoIndex = videos.length - 1;
  }
  player.setAttribute('src', videos[activeVideoIndex]);
  playBtn.style.backgroundImage = 'url(assets/controls/play.svg)';
  bigBtn.classList.remove('dn');
}

function convertTime(sec) {
  let mm = Math.floor(sec / 60);
  let ss = Math.floor(sec - mm * 60);
  if (mm < 10) {
    mm = '0' + mm;
  }
  if (ss < 10) {
    ss = '0' + ss;
  }
  return `${mm}:${ss}`;
}

function updatePosition() {
  curTime.innerText = convertTime(player.currentTime || 0);
  durTime.innerText = convertTime(player.duration || 0);
  progressBar.value = (((player.currentTime || 0) / (player.duration || 1)) * 100);
  progressBar.style.background = `linear-gradient(to right, #710707 0%, #710707 ${progressBar.value}%, #C4C4C4 ${progressBar.value}%, #C4C4C4 100%)`;
}

function changeVolume() {
  let volume = volumeBar.value / 100;
  player.volume = volume;
  if (player.volume == 0) {
    muteBtn.style.backgroundImage = `url(assets/controls/muteoff.svg)`;
    volLevel = 0;
  }
  else {
    muteBtn.style.backgroundImage = `url(assets/controls/mute.svg)`;
  }
};

function mute() {
  if (player.volume == 0) {
    player.volume = volLevel;
    volumeBar.value = volLevel * 100;
    if (volLevel > 0) {
      muteBtn.style.backgroundImage = `url(assets/controls/mute.svg)`;
    }
    volumeBar.style.background = `linear-gradient(to right, #710707 0%, #710707 ${volumeBar.value}%, #C4C4C4 ${volumeBar.value}%, #C4C4C4 100%)`;
  } else {
    volLevel = player.volume
    player.volume = 0;
    volumeBar.value = 0;
    muteBtn.style.backgroundImage = `url(assets/controls/muteoff.svg)`;
    volumeBar.style.background = `linear-gradient(to right, #710707 0%, #710707 ${volumeBar.value}%, #C4C4C4 ${volumeBar.value}%, #C4C4C4 100%)`;
  }
}

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    videoWrapper.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

function speedPlus() {
  if (player.playbackRate < 16) {
    player.playbackRate = (player.playbackRate + 0.1).toFixed(1);
  }
}

function speedMinus() {
  if (player.playbackRate > 0) {
    player.playbackRate = (player.playbackRate - 0.1).toFixed(1);
  }
}

function volumePlus() {
  if (player.volume < 1) {
    player.volume = (player.volume + 0.1).toFixed(1);
    volumeBar.value = player.volume * 100;
    volumeBar.style.background = `linear-gradient(to right, #710707 0%, #710707 ${volumeBar.value}%, #C4C4C4 ${volumeBar.value}%, #C4C4C4 100%)`;
  }
  if (player.volume > 0) {
    muteBtn.style.backgroundImage = `url(assets/controls/mute.svg)`;
  }
}

function volumeMinus() {
  if (player.volume > 0) {
    player.volume = (player.volume - 0.1).toFixed(1);
    volumeBar.value = player.volume * 100;
    volumeBar.style.background = `linear-gradient(to right, #710707 0%, #710707 ${volumeBar.value}%, #C4C4C4 ${volumeBar.value}%, #C4C4C4 100%)`;
  }
  if (player.volume == 0) {
    volLevel = 0;
    muteBtn.style.backgroundImage = `url(assets/controls/muteoff.svg)`;
  }
}

function hideControls() { //функция для скрытия контрольной панели в режиме фуллскрин
  let timerControlsHide;
  resetTimer();

  document.addEventListener('mousemove', resetTimer);
  document.addEventListener('keydown', resetTimer);

  function controlsDN() {
    controls.classList.add('dn');
  }

  function resetTimer() {

    if (controls.classList.contains('dn')) {
      controls.classList.remove('dn');
      }

    if (!document.fullscreenElement) { // убираем слушатели в режине НЕфулскрин
      document.removeEventListener('mousemove', resetTimer);
      document.removeEventListener('keydown', resetTimer);
      clearTimeout(timerControlsHide);
      return;
    }

    clearTimeout(timerControlsHide);
    timerControlsHide = setTimeout(controlsDN, 2000)
  }
}

