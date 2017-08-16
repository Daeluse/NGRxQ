import {
  Component,
  OnInit
} from '@angular/core';

import { QlikService } from '../shared/qlik.service';

@Component({
  selector: 'my-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public type = 'pie';
  public fields: string[] = [];
  public fieldOne = 'Region';
  public fieldTwo = 'Production (mil hl)';
  public fieldThree = 'Year';

  // GenericObject Definitions
  public lbObjProb: GenericObjectProperties = {
    qInfo: {
      qId: '',
      qType: 'FieldList'
    },
    qExtendsId: '',
    qFieldListDef: {
      qShowSystem: false,
      qShowHidden: false,
      qShowSemantic: false,
      qShowSrcTables: true
    },
  };
  public single: any[] = [];
  public multi: any[] = [];

  public isMulti = false;
  public view: any[] = [700, 400];
  public showLegend = true;
  public showLabels = true;
  public explodeSlices = false;
  public doughnut = false;
  public colorScheme = {
    domain: [
      '#a8385d',
      '#7aa3e5',
      '#a27ea8',
      '#aae3f5',
      '#adcded',
      '#a95963',
      '#8796c0',
      '#7ed3ed',
      '#50abcc',
      '#ad6886'
    ]
  };

  private _app: AppObservable;
  private _fields: any;
  private _source: any;

  constructor( private _qlikService: QlikService ) {
    // Do stuff
  }

  public ngOnInit() {
    this._app = this._qlikService.getApp();

    this._fields = this._app.qCreateSessionObject(this.lbObjProb)
      .qLayouts()
      .pluck('qFieldList', 'qItems')
      .map((m: any) => {
        return m.map((n: any) => {
          return {
            id: n.qCardinal,
            value: n.qName
          };
        });
      })
      .subscribe((res: any) => {
        this.fields = res;
      });

    this.refreshApp();
  }

  public refreshApp() {
    if (this.type === 'bar' || this.type === 'pie') {
      this._refreshSingleApp();
      this.isMulti = false;
    } else {
      this._refreshMultiApp();
      this.isMulti = true;
    }
  }

  private _refreshSingleApp() {
    let genObjProp: GenericObjectProperties = {
      qInfo: {
        qType: 'chart'
      },
      qExtendsId: '',
      qHyperCubeDef: {
        qDimensions: [
          {
            qDef: {
              qFieldDefs: [
                this.fieldOne
              ]
            },
            qNullSuppression: true
          }
        ],
        qMeasures: [
          {
            qDef: {
              qDef: 'sum([' + this.fieldTwo + '])'
            }
          }
        ],
        qInitialDataFetch: [
          {
            qLeft: 0,
            qTop: 0,
            qWidth: 2,
            qHeight: 1000
          }
        ]
      }
    };

    this._source = this._app.qCreateSessionObject(genObjProp)
      .qLayouts()
      .map((m: any) => {
        console.log(m);
        return m;
      })
      .pluck('qHyperCube', 'qDataPages', 0, 'qMatrix')
      .map((m: any) => {
        return m.map((n: any) => {
          return {
            idx: n[0].qElemNumber,
            name: n[0].qText,
            value: n[1].qText
          };
        });
      })
      .subscribe((res: any) => {
        this.single = [ ...res ];
      });
  }

  private _refreshMultiApp() {
    let genObjProp: GenericObjectProperties = {
      qInfo: {
        qType: 'chart'
      },
      qExtendsId: '',
      qHyperCubeDef: {
        qDimensions: [
          {
            qDef: {
              qGrouping:  'N',
              qFieldDefs: [
                this.fieldOne
              ]
            },
            qNullSuppression: true
          },
          {
            qDef: {
              qGrouping:  'N',
              qFieldDefs: [
                this.fieldThree
              ]
            },
            qNullSuppression: true
          }
        ],
        qMeasures: [
          {
            qDef: {
              qGrouping:  'N',
              qDef: 'sum([' + this.fieldTwo + '])'
            }
          }
        ],
        qInitialDataFetch: [
          {
            qLeft: 0,
            qTop: 0,
            qWidth: 3,
            qHeight: 1000
          }
        ]
      }
    };

    this._source = this._app.qCreateSessionObject(genObjProp)
      .qLayouts()
      .map((m: any) => {
        console.log(m);
        return m;
      })
      .pluck('qHyperCube', 'qDataPages', 0, 'qMatrix')
      .map((m: any) => {
        return m.map((n: any) => {
          return {
            idx: n[0].qElemNumber,
            name: n[0].qText,
            series: [
              {
                name: n[1].qText,
                value: n[2].qText
              },
            ]
          };
        });
      })
      .subscribe((res: any) => {
        let tmpMulti = [];
        res.map((c: any) => {
          let existing = tmpMulti.filter((v) => {
            return v.name === c.name;
          });
          if (existing.length) {
            let existingIndex = tmpMulti.indexOf(existing[0]);
            tmpMulti[existingIndex].series = tmpMulti[existingIndex].series.concat(c.series);
          } else {
            if (typeof c.series === 'string') {
              c.series = [c.series];
            }
            tmpMulti.push(c);
          }
        });
        this.multi = tmpMulti;
      });
  }

}
