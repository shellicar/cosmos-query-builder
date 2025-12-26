import { ILogger } from '../public/interfaces';

export class DefaultLogger extends ILogger {
  public debug(_message?: any, ..._optionalParams: any[]): void {}
  public info(_message?: any, ..._optionalParams: any[]): void {}
  public error(_message?: any, ..._optionalParams: any[]): void {}
  public warn(_message?: any, ..._optionalParams: any[]): void {}
  public verbose(_message?: any, ..._optionalParams: any[]): void {}
}
