export interface Team {
  name: string;
  img: string;
  sname?: string;
}

export interface DrawState {
  randomArr: number[];
  count: number;
  arr: number[];
  flag: boolean;
  handleDraw: () => void;
  handleReset: () => void;
}
