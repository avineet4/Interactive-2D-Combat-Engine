const GLOBAL_VOLUME = 0.5;
export const playSound = (sound, volume = GLOBAL_VOLUME) => {
  sound.volume = volume;
  if (
    !sound.paused &&
    sound.currentTime > 0 &&
    !sound.ended &&
    sound.readyState > sound.HAVE_CURRENT_DATA
  ) {
    sound.currentTime = 0;
    sound.play();
  } else {
    sound.play();
  }
};

export const stopSound = (sound) => {
  sound.pause();
  sound.currentTime = 0;
};
