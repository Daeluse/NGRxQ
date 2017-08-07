import { Injectable } from '@angular/core';

let RxQ: any = require('rxq');

/**
 * This class provides the Qlik service with methods to read names and add names.
 */
@Injectable()
export class QlikService {

  private engine: any;
  private app: any;

  /**
   * Creates a new QlikService, do any setup here
   * @constructor
   */
  constructor() {
    // connect to engine
    this.engine = RxQ.connectEngine({
      host: 'playground.qlik.com',
      prefix: '/playground/',
      port: '443',
      isSecure: true,
      rejectUnauthorized: false,
      apiKey: 'lWhoLDBwA5b4amNBEXQFXqG04ZdQIjsh'
    }, 'warm');

    // open application - AirBnB QVF
    this.app = this.engine.qOpenDoc('21c7a902-a50e-414c-a8d5-8e72444dac0c');
  }

  getApp() {
    return this.app;
  }
}
