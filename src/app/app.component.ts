import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {
  assignIn,
  chain,
  cloneDeep,
  find,
  forEach,
  includes,
  isNil,
  lowerCase,
} from 'lodash';

import { Game } from './interfaces/game.interface';
import { JSONService } from './services/json.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public title: string = 'GFN Cat - Unofficial GeForce NOW Catalog';

  public baseUrl: string = 'https://images.igdb.com/igdb/image/upload';

  public coverUrl: string = `${this.baseUrl}/t_cover_big`;
  public screenshotUrl: string = `${this.baseUrl}/t_original`;

  public groupedGames: any;
  public filteredGames: any;
  public categories: Array<any> = [];

  public selectedGame: Game;

  public searchText: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private JSONService: JSONService
  ) {}

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

      this.resetFilteredGames();
    });
  }

  public resetFilteredGames() {
    this.filteredGames = cloneDeep(this.groupedGames);
  }

  public navigate() {
    let queryParams: any = {};

    if (this.searchText) {
      queryParams.s = this.searchText;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams
    });
  }  

  public search() {
    setTimeout(() => {
      if (!this.searchText) {
        this.navigate();
        this.resetFilteredGames();

        return;
      }

      this.filteredGames = [];

      forEach(this.groupedGames, (group: any) =>
        forEach(group.games, (game: Game) => {
          if (includes(lowerCase(game.name), lowerCase(this.searchText))) {
            const currentGroup: any = { letter: group.letter };

            const getGroup: Function = () =>
              find(this.filteredGames, currentGroup);

            if (!getGroup()) {
              assignIn(currentGroup, { games: [] });
              this.filteredGames.push(currentGroup);
            }

            getGroup().games.push(game);
          }
        })
      );

      this.navigate();
    });
  }

  public openGallery(content: any, game: Game) {
    const modalRef = this.modalService.open(content, {
      size: 'lg',
      animation: false,
      backdrop: true,
      centered: true,
    });

    this.selectedGame = game;
  }
}
