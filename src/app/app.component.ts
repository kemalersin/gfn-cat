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

  public games: Array<Game> = [];
  public categories: Array<any> = [];

  constructor(private JSONService: JSONService) {}

  ngOnInit() {
    this.JSONService.getJSONData().subscribe((games: Array<Game>) => {
      this.games = games;

      this.categories = chain(this.games)
        .map('genres')
        .flatten()
        .uniq()
        .omitBy(isNil)
        .orderBy()
        .value();
    });
  }
}
