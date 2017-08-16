import {
  Component,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { DataSource } from '@angular/cdk';
import {
  MdSort,
  MdPaginator
} from '@angular/material';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';

import { colorSets } from './color-sets';

/** Constants used to fill up the data base. */
const NAMES = ['Maia', 'Asher', 'Olivia', 'Atticus', 'Amelia', 'Jack',
  'Charlotte', 'Theodore', 'Isla', 'Oliver', 'Isabella', 'Jasper',
  'Cora', 'Levi', 'Violet', 'Arthur', 'Mia', 'Thomas', 'Elizabeth'];

const GOALNAMES = ['Follow Up', 'Feedback', 'Knowledge Transfer', 'Reinvention',
  'Self Investment', ''];

export interface UserData {
  id: string;
  name: string;
  score: string;
  manager: string;
  goal: string;
}

@Component({
  selector: 'my-goal-analytics',
  templateUrl: './goal-analytics.component.html',
  styleUrls: [ './goal-analytics.component.scss' ]
})
export class GoalAnalyticsComponent implements OnInit {

  @ViewChild(MdSort) public sort: MdSort;
  @ViewChild(MdPaginator) public paginator: MdPaginator;
  @ViewChild('filter') public filter: ElementRef;

  public view: any[] = [200, 100];
  public goals: any[] = GOALNAMES.slice(0);
  public employeeGoalStats: any[] = [];
  public employeePerformanceStats: any[] = [];
  public appraisalScoreAverage = 0;
  public colorSets = colorSets;
  public displayedColumns = ['userName', 'manager', 'goal', 'score'];
  public filteredColumns = ['name', 'manager'];
  public dataBase = new TableDatabase();
  public dataSource: TableDataSource | null;

  public ngOnInit() {
    this.dataSource = new TableDataSource(
      this.dataBase,
      this.sort,
      this.paginator
    );
    this.dataSource.connect().subscribe((res: any) => {
      this._setEmployeeGoalStats(res);
      this._setEmployeePerformanceStats(res);
      this._setAppraisalScoreAverage(res);
    });

    this.dataSource.filters = this.filteredColumns;

    Observable.fromEvent(this.filter.nativeElement, 'keyup')
      .debounceTime(150)
      .distinctUntilChanged()
      .subscribe(() => {
        if (!this.dataSource) { return; }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }

  public onSelect(event: any) {
    let substr = event.name.indexOf(' -');
    let name = event.name.substring(0, substr !== -1 ? substr : event.name.length);
    this.filteredColumns = ['name'];
    this.dataSource.filters = this.filteredColumns;
    this.filter.nativeElement.value = name;
    this.dataSource.filter = name;
  }

  public getFilter(filter: string) {
    let tmpIndex = this.filteredColumns.indexOf(filter);

    if (tmpIndex > -1) {
      return true;
    }
    return false;
  }

  public setFilter(event: any, filter: string) {
    let tmpIndex = this.filteredColumns.indexOf(filter);

    if (tmpIndex > -1) {
      if (!event.checked) {
        this.filteredColumns.splice(tmpIndex, 1);
      }
    } else {
      if (event.checked) {
        this.filteredColumns.push(filter);
      }
    }
  }

  private _setEmployeeGoalStats(data: UserData[]): void {
    let tmpEmployeesWithGoals = [];
    let tmpEmployeesWithoutGoals = [];

    data.map((employee: UserData) => {
      if (employee.goal !== '') {
        tmpEmployeesWithGoals.push(employee);
      } else {
        tmpEmployeesWithoutGoals.push(employee);
      }
    });

    let tmpReturn = [
      {
        name: 'Employees With Goals',
        value: tmpEmployeesWithGoals.length
      },
      {
        name: 'Employees Without Goals',
        value: tmpEmployeesWithoutGoals.length
      },
    ];

    this.employeeGoalStats = tmpReturn;
  }

  private _setEmployeePerformanceStats(data: UserData[]): void {
    let tmpReturn = [];

    data.map((employee: UserData) => {
      if (employee.goal !== '') {
        tmpReturn.push({
          id: employee.id,
          name: employee.name + ' - ' + employee.id,
          value: parseFloat(employee.score)
        });
      } else {
        tmpReturn.push({
          id: employee.id,
          name: employee.name + ' - ' + employee.id,
          value: 0
        });
      }
    });

    this.employeePerformanceStats = tmpReturn;
  }

  private _setAppraisalScoreAverage(data: UserData[]): void {
    let avg = 0;
    let sum = 0;
    let count = 0;
    data.map((employee: UserData) => {
      if (parseFloat(employee.score) > 0) {
        sum += parseFloat(employee.score);
        count++;
      }
    });
    avg = sum / count;

    this.appraisalScoreAverage = avg;
  }

}

export class TableDatabase {

  /** Stream that emits whenever the data has been modified. */
  public dataChange: BehaviorSubject<UserData[]> = new BehaviorSubject<UserData[]>([]);
  get data(): UserData[] { return this.dataChange.value; }

  constructor() {
    // Fill up the database with 100 users.
    for (let i = 0; i < 25; i++) { this.addUser(); }
  }

  /** Adds a new user to the database. */
  public addUser() {
    const copiedData = this.data.slice();
    copiedData.push(this.createNewUser());
    this.dataChange.next(copiedData);
  }

  /** Builds and returns a new User. */
  private createNewUser() {
    const name =
        NAMES[Math.round(Math.random() * (NAMES.length - 1))] + ' ' +
        NAMES[Math.round(Math.random() * (NAMES.length - 1))].charAt(0) + '.';

    const supervisorName =
        NAMES[Math.round(Math.random() * (NAMES.length - 1))] + ' ' +
        NAMES[Math.round(Math.random() * (NAMES.length - 1))].charAt(0) + '.';

    const goalName = GOALNAMES[Math.round(Math.random() * (GOALNAMES.length - 1))];

    return {
      id: (this.data.length + 1).toString(),
      name: name,
      manager: supervisorName,
      goal: goalName,
      score: goalName === '' ? '0' : (Math.random() * 5).toPrecision(2).toString()
    };
  }
}

export class TableDataSource extends DataSource<any> {

  get filter(): string { return this._filterChange.value; }
  set filter(filter: string) { this._filterChange.next(filter); }

  get filters(): string[] { return this._filtersChange.value; }
  set filters(filters: string[]) { this._filtersChange.next(filters); }

  private _filterChange = new BehaviorSubject('');
  private _filtersChange = new BehaviorSubject(['']);

  constructor(
    private _exampleDatabase: TableDatabase,
    private _sort: MdSort,
    private _paginator: MdPaginator
  ) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  public connect(): Observable<UserData[]> {
    const displayDataChanges = [
      this._exampleDatabase.dataChange,
      this._sort.mdSortChange,
      this._paginator.page,
      this._filterChange,
      this._filtersChange,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._exampleDatabase.data.slice();

      const filteredData = data.filter((item: UserData) => {
        let searchStr = '';
        this.filters.map((filter: string) => {
          if (item[filter]) {
            searchStr += item[filter].toLowerCase();
          }
        });
        return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
      });

      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      const pagedData = filteredData.splice(startIndex, this._paginator.pageSize);

      const sortedData = this.getSortedData(pagedData).slice();

      if (sortedData.length) {
        return sortedData;
      } else {
        return data;
      }
    });
  }

  public disconnect() {}

  /** Returns a sorted copy of the database data. */
  public getSortedData(data: UserData[]): UserData[] {
    if (!this._sort.active || this._sort.direction === '') { return data; }

    return data.sort((a, b) => {
      let propertyA: number|string = '';
      let propertyB: number|string = '';

      switch (this._sort.active) {
        case 'userId': [propertyA, propertyB] = [a.id, b.id]; break;
        case 'userName': [propertyA, propertyB] = [a.name, b.name]; break;
        case 'score': [propertyA, propertyB] = [a.score, b.score]; break;
        case 'manager': [propertyA, propertyB] = [a.manager, b.manager]; break;
        case 'goal': [propertyA, propertyB] = [a.goal, b.goal]; break;
      }

      let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1);
    });
  }
}
