export default class GameAudio {
  track: HTMLAudioElement | undefined | null;
  canPlay: boolean = false;

  constructor(url?: string) {
    if (url?.length) this.track = new Audio(url);
  }

  setCanPlay(state: boolean) {
    this.canPlay = state;
  }

  onCanPlay(ev: Event) {
    this.setCanPlay(true);
  }

  offCanPlay() {
    this.setCanPlay(false);
  }

  onMount() {
    if (!this.track) return;
    this.track.addEventListener('canplay', this.onCanPlay.bind(this));

    return () => {
      if (!this.track) return;

      this.track.removeEventListener('canplay', this.onCanPlay.bind(this));
      this.offCanPlay();
    };
  }
}