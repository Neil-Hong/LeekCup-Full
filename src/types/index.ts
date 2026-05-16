export interface Team {
  name: string;
  img: string;
}

export interface DrawState {
  randomArr: number[];
  count: number;
  arr: number[];
  flag: boolean;
  handleDraw: () => void;
  handleReset: () => void;
}

export interface VideoJsOptions {
  autoplay: string;
  controls: boolean;
  preload: string;
  responsive: boolean;
  width: number;
  sources: Array<{ src: string; type: string }>;
}
