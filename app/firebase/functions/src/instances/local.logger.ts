import fs from 'fs';
import * as util from 'util';

export enum LogLevel {
  debug = 'debug',
  info = 'info',
  notice = 'notice',
  warn = 'warn',
  error = 'error',
  critical = 'critical',
}

const levelDetails = (_level: LogLevel): { tag: string; num: number } => {
  if (_level === LogLevel.debug) {
    return { tag: 'DEBUG', num: 0 };
  }
  if (_level === LogLevel.info) {
    return { tag: 'INFO', num: 1 };
  }
  if (_level === LogLevel.notice) {
    return { tag: 'NOTICE', num: 2 };
  }
  if (_level === LogLevel.warn) {
    return { tag: 'WARN', num: 3 };
  }
  if (_level === LogLevel.error) {
    return { tag: 'ERROR', num: 4 };
  }
  if (_level === LogLevel.critical) {
    return { tag: 'CRITICAL', num: 5 };
  }

  throw new Error('Unexpected level');
};

/* eslint-disable */
export class LocalLogger {
  public msgLevel: LogLevel;
  public ctxLevel: LogLevel;
  public filters: string[];
  public muted: boolean;
  public outputFile?: string;

  constructor(
    _msgLevel?: LogLevel,
    _ctxLevel?: LogLevel,
    _filters: string[] = [],
    outputFile?: string
  ) {
    this.msgLevel = _msgLevel || LogLevel.info;
    this.ctxLevel = _ctxLevel || LogLevel.warn;
    this.filters = _filters;
    this.muted = false;
    this.outputFile = outputFile;
    if (this.outputFile) {
      console.info('Logging to file:', this.outputFile);
    }
  }

  private writeToFile(logMessage: string) {
    if (this.outputFile) {
      fs.appendFile(this.outputFile, logMessage + '\n', (err) => {
        if (err) {
          console.error('Failed to write to log file:', err);
        }
      });
    }
  }

  mute() {
    this.muted = true;
  }

  unmute() {
    this.muted = false;
  }

  pretty(_level: LogLevel, method: 'log' | 'warn' | 'error', args: any) {
    if (this.muted) return;

    const level = levelDetails(_level);
    const msgConfig = levelDetails(this.msgLevel);
    const ctxConfig = levelDetails(this.ctxLevel);

    if (level.num < msgConfig.num) {
      return;
    }

    const msg: string = Array.isArray(args)
      ? typeof args[0] === 'string'
        ? args[0]
        : 'no-message'
      : args;

    const obj = Array.isArray(args) ? args[1] : undefined;

    const prefix = Array.isArray(args) ? args[2] : undefined;

    const showCtx = level.num >= ctxConfig.num;

    /** filters */
    for (const filter of this.filters) {
      if (msg.startsWith(filter)) {
        return;
      }
    }

    const marker = `[${level.tag}]${prefix ? `[${prefix}]` : ''}`;

    if (this.outputFile) {
      this.writeToFile(`[${method}]: ${marker}: ${msg}`);
      if (showCtx && obj) {
        this.writeToFile(`[${method}]: object: ${JSON.stringify(obj)}`);
      }
    } else {
      if (showCtx) {
        console[method](
          `${marker}: ${msg}`,
          util.inspect(obj, { depth: 6, colors: true }) || ''
        );
      } else {
        console[method](`${marker}: ${msg}`);
      }
    }
  }

  debug(...args: any) {
    this.pretty(LogLevel.debug, 'log', args);
  }

  info(...args: any) {
    this.pretty(LogLevel.info, 'log', args);
  }

  notice(...args: any) {
    this.pretty(LogLevel.notice, 'log', args);
  }

  warn(...args: any) {
    this.pretty(LogLevel.warn, 'warn', args);
  }

  error(...args: any) {
    this.pretty(LogLevel.error, 'error', args);
  }

  critical(...args: any) {
    this.pretty(LogLevel.critical, 'error', args);
  }
}
