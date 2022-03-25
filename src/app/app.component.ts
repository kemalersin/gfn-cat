import { Component, OnInit } from '@angular/core';

import { chain, isNil } from 'lodash';

import { Game } from './interfaces/game.interface';
import { JSONService } from './services/json.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public title: string = 'GFN Cat - Unofficial GeForce NOW Catalog';
  public coverUrl: string =
    'https://images.igdb.com/igdb/image/upload/t_cover_big';

  public groupedGames: any;
  public categories: Array<any> = [];

  constructor(private JSONService: JSONService) {}

  ngOnInit() {
    this.JSONService.getJSONData().subscribe((games: Array<Game>) => {
      this.groupedGames = chain(games)
        .groupBy((game: Game) => game.name[0].toUpperCase())
        .map((value: any, key: string) => ({ letter: key, games: value }))
        .orderBy('letter')
        .value();

      this.categories = chain(games)
        .map('genres')
        .flatten()
        .uniq()
        .omitBy(isNil)
        .orderBy()
        .value();
    });
  }

  objectKeys(obj: any) {
    return Object.keys(obj);
  }
}
