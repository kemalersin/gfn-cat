import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { eachSeries } from 'async';

import {
  assignIn,
  chain,
  difference,
  find,
  has,
  includes,
  isNil,
  join,
  map,
  some,
  split,
  without,
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

  public groupedGames: Array<any> = [];
  public filteredGames: Array<any> = [];
  public categories: Array<any> = [];
  public checkedCategories: Array<any> = [];

  public selectedGame: Game;

  public searchText: string = '';

  public loading: boolean = false;
  public filtering: boolean = false;
  public hasNoResult: boolean = true;

  destroy$: Subject<boolean> = new Subject<boolean>();

  public get isCategoriesChecked(): boolean {
    return some(this.checkedCategories);
  }

  public get hasFiltered(): boolean {
    return this.filtering || this.hasNoResult || some(this.filteredGames);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private JSONService: JSONService
  ) {}

  public ngOnInit() {
    this.loading = true;

    this.JSONService.getJSONData()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false))
      )
      .subscribe((games: Array<Game>) => {
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

        this.route.queryParams
          .pipe(takeUntil(this.destroy$))
          .subscribe((params: any) => {
            if (params.s || params.c) {
              this.searchText = params.s;

              if (params.c) {
                this.checkedCategories = split(params.c, ',');
              }

              this.filter();

              return;
            }

            this.resetFilteredGames();
          });
      });
  }

  public ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  public trackByFn(index: any, item: any) {
    return index;
  }

  public isChecked(category: string) {
    return includes(this.checkedCategories, this.formatText(category));
  }

  private formatText(text: string) {
    return chain(text).deburr().kebabCase().value();
  }

  private resetFilteredGames() {
    this.filteredGames = [];

    this.filtering = false;
    this.hasNoResult = false;
  }

  private navigate() {
    let queryParams: any = {};

    if (this.searchText) {
      queryParams.s = this.formatText(this.searchText);
    }

    if (this.isCategoriesChecked) {
      queryParams.c = join(this.checkedCategories);
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
    });
  }

  public selectCategory(event: any) {
    const category: string = this.formatText(event.target.value);

    event.target.checked
      ? this.checkedCategories.push(category)
      : (this.checkedCategories = without(this.checkedCategories, category));

    this.filter();
  }

  public filter(fromCategorySelect?: boolean) {
    this.navigate();

    setTimeout(() => {
      this.resetFilteredGames();

      if (!(this.isCategoriesChecked || this.searchText)) {
        return;
      }

      this.filtering = true;

      eachSeries(
        this.groupedGames,
        (group: any, cbGroup) => {
          eachSeries(group.games, (game: Game, cbGame) => {
            const gameName: string = this.formatText(game.name);
            const searchText: string = this.formatText(this.searchText);

            if (includes(gameName, searchText)) {
              const currentGroup: any = { letter: group.letter };

              const getGroup: Function = () =>
                find(this.filteredGames, currentGroup);

              if (this.isCategoriesChecked) {
                let gameCategories: Array<string> = map(
                  game.genres,
                  (genre: string) => this.formatText(genre)
                );

                if (
                  difference(this.checkedCategories, gameCategories).length !==
                  0
                ) {
                  return cbGame();
                }
              }

              if (!getGroup()) {
                assignIn(currentGroup, { games: [] });
                this.filteredGames.push(currentGroup);
              }

              getGroup().games.push(game);
            }

            cbGame();
          });

          cbGroup();
        },
        () => {
          this.filtering = false;
          this.hasNoResult = true;
        }
      );
    }, 250);
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
