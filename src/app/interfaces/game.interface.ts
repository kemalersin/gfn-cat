export interface Game {
    id?: number;
    name: string;
    cover?: string;
    genres?: Array<string>;
    screenshots?: Array<string>;
    websites?: [
      {
        category: number;
        url: string;
      }
    ];
  }