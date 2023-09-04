import { Injectable, InjectionToken, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * describes a configuration object for the OpenCV service
 */
export interface OpenCVConfig {
  /**
   * path to the directory containing the OpenCV files, in the form of '/path/to/<opencv directory>'
   * directory must contain the the following files:
   * --<OpenCvDir>
   * ----opencv.js
   * ----opencv_js.wasm
   */
  openCVDirPath?: string;
  /**
   * additional callback that will run when OpenCv has finished loading and parsing
   */
  runOnOpenCVInit?: Function;
}

export interface OpenCVState {
  ready: boolean;
  loading: boolean;
  error: boolean;
  state: string;
}

export const OpenCvConfigToken = new InjectionToken<OpenCVConfig>('OpenCV config object token');

@Injectable({
  providedIn: 'root',
})
export class NgxOpenCVService {
  cvState = new BehaviorSubject<OpenCVState>({
    ready: false,
    error: false,
    loading: true,
    state: 'loading',
  });
  configModule: OpenCvConfigModule;

  options: OpenCVConfig = {
    openCVDirPath: '/assets/opencv',
  };

  constructor(private _ngZone: NgZone) {
    this.configModule = this.generateConfigModule(this.options);
    this.loadOpenCv();
  }

  /**
   * load the OpenCV script
   */
  loadOpenCv() {
    this.cvState.next(this.newState('loading'));
    // create global module variable
    window['Module'] = this.configModule;

    // create script element and set attributes
    const script = <HTMLScriptElement>document.createElement('script');
    script.setAttribute('async', '');
    script.setAttribute('type', 'text/javascript');

    // listen for errors
    script.addEventListener(
      'error',
      () => {
        const err = new Error('Failed to load ' + this.configModule.scriptUrl);
        this.cvState.next(this.newState('error'));
        this.cvState.error(err);
      },
      { passive: true },
    );

    // set script url
    script.src = this.configModule.scriptUrl;
    // insert script as first script tag
    const node = document.getElementsByTagName('script')[0];
    if (node) {
      node.parentNode.insertBefore(script, node);
    } else {
      document.head.appendChild(script);
    }
  }

  /**
   * generates a new state object
   * @param change - the new state of the module
   */
  private newState(change: 'loading' | 'ready' | 'error'): OpenCVState {
    const newStateObj: OpenCVState = {
      ready: false,
      loading: false,
      error: false,
      state: '',
    };
    Object.keys(newStateObj).forEach((key) => {
      if (key !== 'state') {
        if (key === change) {
          newStateObj[key] = true;
          newStateObj.state = key;
        } else {
          newStateObj[key] = false;
        }
      }
    });
    return newStateObj;
  }

  /**
   * generates a config module for the global Module object
   * @param options - configuration options
   */
  private generateConfigModule(options: OpenCVConfig): OpenCvConfigModule {
    return {
      scriptUrl: options.openCVDirPath ? `${options.openCVDirPath}/opencv.js` : `/assets/opencv/opencv.js`,
      wasmBinaryFile: 'opencv_js.wasm',
      usingWasm: true,
      onRuntimeInitialized: () => {
        this._ngZone.run(() => {
          console.log('openCV Ready');
          this.cvState.next(this.newState('ready'));
          if (options.runOnOpenCVInit) {
            options.runOnOpenCVInit();
          }
        });
      },
    };
  }
}

/**
 * describes the global Module object that is used to initiate OpenCV.js
 */
interface OpenCvConfigModule {
  scriptUrl: string;
  wasmBinaryFile: string;
  usingWasm: boolean;
  onRuntimeInitialized: Function;
}
