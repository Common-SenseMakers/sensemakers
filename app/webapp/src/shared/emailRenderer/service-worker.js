/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/workbox-core/_private.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Deferred: () => (/* reexport safe */ _private_Deferred_js__WEBPACK_IMPORTED_MODULE_6__.Deferred),
/* harmony export */   WorkboxError: () => (/* reexport safe */ _private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_13__.WorkboxError),
/* harmony export */   assert: () => (/* reexport safe */ _private_assert_js__WEBPACK_IMPORTED_MODULE_0__.assert),
/* harmony export */   cacheMatchIgnoreParams: () => (/* reexport safe */ _private_cacheMatchIgnoreParams_js__WEBPACK_IMPORTED_MODULE_2__.cacheMatchIgnoreParams),
/* harmony export */   cacheNames: () => (/* reexport safe */ _private_cacheNames_js__WEBPACK_IMPORTED_MODULE_1__.cacheNames),
/* harmony export */   canConstructReadableStream: () => (/* reexport safe */ _private_canConstructReadableStream_js__WEBPACK_IMPORTED_MODULE_3__.canConstructReadableStream),
/* harmony export */   canConstructResponseFromBodyStream: () => (/* reexport safe */ _private_canConstructResponseFromBodyStream_js__WEBPACK_IMPORTED_MODULE_4__.canConstructResponseFromBodyStream),
/* harmony export */   dontWaitFor: () => (/* reexport safe */ _private_dontWaitFor_js__WEBPACK_IMPORTED_MODULE_5__.dontWaitFor),
/* harmony export */   executeQuotaErrorCallbacks: () => (/* reexport safe */ _private_executeQuotaErrorCallbacks_js__WEBPACK_IMPORTED_MODULE_7__.executeQuotaErrorCallbacks),
/* harmony export */   getFriendlyURL: () => (/* reexport safe */ _private_getFriendlyURL_js__WEBPACK_IMPORTED_MODULE_8__.getFriendlyURL),
/* harmony export */   logger: () => (/* reexport safe */ _private_logger_js__WEBPACK_IMPORTED_MODULE_9__.logger),
/* harmony export */   resultingClientExists: () => (/* reexport safe */ _private_resultingClientExists_js__WEBPACK_IMPORTED_MODULE_10__.resultingClientExists),
/* harmony export */   timeout: () => (/* reexport safe */ _private_timeout_js__WEBPACK_IMPORTED_MODULE_11__.timeout),
/* harmony export */   waitUntil: () => (/* reexport safe */ _private_waitUntil_js__WEBPACK_IMPORTED_MODULE_12__.waitUntil)
/* harmony export */ });
/* harmony import */ var _private_assert_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/assert.js");
/* harmony import */ var _private_cacheNames_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_private/cacheNames.js");
/* harmony import */ var _private_cacheMatchIgnoreParams_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-core/_private/cacheMatchIgnoreParams.js");
/* harmony import */ var _private_canConstructReadableStream_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-core/_private/canConstructReadableStream.js");
/* harmony import */ var _private_canConstructResponseFromBodyStream_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./node_modules/workbox-core/_private/canConstructResponseFromBodyStream.js");
/* harmony import */ var _private_dontWaitFor_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./node_modules/workbox-core/_private/dontWaitFor.js");
/* harmony import */ var _private_Deferred_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("./node_modules/workbox-core/_private/Deferred.js");
/* harmony import */ var _private_executeQuotaErrorCallbacks_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__("./node_modules/workbox-core/_private/executeQuotaErrorCallbacks.js");
/* harmony import */ var _private_getFriendlyURL_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__("./node_modules/workbox-core/_private/getFriendlyURL.js");
/* harmony import */ var _private_logger_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__("./node_modules/workbox-core/_private/logger.js");
/* harmony import */ var _private_resultingClientExists_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__("./node_modules/workbox-core/_private/resultingClientExists.js");
/* harmony import */ var _private_timeout_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__("./node_modules/workbox-core/_private/timeout.js");
/* harmony import */ var _private_waitUntil_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__("./node_modules/workbox-core/_private/waitUntil.js");
/* harmony import */ var _private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__("./node_modules/workbox-core/_private/WorkboxError.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_14__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/
// We either expose defaults or we expose every named export.

















/***/ }),

/***/ "./node_modules/workbox-core/_private/Deferred.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Deferred: () => (/* binding */ Deferred)
/* harmony export */ });
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_0__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

/**
 * The Deferred class composes Promises in a way that allows for them to be
 * resolved or rejected from outside the constructor. In most cases promises
 * should be used directly, but Deferreds can be necessary when the logic to
 * resolve a promise must be separate.
 *
 * @private
 */
class Deferred {
  /**
   * Creates a promise and exposes its resolve and reject functions as methods.
   */
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}


/***/ }),

/***/ "./node_modules/workbox-core/_private/WorkboxError.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WorkboxError: () => (/* binding */ WorkboxError)
/* harmony export */ });
/* harmony import */ var _models_messages_messageGenerator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/models/messages/messageGenerator.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_1__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * Workbox errors should be thrown with this class.
 * This allows use to ensure the type easily in tests,
 * helps developers identify errors from workbox
 * easily and allows use to optimise error
 * messages correctly.
 *
 * @private
 */
class WorkboxError extends Error {
  /**
   *
   * @param {string} errorCode The error code that
   * identifies this particular error.
   * @param {Object=} details Any relevant arguments
   * that will help developers identify issues should
   * be added as a key on the context object.
   */
  constructor(errorCode, details) {
    const message = (0,_models_messages_messageGenerator_js__WEBPACK_IMPORTED_MODULE_0__.messageGenerator)(errorCode, details);
    super(message);
    this.name = errorCode;
    this.details = details;
  }
}


/***/ }),

/***/ "./node_modules/workbox-core/_private/assert.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   assert: () => (/* binding */ finalAssertExports)
/* harmony export */ });
/* harmony import */ var _private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/WorkboxError.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_1__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/*
 * This method throws if the supplied value is not an array.
 * The destructed values are required to produce a meaningful error for users.
 * The destructed and restructured object is so it's clear what is
 * needed.
 */
const isArray = (value, details) => {
  if (!Array.isArray(value)) {
    throw new _private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_0__.WorkboxError('not-an-array', details);
  }
};
const hasMethod = (object, expectedMethod, details) => {
  const type = typeof object[expectedMethod];
  if (type !== 'function') {
    details['expectedMethod'] = expectedMethod;
    throw new _private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_0__.WorkboxError('missing-a-method', details);
  }
};
const isType = (object, expectedType, details) => {
  if (typeof object !== expectedType) {
    details['expectedType'] = expectedType;
    throw new _private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_0__.WorkboxError('incorrect-type', details);
  }
};
const isInstance = (object,
// Need the general type to do the check later.
// eslint-disable-next-line @typescript-eslint/ban-types
expectedClass, details) => {
  if (!(object instanceof expectedClass)) {
    details['expectedClassName'] = expectedClass.name;
    throw new _private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_0__.WorkboxError('incorrect-class', details);
  }
};
const isOneOf = (value, validValues, details) => {
  if (!validValues.includes(value)) {
    details['validValueDescription'] = "Valid values are ".concat(JSON.stringify(validValues), ".");
    throw new _private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_0__.WorkboxError('invalid-value', details);
  }
};
const isArrayOfClass = (value,
// Need general type to do check later.
expectedClass,
// eslint-disable-line
details) => {
  const error = new _private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_0__.WorkboxError('not-array-of-class', details);
  if (!Array.isArray(value)) {
    throw error;
  }
  for (const item of value) {
    if (!(item instanceof expectedClass)) {
      throw error;
    }
  }
};
const finalAssertExports =  true ? null : 0;


/***/ }),

/***/ "./node_modules/workbox-core/_private/cacheMatchIgnoreParams.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cacheMatchIgnoreParams: () => (/* binding */ cacheMatchIgnoreParams)
/* harmony export */ });
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_0__);
/*
  Copyright 2020 Google LLC
  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

function stripParams(fullURL, ignoreParams) {
  const strippedURL = new URL(fullURL);
  for (const param of ignoreParams) {
    strippedURL.searchParams.delete(param);
  }
  return strippedURL.href;
}
/**
 * Matches an item in the cache, ignoring specific URL params. This is similar
 * to the `ignoreSearch` option, but it allows you to ignore just specific
 * params (while continuing to match on the others).
 *
 * @private
 * @param {Cache} cache
 * @param {Request} request
 * @param {Object} matchOptions
 * @param {Array<string>} ignoreParams
 * @return {Promise<Response|undefined>}
 */
async function cacheMatchIgnoreParams(cache, request, ignoreParams, matchOptions) {
  const strippedRequestURL = stripParams(request.url, ignoreParams);
  // If the request doesn't include any ignored params, match as normal.
  if (request.url === strippedRequestURL) {
    return cache.match(request, matchOptions);
  }
  // Otherwise, match by comparing keys
  const keysOptions = Object.assign(Object.assign({}, matchOptions), {
    ignoreSearch: true
  });
  const cacheKeys = await cache.keys(request, keysOptions);
  for (const cacheKey of cacheKeys) {
    const strippedCacheKeyURL = stripParams(cacheKey.url, ignoreParams);
    if (strippedRequestURL === strippedCacheKeyURL) {
      return cache.match(cacheKey, matchOptions);
    }
  }
  return;
}


/***/ }),

/***/ "./node_modules/workbox-core/_private/cacheNames.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cacheNames: () => (/* binding */ cacheNames)
/* harmony export */ });
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_0__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

const _cacheNameDetails = {
  googleAnalytics: 'googleAnalytics',
  precache: 'precache-v2',
  prefix: 'workbox',
  runtime: 'runtime',
  suffix: typeof registration !== 'undefined' ? registration.scope : ''
};
const _createCacheName = cacheName => {
  return [_cacheNameDetails.prefix, cacheName, _cacheNameDetails.suffix].filter(value => value && value.length > 0).join('-');
};
const eachCacheNameDetail = fn => {
  for (const key of Object.keys(_cacheNameDetails)) {
    fn(key);
  }
};
const cacheNames = {
  updateDetails: details => {
    eachCacheNameDetail(key => {
      if (typeof details[key] === 'string') {
        _cacheNameDetails[key] = details[key];
      }
    });
  },
  getGoogleAnalyticsName: userCacheName => {
    return userCacheName || _createCacheName(_cacheNameDetails.googleAnalytics);
  },
  getPrecacheName: userCacheName => {
    return userCacheName || _createCacheName(_cacheNameDetails.precache);
  },
  getPrefix: () => {
    return _cacheNameDetails.prefix;
  },
  getRuntimeName: userCacheName => {
    return userCacheName || _createCacheName(_cacheNameDetails.runtime);
  },
  getSuffix: () => {
    return _cacheNameDetails.suffix;
  }
};

/***/ }),

/***/ "./node_modules/workbox-core/_private/canConstructReadableStream.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   canConstructReadableStream: () => (/* binding */ canConstructReadableStream)
/* harmony export */ });
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_0__);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

let supportStatus;
/**
 * A utility function that determines whether the current browser supports
 * constructing a [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/ReadableStream)
 * object.
 *
 * @return {boolean} `true`, if the current browser can successfully
 *     construct a `ReadableStream`, `false` otherwise.
 *
 * @private
 */
function canConstructReadableStream() {
  if (supportStatus === undefined) {
    // See https://github.com/GoogleChrome/workbox/issues/1473
    try {
      new ReadableStream({
        start() {}
      });
      supportStatus = true;
    } catch (error) {
      supportStatus = false;
    }
  }
  return supportStatus;
}


/***/ }),

/***/ "./node_modules/workbox-core/_private/canConstructResponseFromBodyStream.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   canConstructResponseFromBodyStream: () => (/* binding */ canConstructResponseFromBodyStream)
/* harmony export */ });
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_0__);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

let supportStatus;
/**
 * A utility function that determines whether the current browser supports
 * constructing a new `Response` from a `response.body` stream.
 *
 * @return {boolean} `true`, if the current browser can successfully
 *     construct a `Response` from a `response.body` stream, `false` otherwise.
 *
 * @private
 */
function canConstructResponseFromBodyStream() {
  if (supportStatus === undefined) {
    const testResponse = new Response('');
    if ('body' in testResponse) {
      try {
        new Response(testResponse.body);
        supportStatus = true;
      } catch (error) {
        supportStatus = false;
      }
    }
    supportStatus = false;
  }
  return supportStatus;
}


/***/ }),

/***/ "./node_modules/workbox-core/_private/dontWaitFor.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   dontWaitFor: () => (/* binding */ dontWaitFor)
/* harmony export */ });
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_0__);
/*
  Copyright 2019 Google LLC
  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

/**
 * A helper function that prevents a promise from being flagged as unused.
 *
 * @private
 **/
function dontWaitFor(promise) {
  // Effective no-op.
  void promise.then(() => {});
}

/***/ }),

/***/ "./node_modules/workbox-core/_private/executeQuotaErrorCallbacks.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   executeQuotaErrorCallbacks: () => (/* binding */ executeQuotaErrorCallbacks)
/* harmony export */ });
/* harmony import */ var _private_logger_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/logger.js");
/* harmony import */ var _models_quotaErrorCallbacks_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/models/quotaErrorCallbacks.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_2__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/



/**
 * Runs all of the callback functions, one at a time sequentially, in the order
 * in which they were registered.
 *
 * @memberof workbox-core
 * @private
 */
async function executeQuotaErrorCallbacks() {
  if (false) {}
  for (const callback of _models_quotaErrorCallbacks_js__WEBPACK_IMPORTED_MODULE_1__.quotaErrorCallbacks) {
    await callback();
    if (false) {}
  }
  if (false) {}
}


/***/ }),

/***/ "./node_modules/workbox-core/_private/getFriendlyURL.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getFriendlyURL: () => (/* binding */ getFriendlyURL)
/* harmony export */ });
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_0__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

const getFriendlyURL = url => {
  const urlObj = new URL(String(url), location.href);
  // See https://github.com/GoogleChrome/workbox/issues/2323
  // We want to include everything, except for the origin if it's same-origin.
  return urlObj.href.replace(new RegExp("^".concat(location.origin)), '');
};


/***/ }),

/***/ "./node_modules/workbox-core/_private/logger.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   logger: () => (/* binding */ logger)
/* harmony export */ });
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_0__);
/*
  Copyright 2019 Google LLC
  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

const logger =  true ? null : 0;


/***/ }),

/***/ "./node_modules/workbox-core/_private/resultingClientExists.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   resultingClientExists: () => (/* binding */ resultingClientExists)
/* harmony export */ });
/* harmony import */ var _timeout_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/timeout.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_1__);
/*
  Copyright 2019 Google LLC
  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


const MAX_RETRY_TIME = 2000;
/**
 * Returns a promise that resolves to a window client matching the passed
 * `resultingClientId`. For browsers that don't support `resultingClientId`
 * or if waiting for the resulting client to apper takes too long, resolve to
 * `undefined`.
 *
 * @param {string} [resultingClientId]
 * @return {Promise<Client|undefined>}
 * @private
 */
async function resultingClientExists(resultingClientId) {
  if (!resultingClientId) {
    return;
  }
  let existingWindows = await self.clients.matchAll({
    type: 'window'
  });
  const existingWindowIds = new Set(existingWindows.map(w => w.id));
  let resultingWindow;
  const startTime = performance.now();
  // Only wait up to `MAX_RETRY_TIME` to find a matching client.
  while (performance.now() - startTime < MAX_RETRY_TIME) {
    existingWindows = await self.clients.matchAll({
      type: 'window'
    });
    resultingWindow = existingWindows.find(w => {
      if (resultingClientId) {
        // If we have a `resultingClientId`, we can match on that.
        return w.id === resultingClientId;
      } else {
        // Otherwise match on finding a window not in `existingWindowIds`.
        return !existingWindowIds.has(w.id);
      }
    });
    if (resultingWindow) {
      break;
    }
    // Sleep for 100ms and retry.
    await (0,_timeout_js__WEBPACK_IMPORTED_MODULE_0__.timeout)(100);
  }
  return resultingWindow;
}

/***/ }),

/***/ "./node_modules/workbox-core/_private/timeout.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   timeout: () => (/* binding */ timeout)
/* harmony export */ });
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_0__);
/*
  Copyright 2019 Google LLC
  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

/**
 * Returns a promise that resolves and the passed number of milliseconds.
 * This utility is an async/await-friendly version of `setTimeout`.
 *
 * @param {number} ms
 * @return {Promise}
 * @private
 */
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/***/ }),

/***/ "./node_modules/workbox-core/_private/waitUntil.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   waitUntil: () => (/* binding */ waitUntil)
/* harmony export */ });
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_0__);
/*
  Copyright 2020 Google LLC
  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

/**
 * A utility method that makes it easier to use `event.waitUntil` with
 * async functions and return the result.
 *
 * @param {ExtendableEvent} event
 * @param {Function} asyncFn
 * @return {Function}
 * @private
 */
function waitUntil(event, asyncFn) {
  const returnPromise = asyncFn();
  event.waitUntil(returnPromise);
  return returnPromise;
}


/***/ }),

/***/ "./node_modules/workbox-core/_version.js":
/***/ (() => {



// @ts-ignore
try {
  self['workbox:core:6.6.0'] && _();
} catch (e) {}

/***/ }),

/***/ "./node_modules/workbox-core/cacheNames.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cacheNames: () => (/* binding */ cacheNames)
/* harmony export */ });
/* harmony import */ var _private_cacheNames_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/cacheNames.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_1__);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * Get the current cache names and prefix/suffix used by Workbox.
 *
 * `cacheNames.precache` is used for precached assets,
 * `cacheNames.googleAnalytics` is used by `workbox-google-analytics` to
 * store `analytics.js`, and `cacheNames.runtime` is used for everything else.
 *
 * `cacheNames.prefix` can be used to retrieve just the current prefix value.
 * `cacheNames.suffix` can be used to retrieve just the current suffix value.
 *
 * @return {Object} An object with `precache`, `runtime`, `prefix`, and
 *     `googleAnalytics` properties.
 *
 * @memberof workbox-core
 */
const cacheNames = {
  get googleAnalytics() {
    return _private_cacheNames_js__WEBPACK_IMPORTED_MODULE_0__.cacheNames.getGoogleAnalyticsName();
  },
  get precache() {
    return _private_cacheNames_js__WEBPACK_IMPORTED_MODULE_0__.cacheNames.getPrecacheName();
  },
  get prefix() {
    return _private_cacheNames_js__WEBPACK_IMPORTED_MODULE_0__.cacheNames.getPrefix();
  },
  get runtime() {
    return _private_cacheNames_js__WEBPACK_IMPORTED_MODULE_0__.cacheNames.getRuntimeName();
  },
  get suffix() {
    return _private_cacheNames_js__WEBPACK_IMPORTED_MODULE_0__.cacheNames.getSuffix();
  }
};


/***/ }),

/***/ "./node_modules/workbox-core/clientsClaim.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clientsClaim: () => (/* binding */ clientsClaim)
/* harmony export */ });
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_0__);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

/**
 * Claim any currently available clients once the service worker
 * becomes active. This is normally used in conjunction with `skipWaiting()`.
 *
 * @memberof workbox-core
 */
function clientsClaim() {
  self.addEventListener('activate', () => self.clients.claim());
}


/***/ }),

/***/ "./node_modules/workbox-core/copyResponse.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   copyResponse: () => (/* binding */ copyResponse)
/* harmony export */ });
/* harmony import */ var _private_canConstructResponseFromBodyStream_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/canConstructResponseFromBodyStream.js");
/* harmony import */ var _private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_private/WorkboxError.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_2__);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/



/**
 * Allows developers to copy a response and modify its `headers`, `status`,
 * or `statusText` values (the values settable via a
 * [`ResponseInit`]{@link https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#Syntax}
 * object in the constructor).
 * To modify these values, pass a function as the second argument. That
 * function will be invoked with a single object with the response properties
 * `{headers, status, statusText}`. The return value of this function will
 * be used as the `ResponseInit` for the new `Response`. To change the values
 * either modify the passed parameter(s) and return it, or return a totally
 * new object.
 *
 * This method is intentionally limited to same-origin responses, regardless of
 * whether CORS was used or not.
 *
 * @param {Response} response
 * @param {Function} modifier
 * @memberof workbox-core
 */
async function copyResponse(response, modifier) {
  let origin = null;
  // If response.url isn't set, assume it's cross-origin and keep origin null.
  if (response.url) {
    const responseURL = new URL(response.url);
    origin = responseURL.origin;
  }
  if (origin !== self.location.origin) {
    throw new _private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_1__.WorkboxError('cross-origin-copy-response', {
      origin
    });
  }
  const clonedResponse = response.clone();
  // Create a fresh `ResponseInit` object by cloning the headers.
  const responseInit = {
    headers: new Headers(clonedResponse.headers),
    status: clonedResponse.status,
    statusText: clonedResponse.statusText
  };
  // Apply any user modifications.
  const modifiedResponseInit = modifier ? modifier(responseInit) : responseInit;
  // Create the new response from the body stream and `ResponseInit`
  // modifications. Note: not all browsers support the Response.body stream,
  // so fall back to reading the entire body into memory as a blob.
  const body = (0,_private_canConstructResponseFromBodyStream_js__WEBPACK_IMPORTED_MODULE_0__.canConstructResponseFromBodyStream)() ? clonedResponse.body : await clonedResponse.blob();
  return new Response(body, modifiedResponseInit);
}


/***/ }),

/***/ "./node_modules/workbox-core/index.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _private: () => (/* reexport module object */ _private_js__WEBPACK_IMPORTED_MODULE_1__),
/* harmony export */   cacheNames: () => (/* reexport safe */ _cacheNames_js__WEBPACK_IMPORTED_MODULE_2__.cacheNames),
/* harmony export */   clientsClaim: () => (/* reexport safe */ _clientsClaim_js__WEBPACK_IMPORTED_MODULE_4__.clientsClaim),
/* harmony export */   copyResponse: () => (/* reexport safe */ _copyResponse_js__WEBPACK_IMPORTED_MODULE_3__.copyResponse),
/* harmony export */   registerQuotaErrorCallback: () => (/* reexport safe */ _registerQuotaErrorCallback_js__WEBPACK_IMPORTED_MODULE_0__.registerQuotaErrorCallback),
/* harmony export */   setCacheNameDetails: () => (/* reexport safe */ _setCacheNameDetails_js__WEBPACK_IMPORTED_MODULE_5__.setCacheNameDetails),
/* harmony export */   skipWaiting: () => (/* reexport safe */ _skipWaiting_js__WEBPACK_IMPORTED_MODULE_6__.skipWaiting)
/* harmony export */ });
/* harmony import */ var _registerQuotaErrorCallback_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/registerQuotaErrorCallback.js");
/* harmony import */ var _private_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_private.js");
/* harmony import */ var _cacheNames_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-core/cacheNames.js");
/* harmony import */ var _copyResponse_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-core/copyResponse.js");
/* harmony import */ var _clientsClaim_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./node_modules/workbox-core/clientsClaim.js");
/* harmony import */ var _setCacheNameDetails_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./node_modules/workbox-core/setCacheNameDetails.js");
/* harmony import */ var _skipWaiting_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("./node_modules/workbox-core/skipWaiting.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _types_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__("./node_modules/workbox-core/types.js");
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/








/**
 * All of the Workbox service worker libraries use workbox-core for shared
 * code as well as setting default values that need to be shared (like cache
 * names).
 *
 * @module workbox-core
 */



/***/ }),

/***/ "./node_modules/workbox-core/models/messages/messageGenerator.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   messageGenerator: () => (/* binding */ messageGenerator)
/* harmony export */ });
/* harmony import */ var _messages_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/models/messages/messages.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_1__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


const fallback = function (code) {
  let msg = code;
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }
  if (args.length > 0) {
    msg += " :: ".concat(JSON.stringify(args));
  }
  return msg;
};
const generatorFunction = function (code) {
  let details = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const message = _messages_js__WEBPACK_IMPORTED_MODULE_0__.messages[code];
  if (!message) {
    throw new Error("Unable to find message for code '".concat(code, "'."));
  }
  return message(details);
};
const messageGenerator =  true ? fallback : 0;

/***/ }),

/***/ "./node_modules/workbox-core/models/messages/messages.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   messages: () => (/* binding */ messages)
/* harmony export */ });
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_0__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

const messages = {
  'invalid-value': _ref => {
    let {
      paramName,
      validValueDescription,
      value
    } = _ref;
    if (!paramName || !validValueDescription) {
      throw new Error("Unexpected input to 'invalid-value' error.");
    }
    return "The '".concat(paramName, "' parameter was given a value with an ") + "unexpected value. ".concat(validValueDescription, " Received a value of ") + "".concat(JSON.stringify(value), ".");
  },
  'not-an-array': _ref2 => {
    let {
      moduleName,
      className,
      funcName,
      paramName
    } = _ref2;
    if (!moduleName || !className || !funcName || !paramName) {
      throw new Error("Unexpected input to 'not-an-array' error.");
    }
    return "The parameter '".concat(paramName, "' passed into ") + "'".concat(moduleName, ".").concat(className, ".").concat(funcName, "()' must be an array.");
  },
  'incorrect-type': _ref3 => {
    let {
      expectedType,
      paramName,
      moduleName,
      className,
      funcName
    } = _ref3;
    if (!expectedType || !paramName || !moduleName || !funcName) {
      throw new Error("Unexpected input to 'incorrect-type' error.");
    }
    const classNameStr = className ? "".concat(className, ".") : '';
    return "The parameter '".concat(paramName, "' passed into ") + "'".concat(moduleName, ".").concat(classNameStr) + "".concat(funcName, "()' must be of type ").concat(expectedType, ".");
  },
  'incorrect-class': _ref4 => {
    let {
      expectedClassName,
      paramName,
      moduleName,
      className,
      funcName,
      isReturnValueProblem
    } = _ref4;
    if (!expectedClassName || !moduleName || !funcName) {
      throw new Error("Unexpected input to 'incorrect-class' error.");
    }
    const classNameStr = className ? "".concat(className, ".") : '';
    if (isReturnValueProblem) {
      return "The return value from " + "'".concat(moduleName, ".").concat(classNameStr).concat(funcName, "()' ") + "must be an instance of class ".concat(expectedClassName, ".");
    }
    return "The parameter '".concat(paramName, "' passed into ") + "'".concat(moduleName, ".").concat(classNameStr).concat(funcName, "()' ") + "must be an instance of class ".concat(expectedClassName, ".");
  },
  'missing-a-method': _ref5 => {
    let {
      expectedMethod,
      paramName,
      moduleName,
      className,
      funcName
    } = _ref5;
    if (!expectedMethod || !paramName || !moduleName || !className || !funcName) {
      throw new Error("Unexpected input to 'missing-a-method' error.");
    }
    return "".concat(moduleName, ".").concat(className, ".").concat(funcName, "() expected the ") + "'".concat(paramName, "' parameter to expose a '").concat(expectedMethod, "' method.");
  },
  'add-to-cache-list-unexpected-type': _ref6 => {
    let {
      entry
    } = _ref6;
    return "An unexpected entry was passed to " + "'workbox-precaching.PrecacheController.addToCacheList()' The entry " + "'".concat(JSON.stringify(entry), "' isn't supported. You must supply an array of ") + "strings with one or more characters, objects with a url property or " + "Request objects.";
  },
  'add-to-cache-list-conflicting-entries': _ref7 => {
    let {
      firstEntry,
      secondEntry
    } = _ref7;
    if (!firstEntry || !secondEntry) {
      throw new Error("Unexpected input to " + "'add-to-cache-list-duplicate-entries' error.");
    }
    return "Two of the entries passed to " + "'workbox-precaching.PrecacheController.addToCacheList()' had the URL " + "".concat(firstEntry, " but different revision details. Workbox is ") + "unable to cache and version the asset correctly. Please remove one " + "of the entries.";
  },
  'plugin-error-request-will-fetch': _ref8 => {
    let {
      thrownErrorMessage
    } = _ref8;
    if (!thrownErrorMessage) {
      throw new Error("Unexpected input to " + "'plugin-error-request-will-fetch', error.");
    }
    return "An error was thrown by a plugins 'requestWillFetch()' method. " + "The thrown error message was: '".concat(thrownErrorMessage, "'.");
  },
  'invalid-cache-name': _ref9 => {
    let {
      cacheNameId,
      value
    } = _ref9;
    if (!cacheNameId) {
      throw new Error("Expected a 'cacheNameId' for error 'invalid-cache-name'");
    }
    return "You must provide a name containing at least one character for " + "setCacheDetails({".concat(cacheNameId, ": '...'}). Received a value of ") + "'".concat(JSON.stringify(value), "'");
  },
  'unregister-route-but-not-found-with-method': _ref10 => {
    let {
      method
    } = _ref10;
    if (!method) {
      throw new Error("Unexpected input to " + "'unregister-route-but-not-found-with-method' error.");
    }
    return "The route you're trying to unregister was not  previously " + "registered for the method type '".concat(method, "'.");
  },
  'unregister-route-route-not-registered': () => {
    return "The route you're trying to unregister was not previously " + "registered.";
  },
  'queue-replay-failed': _ref11 => {
    let {
      name
    } = _ref11;
    return "Replaying the background sync queue '".concat(name, "' failed.");
  },
  'duplicate-queue-name': _ref12 => {
    let {
      name
    } = _ref12;
    return "The Queue name '".concat(name, "' is already being used. ") + "All instances of backgroundSync.Queue must be given unique names.";
  },
  'expired-test-without-max-age': _ref13 => {
    let {
      methodName,
      paramName
    } = _ref13;
    return "The '".concat(methodName, "()' method can only be used when the ") + "'".concat(paramName, "' is used in the constructor.");
  },
  'unsupported-route-type': _ref14 => {
    let {
      moduleName,
      className,
      funcName,
      paramName
    } = _ref14;
    return "The supplied '".concat(paramName, "' parameter was an unsupported type. ") + "Please check the docs for ".concat(moduleName, ".").concat(className, ".").concat(funcName, " for ") + "valid input types.";
  },
  'not-array-of-class': _ref15 => {
    let {
      value,
      expectedClass,
      moduleName,
      className,
      funcName,
      paramName
    } = _ref15;
    return "The supplied '".concat(paramName, "' parameter must be an array of ") + "'".concat(expectedClass, "' objects. Received '").concat(JSON.stringify(value), ",'. ") + "Please check the call to ".concat(moduleName, ".").concat(className, ".").concat(funcName, "() ") + "to fix the issue.";
  },
  'max-entries-or-age-required': _ref16 => {
    let {
      moduleName,
      className,
      funcName
    } = _ref16;
    return "You must define either config.maxEntries or config.maxAgeSeconds" + "in ".concat(moduleName, ".").concat(className, ".").concat(funcName);
  },
  'statuses-or-headers-required': _ref17 => {
    let {
      moduleName,
      className,
      funcName
    } = _ref17;
    return "You must define either config.statuses or config.headers" + "in ".concat(moduleName, ".").concat(className, ".").concat(funcName);
  },
  'invalid-string': _ref18 => {
    let {
      moduleName,
      funcName,
      paramName
    } = _ref18;
    if (!paramName || !moduleName || !funcName) {
      throw new Error("Unexpected input to 'invalid-string' error.");
    }
    return "When using strings, the '".concat(paramName, "' parameter must start with ") + "'http' (for cross-origin matches) or '/' (for same-origin matches). " + "Please see the docs for ".concat(moduleName, ".").concat(funcName, "() for ") + "more info.";
  },
  'channel-name-required': () => {
    return "You must provide a channelName to construct a " + "BroadcastCacheUpdate instance.";
  },
  'invalid-responses-are-same-args': () => {
    return "The arguments passed into responsesAreSame() appear to be " + "invalid. Please ensure valid Responses are used.";
  },
  'expire-custom-caches-only': () => {
    return "You must provide a 'cacheName' property when using the " + "expiration plugin with a runtime caching strategy.";
  },
  'unit-must-be-bytes': _ref19 => {
    let {
      normalizedRangeHeader
    } = _ref19;
    if (!normalizedRangeHeader) {
      throw new Error("Unexpected input to 'unit-must-be-bytes' error.");
    }
    return "The 'unit' portion of the Range header must be set to 'bytes'. " + "The Range header provided was \"".concat(normalizedRangeHeader, "\"");
  },
  'single-range-only': _ref20 => {
    let {
      normalizedRangeHeader
    } = _ref20;
    if (!normalizedRangeHeader) {
      throw new Error("Unexpected input to 'single-range-only' error.");
    }
    return "Multiple ranges are not supported. Please use a  single start " + "value, and optional end value. The Range header provided was " + "\"".concat(normalizedRangeHeader, "\"");
  },
  'invalid-range-values': _ref21 => {
    let {
      normalizedRangeHeader
    } = _ref21;
    if (!normalizedRangeHeader) {
      throw new Error("Unexpected input to 'invalid-range-values' error.");
    }
    return "The Range header is missing both start and end values. At least " + "one of those values is needed. The Range header provided was " + "\"".concat(normalizedRangeHeader, "\"");
  },
  'no-range-header': () => {
    return "No Range header was found in the Request provided.";
  },
  'range-not-satisfiable': _ref22 => {
    let {
      size,
      start,
      end
    } = _ref22;
    return "The start (".concat(start, ") and end (").concat(end, ") values in the Range are ") + "not satisfiable by the cached response, which is ".concat(size, " bytes.");
  },
  'attempt-to-cache-non-get-request': _ref23 => {
    let {
      url,
      method
    } = _ref23;
    return "Unable to cache '".concat(url, "' because it is a '").concat(method, "' request and ") + "only 'GET' requests can be cached.";
  },
  'cache-put-with-no-response': _ref24 => {
    let {
      url
    } = _ref24;
    return "There was an attempt to cache '".concat(url, "' but the response was not ") + "defined.";
  },
  'no-response': _ref25 => {
    let {
      url,
      error
    } = _ref25;
    let message = "The strategy could not generate a response for '".concat(url, "'.");
    if (error) {
      message += " The underlying error is ".concat(error, ".");
    }
    return message;
  },
  'bad-precaching-response': _ref26 => {
    let {
      url,
      status
    } = _ref26;
    return "The precaching request for '".concat(url, "' failed") + (status ? " with an HTTP status of ".concat(status, ".") : ".");
  },
  'non-precached-url': _ref27 => {
    let {
      url
    } = _ref27;
    return "createHandlerBoundToURL('".concat(url, "') was called, but that URL is ") + "not precached. Please pass in a URL that is precached instead.";
  },
  'add-to-cache-list-conflicting-integrities': _ref28 => {
    let {
      url
    } = _ref28;
    return "Two of the entries passed to " + "'workbox-precaching.PrecacheController.addToCacheList()' had the URL " + "".concat(url, " with different integrity values. Please remove one of them.");
  },
  'missing-precache-entry': _ref29 => {
    let {
      cacheName,
      url
    } = _ref29;
    return "Unable to find a precached response in ".concat(cacheName, " for ").concat(url, ".");
  },
  'cross-origin-copy-response': _ref30 => {
    let {
      origin
    } = _ref30;
    return "workbox-core.copyResponse() can only be used with same-origin " + "responses. It was passed a response with origin ".concat(origin, ".");
  },
  'opaque-streams-source': _ref31 => {
    let {
      type
    } = _ref31;
    const message = "One of the workbox-streams sources resulted in an " + "'".concat(type, "' response.");
    if (type === 'opaqueredirect') {
      return "".concat(message, " Please do not use a navigation request that results ") + "in a redirect as a source.";
    }
    return "".concat(message, " Please ensure your sources are CORS-enabled.");
  }
};

/***/ }),

/***/ "./node_modules/workbox-core/models/quotaErrorCallbacks.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   quotaErrorCallbacks: () => (/* binding */ quotaErrorCallbacks)
/* harmony export */ });
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_0__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

// Callbacks to be executed whenever there's a quota error.
// Can't change Function type right now.
// eslint-disable-next-line @typescript-eslint/ban-types
const quotaErrorCallbacks = new Set();


/***/ }),

/***/ "./node_modules/workbox-core/registerQuotaErrorCallback.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   registerQuotaErrorCallback: () => (/* binding */ registerQuotaErrorCallback)
/* harmony export */ });
/* harmony import */ var _private_logger_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/logger.js");
/* harmony import */ var _private_assert_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_private/assert.js");
/* harmony import */ var _models_quotaErrorCallbacks_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-core/models/quotaErrorCallbacks.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_3__);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/




/**
 * Adds a function to the set of quotaErrorCallbacks that will be executed if
 * there's a quota error.
 *
 * @param {Function} callback
 * @memberof workbox-core
 */
// Can't change Function type
// eslint-disable-next-line @typescript-eslint/ban-types
function registerQuotaErrorCallback(callback) {
  if (false) {}
  _models_quotaErrorCallbacks_js__WEBPACK_IMPORTED_MODULE_2__.quotaErrorCallbacks.add(callback);
  if (false) {}
}


/***/ }),

/***/ "./node_modules/workbox-core/setCacheNameDetails.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   setCacheNameDetails: () => (/* binding */ setCacheNameDetails)
/* harmony export */ });
/* harmony import */ var _private_assert_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/assert.js");
/* harmony import */ var _private_cacheNames_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_private/cacheNames.js");
/* harmony import */ var _private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-core/_private/WorkboxError.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_3__);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/




/**
 * Modifies the default cache names used by the Workbox packages.
 * Cache names are generated as `<prefix>-<Cache Name>-<suffix>`.
 *
 * @param {Object} details
 * @param {Object} [details.prefix] The string to add to the beginning of
 *     the precache and runtime cache names.
 * @param {Object} [details.suffix] The string to add to the end of
 *     the precache and runtime cache names.
 * @param {Object} [details.precache] The cache name to use for precache
 *     caching.
 * @param {Object} [details.runtime] The cache name to use for runtime caching.
 * @param {Object} [details.googleAnalytics] The cache name to use for
 *     `workbox-google-analytics` caching.
 *
 * @memberof workbox-core
 */
function setCacheNameDetails(details) {
  if (false) {}
  _private_cacheNames_js__WEBPACK_IMPORTED_MODULE_1__.cacheNames.updateDetails(details);
}


/***/ }),

/***/ "./node_modules/workbox-core/skipWaiting.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   skipWaiting: () => (/* binding */ skipWaiting)
/* harmony export */ });
/* harmony import */ var _private_logger_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/logger.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_1__);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * This method is deprecated, and will be removed in Workbox v7.
 *
 * Calling self.skipWaiting() is equivalent, and should be used instead.
 *
 * @memberof workbox-core
 */
function skipWaiting() {
  // Just call self.skipWaiting() directly.
  // See https://github.com/GoogleChrome/workbox/issues/2525
  if (false) {}
  void self.skipWaiting();
}


/***/ }),

/***/ "./node_modules/workbox-core/types.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_0__);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/***/ }),

/***/ "./node_modules/workbox-expiration/CacheExpiration.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CacheExpiration: () => (/* binding */ CacheExpiration)
/* harmony export */ });
/* harmony import */ var workbox_core_private_assert_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/assert.js");
/* harmony import */ var workbox_core_private_dontWaitFor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_private/dontWaitFor.js");
/* harmony import */ var workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-core/_private/logger.js");
/* harmony import */ var workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-core/_private/WorkboxError.js");
/* harmony import */ var _models_CacheTimestampsModel_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./node_modules/workbox-expiration/models/CacheTimestampsModel.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./node_modules/workbox-expiration/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_5__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/






/**
 * The `CacheExpiration` class allows you define an expiration and / or
 * limit on the number of responses stored in a
 * [`Cache`](https://developer.mozilla.org/en-US/docs/Web/API/Cache).
 *
 * @memberof workbox-expiration
 */
class CacheExpiration {
  /**
   * To construct a new CacheExpiration instance you must provide at least
   * one of the `config` properties.
   *
   * @param {string} cacheName Name of the cache to apply restrictions to.
   * @param {Object} config
   * @param {number} [config.maxEntries] The maximum number of entries to cache.
   * Entries used the least will be removed as the maximum is reached.
   * @param {number} [config.maxAgeSeconds] The maximum age of an entry before
   * it's treated as stale and removed.
   * @param {Object} [config.matchOptions] The [`CacheQueryOptions`](https://developer.mozilla.org/en-US/docs/Web/API/Cache/delete#Parameters)
   * that will be used when calling `delete()` on the cache.
   */
  constructor(cacheName) {
    let config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    this._isRunning = false;
    this._rerunRequested = false;
    if (false) {}
    this._maxEntries = config.maxEntries;
    this._maxAgeSeconds = config.maxAgeSeconds;
    this._matchOptions = config.matchOptions;
    this._cacheName = cacheName;
    this._timestampModel = new _models_CacheTimestampsModel_js__WEBPACK_IMPORTED_MODULE_4__.CacheTimestampsModel(cacheName);
  }
  /**
   * Expires entries for the given cache and given criteria.
   */
  async expireEntries() {
    if (this._isRunning) {
      this._rerunRequested = true;
      return;
    }
    this._isRunning = true;
    const minTimestamp = this._maxAgeSeconds ? Date.now() - this._maxAgeSeconds * 1000 : 0;
    const urlsExpired = await this._timestampModel.expireEntries(minTimestamp, this._maxEntries);
    // Delete URLs from the cache
    const cache = await self.caches.open(this._cacheName);
    for (const url of urlsExpired) {
      await cache.delete(url, this._matchOptions);
    }
    if (false) {}
    this._isRunning = false;
    if (this._rerunRequested) {
      this._rerunRequested = false;
      (0,workbox_core_private_dontWaitFor_js__WEBPACK_IMPORTED_MODULE_1__.dontWaitFor)(this.expireEntries());
    }
  }
  /**
   * Update the timestamp for the given URL. This ensures the when
   * removing entries based on maximum entries, most recently used
   * is accurate or when expiring, the timestamp is up-to-date.
   *
   * @param {string} url
   */
  async updateTimestamp(url) {
    if (false) {}
    await this._timestampModel.setTimestamp(url, Date.now());
  }
  /**
   * Can be used to check if a URL has expired or not before it's used.
   *
   * This requires a look up from IndexedDB, so can be slow.
   *
   * Note: This method will not remove the cached entry, call
   * `expireEntries()` to remove indexedDB and Cache entries.
   *
   * @param {string} url
   * @return {boolean}
   */
  async isURLExpired(url) {
    if (!this._maxAgeSeconds) {
      if (false) {}
      return false;
    } else {
      const timestamp = await this._timestampModel.getTimestamp(url);
      const expireOlderThan = Date.now() - this._maxAgeSeconds * 1000;
      return timestamp !== undefined ? timestamp < expireOlderThan : true;
    }
  }
  /**
   * Removes the IndexedDB object store used to keep track of cache expiration
   * metadata.
   */
  async delete() {
    // Make sure we don't attempt another rerun if we're called in the middle of
    // a cache expiration.
    this._rerunRequested = false;
    await this._timestampModel.expireEntries(Infinity); // Expires all.
  }
}


/***/ }),

/***/ "./node_modules/workbox-expiration/ExpirationPlugin.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ExpirationPlugin: () => (/* binding */ ExpirationPlugin)
/* harmony export */ });
/* harmony import */ var workbox_core_private_assert_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/assert.js");
/* harmony import */ var workbox_core_private_cacheNames_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_private/cacheNames.js");
/* harmony import */ var workbox_core_private_dontWaitFor_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-core/_private/dontWaitFor.js");
/* harmony import */ var workbox_core_private_getFriendlyURL_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-core/_private/getFriendlyURL.js");
/* harmony import */ var workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./node_modules/workbox-core/_private/logger.js");
/* harmony import */ var workbox_core_registerQuotaErrorCallback_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./node_modules/workbox-core/registerQuotaErrorCallback.js");
/* harmony import */ var workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("./node_modules/workbox-core/_private/WorkboxError.js");
/* harmony import */ var _CacheExpiration_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__("./node_modules/workbox-expiration/CacheExpiration.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__("./node_modules/workbox-expiration/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_8__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/









/**
 * This plugin can be used in a `workbox-strategy` to regularly enforce a
 * limit on the age and / or the number of cached requests.
 *
 * It can only be used with `workbox-strategy` instances that have a
 * [custom `cacheName` property set](/web/tools/workbox/guides/configure-workbox#custom_cache_names_in_strategies).
 * In other words, it can't be used to expire entries in strategy that uses the
 * default runtime cache name.
 *
 * Whenever a cached response is used or updated, this plugin will look
 * at the associated cache and remove any old or extra responses.
 *
 * When using `maxAgeSeconds`, responses may be used *once* after expiring
 * because the expiration clean up will not have occurred until *after* the
 * cached response has been used. If the response has a "Date" header, then
 * a light weight expiration check is performed and the response will not be
 * used immediately.
 *
 * When using `maxEntries`, the entry least-recently requested will be removed
 * from the cache first.
 *
 * @memberof workbox-expiration
 */
class ExpirationPlugin {
  /**
   * @param {ExpirationPluginOptions} config
   * @param {number} [config.maxEntries] The maximum number of entries to cache.
   * Entries used the least will be removed as the maximum is reached.
   * @param {number} [config.maxAgeSeconds] The maximum age of an entry before
   * it's treated as stale and removed.
   * @param {Object} [config.matchOptions] The [`CacheQueryOptions`](https://developer.mozilla.org/en-US/docs/Web/API/Cache/delete#Parameters)
   * that will be used when calling `delete()` on the cache.
   * @param {boolean} [config.purgeOnQuotaError] Whether to opt this cache in to
   * automatic deletion if the available storage quota has been exceeded.
   */
  constructor() {
    let config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    /**
     * A "lifecycle" callback that will be triggered automatically by the
     * `workbox-strategies` handlers when a `Response` is about to be returned
     * from a [Cache](https://developer.mozilla.org/en-US/docs/Web/API/Cache) to
     * the handler. It allows the `Response` to be inspected for freshness and
     * prevents it from being used if the `Response`'s `Date` header value is
     * older than the configured `maxAgeSeconds`.
     *
     * @param {Object} options
     * @param {string} options.cacheName Name of the cache the response is in.
     * @param {Response} options.cachedResponse The `Response` object that's been
     *     read from a cache and whose freshness should be checked.
     * @return {Response} Either the `cachedResponse`, if it's
     *     fresh, or `null` if the `Response` is older than `maxAgeSeconds`.
     *
     * @private
     */
    this.cachedResponseWillBeUsed = async _ref => {
      let {
        event,
        request,
        cacheName,
        cachedResponse
      } = _ref;
      if (!cachedResponse) {
        return null;
      }
      const isFresh = this._isResponseDateFresh(cachedResponse);
      // Expire entries to ensure that even if the expiration date has
      // expired, it'll only be used once.
      const cacheExpiration = this._getCacheExpiration(cacheName);
      (0,workbox_core_private_dontWaitFor_js__WEBPACK_IMPORTED_MODULE_2__.dontWaitFor)(cacheExpiration.expireEntries());
      // Update the metadata for the request URL to the current timestamp,
      // but don't `await` it as we don't want to block the response.
      const updateTimestampDone = cacheExpiration.updateTimestamp(request.url);
      if (event) {
        try {
          event.waitUntil(updateTimestampDone);
        } catch (error) {
          if (false) {}
        }
      }
      return isFresh ? cachedResponse : null;
    };
    /**
     * A "lifecycle" callback that will be triggered automatically by the
     * `workbox-strategies` handlers when an entry is added to a cache.
     *
     * @param {Object} options
     * @param {string} options.cacheName Name of the cache that was updated.
     * @param {string} options.request The Request for the cached entry.
     *
     * @private
     */
    this.cacheDidUpdate = async _ref2 => {
      let {
        cacheName,
        request
      } = _ref2;
      if (false) {}
      const cacheExpiration = this._getCacheExpiration(cacheName);
      await cacheExpiration.updateTimestamp(request.url);
      await cacheExpiration.expireEntries();
    };
    if (false) {}
    this._config = config;
    this._maxAgeSeconds = config.maxAgeSeconds;
    this._cacheExpirations = new Map();
    if (config.purgeOnQuotaError) {
      (0,workbox_core_registerQuotaErrorCallback_js__WEBPACK_IMPORTED_MODULE_5__.registerQuotaErrorCallback)(() => this.deleteCacheAndMetadata());
    }
  }
  /**
   * A simple helper method to return a CacheExpiration instance for a given
   * cache name.
   *
   * @param {string} cacheName
   * @return {CacheExpiration}
   *
   * @private
   */
  _getCacheExpiration(cacheName) {
    if (cacheName === workbox_core_private_cacheNames_js__WEBPACK_IMPORTED_MODULE_1__.cacheNames.getRuntimeName()) {
      throw new workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_6__.WorkboxError('expire-custom-caches-only');
    }
    let cacheExpiration = this._cacheExpirations.get(cacheName);
    if (!cacheExpiration) {
      cacheExpiration = new _CacheExpiration_js__WEBPACK_IMPORTED_MODULE_7__.CacheExpiration(cacheName, this._config);
      this._cacheExpirations.set(cacheName, cacheExpiration);
    }
    return cacheExpiration;
  }
  /**
   * @param {Response} cachedResponse
   * @return {boolean}
   *
   * @private
   */
  _isResponseDateFresh(cachedResponse) {
    if (!this._maxAgeSeconds) {
      // We aren't expiring by age, so return true, it's fresh
      return true;
    }
    // Check if the 'date' header will suffice a quick expiration check.
    // See https://github.com/GoogleChromeLabs/sw-toolbox/issues/164 for
    // discussion.
    const dateHeaderTimestamp = this._getDateHeaderTimestamp(cachedResponse);
    if (dateHeaderTimestamp === null) {
      // Unable to parse date, so assume it's fresh.
      return true;
    }
    // If we have a valid headerTime, then our response is fresh iff the
    // headerTime plus maxAgeSeconds is greater than the current time.
    const now = Date.now();
    return dateHeaderTimestamp >= now - this._maxAgeSeconds * 1000;
  }
  /**
   * This method will extract the data header and parse it into a useful
   * value.
   *
   * @param {Response} cachedResponse
   * @return {number|null}
   *
   * @private
   */
  _getDateHeaderTimestamp(cachedResponse) {
    if (!cachedResponse.headers.has('date')) {
      return null;
    }
    const dateHeader = cachedResponse.headers.get('date');
    const parsedDate = new Date(dateHeader);
    const headerTime = parsedDate.getTime();
    // If the Date header was invalid for some reason, parsedDate.getTime()
    // will return NaN.
    if (isNaN(headerTime)) {
      return null;
    }
    return headerTime;
  }
  /**
   * This is a helper method that performs two operations:
   *
   * - Deletes *all* the underlying Cache instances associated with this plugin
   * instance, by calling caches.delete() on your behalf.
   * - Deletes the metadata from IndexedDB used to keep track of expiration
   * details for each Cache instance.
   *
   * When using cache expiration, calling this method is preferable to calling
   * `caches.delete()` directly, since this will ensure that the IndexedDB
   * metadata is also cleanly removed and open IndexedDB instances are deleted.
   *
   * Note that if you're *not* using cache expiration for a given cache, calling
   * `caches.delete()` and passing in the cache's name should be sufficient.
   * There is no Workbox-specific method needed for cleanup in that case.
   */
  async deleteCacheAndMetadata() {
    // Do this one at a time instead of all at once via `Promise.all()` to
    // reduce the chance of inconsistency if a promise rejects.
    for (const [cacheName, cacheExpiration] of this._cacheExpirations) {
      await self.caches.delete(cacheName);
      await cacheExpiration.delete();
    }
    // Reset this._cacheExpirations to its initial state.
    this._cacheExpirations = new Map();
  }
}


/***/ }),

/***/ "./node_modules/workbox-expiration/_version.js":
/***/ (() => {



// @ts-ignore
try {
  self['workbox:expiration:6.6.0'] && _();
} catch (e) {}

/***/ }),

/***/ "./node_modules/workbox-expiration/index.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CacheExpiration: () => (/* reexport safe */ _CacheExpiration_js__WEBPACK_IMPORTED_MODULE_0__.CacheExpiration),
/* harmony export */   ExpirationPlugin: () => (/* reexport safe */ _ExpirationPlugin_js__WEBPACK_IMPORTED_MODULE_1__.ExpirationPlugin)
/* harmony export */ });
/* harmony import */ var _CacheExpiration_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-expiration/CacheExpiration.js");
/* harmony import */ var _ExpirationPlugin_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-expiration/ExpirationPlugin.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-expiration/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_2__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/



/**
 * @module workbox-expiration
 */


/***/ }),

/***/ "./node_modules/workbox-expiration/models/CacheTimestampsModel.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CacheTimestampsModel: () => (/* binding */ CacheTimestampsModel)
/* harmony export */ });
/* harmony import */ var idb__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/idb/build/index.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-expiration/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_1__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


const DB_NAME = 'workbox-expiration';
const CACHE_OBJECT_STORE = 'cache-entries';
const normalizeURL = unNormalizedUrl => {
  const url = new URL(unNormalizedUrl, location.href);
  url.hash = '';
  return url.href;
};
/**
 * Returns the timestamp model.
 *
 * @private
 */
class CacheTimestampsModel {
  /**
   *
   * @param {string} cacheName
   *
   * @private
   */
  constructor(cacheName) {
    this._db = null;
    this._cacheName = cacheName;
  }
  /**
   * Performs an upgrade of indexedDB.
   *
   * @param {IDBPDatabase<CacheDbSchema>} db
   *
   * @private
   */
  _upgradeDb(db) {
    // TODO(philipwalton): EdgeHTML doesn't support arrays as a keyPath, so we
    // have to use the `id` keyPath here and create our own values (a
    // concatenation of `url + cacheName`) instead of simply using
    // `keyPath: ['url', 'cacheName']`, which is supported in other browsers.
    const objStore = db.createObjectStore(CACHE_OBJECT_STORE, {
      keyPath: 'id'
    });
    // TODO(philipwalton): once we don't have to support EdgeHTML, we can
    // create a single index with the keyPath `['cacheName', 'timestamp']`
    // instead of doing both these indexes.
    objStore.createIndex('cacheName', 'cacheName', {
      unique: false
    });
    objStore.createIndex('timestamp', 'timestamp', {
      unique: false
    });
  }
  /**
   * Performs an upgrade of indexedDB and deletes deprecated DBs.
   *
   * @param {IDBPDatabase<CacheDbSchema>} db
   *
   * @private
   */
  _upgradeDbAndDeleteOldDbs(db) {
    this._upgradeDb(db);
    if (this._cacheName) {
      void (0,idb__WEBPACK_IMPORTED_MODULE_0__.deleteDB)(this._cacheName);
    }
  }
  /**
   * @param {string} url
   * @param {number} timestamp
   *
   * @private
   */
  async setTimestamp(url, timestamp) {
    url = normalizeURL(url);
    const entry = {
      url,
      timestamp,
      cacheName: this._cacheName,
      // Creating an ID from the URL and cache name won't be necessary once
      // Edge switches to Chromium and all browsers we support work with
      // array keyPaths.
      id: this._getId(url)
    };
    const db = await this.getDb();
    const tx = db.transaction(CACHE_OBJECT_STORE, 'readwrite', {
      durability: 'relaxed'
    });
    await tx.store.put(entry);
    await tx.done;
  }
  /**
   * Returns the timestamp stored for a given URL.
   *
   * @param {string} url
   * @return {number | undefined}
   *
   * @private
   */
  async getTimestamp(url) {
    const db = await this.getDb();
    const entry = await db.get(CACHE_OBJECT_STORE, this._getId(url));
    return entry === null || entry === void 0 ? void 0 : entry.timestamp;
  }
  /**
   * Iterates through all the entries in the object store (from newest to
   * oldest) and removes entries once either `maxCount` is reached or the
   * entry's timestamp is less than `minTimestamp`.
   *
   * @param {number} minTimestamp
   * @param {number} maxCount
   * @return {Array<string>}
   *
   * @private
   */
  async expireEntries(minTimestamp, maxCount) {
    const db = await this.getDb();
    let cursor = await db.transaction(CACHE_OBJECT_STORE).store.index('timestamp').openCursor(null, 'prev');
    const entriesToDelete = [];
    let entriesNotDeletedCount = 0;
    while (cursor) {
      const result = cursor.value;
      // TODO(philipwalton): once we can use a multi-key index, we
      // won't have to check `cacheName` here.
      if (result.cacheName === this._cacheName) {
        // Delete an entry if it's older than the max age or
        // if we already have the max number allowed.
        if (minTimestamp && result.timestamp < minTimestamp || maxCount && entriesNotDeletedCount >= maxCount) {
          // TODO(philipwalton): we should be able to delete the
          // entry right here, but doing so causes an iteration
          // bug in Safari stable (fixed in TP). Instead we can
          // store the keys of the entries to delete, and then
          // delete the separate transactions.
          // https://github.com/GoogleChrome/workbox/issues/1978
          // cursor.delete();
          // We only need to return the URL, not the whole entry.
          entriesToDelete.push(cursor.value);
        } else {
          entriesNotDeletedCount++;
        }
      }
      cursor = await cursor.continue();
    }
    // TODO(philipwalton): once the Safari bug in the following issue is fixed,
    // we should be able to remove this loop and do the entry deletion in the
    // cursor loop above:
    // https://github.com/GoogleChrome/workbox/issues/1978
    const urlsDeleted = [];
    for (const entry of entriesToDelete) {
      await db.delete(CACHE_OBJECT_STORE, entry.id);
      urlsDeleted.push(entry.url);
    }
    return urlsDeleted;
  }
  /**
   * Takes a URL and returns an ID that will be unique in the object store.
   *
   * @param {string} url
   * @return {string}
   *
   * @private
   */
  _getId(url) {
    // Creating an ID from the URL and cache name won't be necessary once
    // Edge switches to Chromium and all browsers we support work with
    // array keyPaths.
    return this._cacheName + '|' + normalizeURL(url);
  }
  /**
   * Returns an open connection to the database.
   *
   * @private
   */
  async getDb() {
    if (!this._db) {
      this._db = await (0,idb__WEBPACK_IMPORTED_MODULE_0__.openDB)(DB_NAME, 1, {
        upgrade: this._upgradeDbAndDeleteOldDbs.bind(this)
      });
    }
    return this._db;
  }
}


/***/ }),

/***/ "./node_modules/workbox-precaching/PrecacheController.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PrecacheController: () => (/* binding */ PrecacheController)
/* harmony export */ });
/* harmony import */ var workbox_core_private_assert_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/assert.js");
/* harmony import */ var workbox_core_private_cacheNames_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_private/cacheNames.js");
/* harmony import */ var workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-core/_private/logger.js");
/* harmony import */ var workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-core/_private/WorkboxError.js");
/* harmony import */ var workbox_core_private_waitUntil_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./node_modules/workbox-core/_private/waitUntil.js");
/* harmony import */ var _utils_createCacheKey_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./node_modules/workbox-precaching/utils/createCacheKey.js");
/* harmony import */ var _utils_PrecacheInstallReportPlugin_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("./node_modules/workbox-precaching/utils/PrecacheInstallReportPlugin.js");
/* harmony import */ var _utils_PrecacheCacheKeyPlugin_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__("./node_modules/workbox-precaching/utils/PrecacheCacheKeyPlugin.js");
/* harmony import */ var _utils_printCleanupDetails_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__("./node_modules/workbox-precaching/utils/printCleanupDetails.js");
/* harmony import */ var _utils_printInstallDetails_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__("./node_modules/workbox-precaching/utils/printInstallDetails.js");
/* harmony import */ var _PrecacheStrategy_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__("./node_modules/workbox-precaching/PrecacheStrategy.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__("./node_modules/workbox-precaching/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_11__);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/












/**
 * Performs efficient precaching of assets.
 *
 * @memberof workbox-precaching
 */
class PrecacheController {
  /**
   * Create a new PrecacheController.
   *
   * @param {Object} [options]
   * @param {string} [options.cacheName] The cache to use for precaching.
   * @param {string} [options.plugins] Plugins to use when precaching as well
   * as responding to fetch events for precached assets.
   * @param {boolean} [options.fallbackToNetwork=true] Whether to attempt to
   * get the response from the network if there's a precache miss.
   */
  constructor() {
    let {
      cacheName,
      plugins = [],
      fallbackToNetwork = true
    } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this._urlsToCacheKeys = new Map();
    this._urlsToCacheModes = new Map();
    this._cacheKeysToIntegrities = new Map();
    this._strategy = new _PrecacheStrategy_js__WEBPACK_IMPORTED_MODULE_10__.PrecacheStrategy({
      cacheName: workbox_core_private_cacheNames_js__WEBPACK_IMPORTED_MODULE_1__.cacheNames.getPrecacheName(cacheName),
      plugins: [...plugins, new _utils_PrecacheCacheKeyPlugin_js__WEBPACK_IMPORTED_MODULE_7__.PrecacheCacheKeyPlugin({
        precacheController: this
      })],
      fallbackToNetwork
    });
    // Bind the install and activate methods to the instance.
    this.install = this.install.bind(this);
    this.activate = this.activate.bind(this);
  }
  /**
   * @type {workbox-precaching.PrecacheStrategy} The strategy created by this controller and
   * used to cache assets and respond to fetch events.
   */
  get strategy() {
    return this._strategy;
  }
  /**
   * Adds items to the precache list, removing any duplicates and
   * stores the files in the
   * {@link workbox-core.cacheNames|"precache cache"} when the service
   * worker installs.
   *
   * This method can be called multiple times.
   *
   * @param {Array<Object|string>} [entries=[]] Array of entries to precache.
   */
  precache(entries) {
    this.addToCacheList(entries);
    if (!this._installAndActiveListenersAdded) {
      self.addEventListener('install', this.install);
      self.addEventListener('activate', this.activate);
      this._installAndActiveListenersAdded = true;
    }
  }
  /**
   * This method will add items to the precache list, removing duplicates
   * and ensuring the information is valid.
   *
   * @param {Array<workbox-precaching.PrecacheController.PrecacheEntry|string>} entries
   *     Array of entries to precache.
   */
  addToCacheList(entries) {
    if (false) {}
    const urlsToWarnAbout = [];
    for (const entry of entries) {
      // See https://github.com/GoogleChrome/workbox/issues/2259
      if (typeof entry === 'string') {
        urlsToWarnAbout.push(entry);
      } else if (entry && entry.revision === undefined) {
        urlsToWarnAbout.push(entry.url);
      }
      const {
        cacheKey,
        url
      } = (0,_utils_createCacheKey_js__WEBPACK_IMPORTED_MODULE_5__.createCacheKey)(entry);
      const cacheMode = typeof entry !== 'string' && entry.revision ? 'reload' : 'default';
      if (this._urlsToCacheKeys.has(url) && this._urlsToCacheKeys.get(url) !== cacheKey) {
        throw new workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_3__.WorkboxError('add-to-cache-list-conflicting-entries', {
          firstEntry: this._urlsToCacheKeys.get(url),
          secondEntry: cacheKey
        });
      }
      if (typeof entry !== 'string' && entry.integrity) {
        if (this._cacheKeysToIntegrities.has(cacheKey) && this._cacheKeysToIntegrities.get(cacheKey) !== entry.integrity) {
          throw new workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_3__.WorkboxError('add-to-cache-list-conflicting-integrities', {
            url
          });
        }
        this._cacheKeysToIntegrities.set(cacheKey, entry.integrity);
      }
      this._urlsToCacheKeys.set(url, cacheKey);
      this._urlsToCacheModes.set(url, cacheMode);
      if (urlsToWarnAbout.length > 0) {
        const warningMessage = "Workbox is precaching URLs without revision " + "info: ".concat(urlsToWarnAbout.join(', '), "\nThis is generally NOT safe. ") + "Learn more at https://bit.ly/wb-precache";
        if (true) {
          // Use console directly to display this warning without bloating
          // bundle sizes by pulling in all of the logger codebase in prod.
          console.warn(warningMessage);
        } else {}
      }
    }
  }
  /**
   * Precaches new and updated assets. Call this method from the service worker
   * install event.
   *
   * Note: this method calls `event.waitUntil()` for you, so you do not need
   * to call it yourself in your event handlers.
   *
   * @param {ExtendableEvent} event
   * @return {Promise<workbox-precaching.InstallResult>}
   */
  install(event) {
    // waitUntil returns Promise<any>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (0,workbox_core_private_waitUntil_js__WEBPACK_IMPORTED_MODULE_4__.waitUntil)(event, async () => {
      const installReportPlugin = new _utils_PrecacheInstallReportPlugin_js__WEBPACK_IMPORTED_MODULE_6__.PrecacheInstallReportPlugin();
      this.strategy.plugins.push(installReportPlugin);
      // Cache entries one at a time.
      // See https://github.com/GoogleChrome/workbox/issues/2528
      for (const [url, cacheKey] of this._urlsToCacheKeys) {
        const integrity = this._cacheKeysToIntegrities.get(cacheKey);
        const cacheMode = this._urlsToCacheModes.get(url);
        const request = new Request(url, {
          integrity,
          cache: cacheMode,
          credentials: 'same-origin'
        });
        await Promise.all(this.strategy.handleAll({
          params: {
            cacheKey
          },
          request,
          event
        }));
      }
      const {
        updatedURLs,
        notUpdatedURLs
      } = installReportPlugin;
      if (false) {}
      return {
        updatedURLs,
        notUpdatedURLs
      };
    });
  }
  /**
   * Deletes assets that are no longer present in the current precache manifest.
   * Call this method from the service worker activate event.
   *
   * Note: this method calls `event.waitUntil()` for you, so you do not need
   * to call it yourself in your event handlers.
   *
   * @param {ExtendableEvent} event
   * @return {Promise<workbox-precaching.CleanupResult>}
   */
  activate(event) {
    // waitUntil returns Promise<any>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (0,workbox_core_private_waitUntil_js__WEBPACK_IMPORTED_MODULE_4__.waitUntil)(event, async () => {
      const cache = await self.caches.open(this.strategy.cacheName);
      const currentlyCachedRequests = await cache.keys();
      const expectedCacheKeys = new Set(this._urlsToCacheKeys.values());
      const deletedURLs = [];
      for (const request of currentlyCachedRequests) {
        if (!expectedCacheKeys.has(request.url)) {
          await cache.delete(request);
          deletedURLs.push(request.url);
        }
      }
      if (false) {}
      return {
        deletedURLs
      };
    });
  }
  /**
   * Returns a mapping of a precached URL to the corresponding cache key, taking
   * into account the revision information for the URL.
   *
   * @return {Map<string, string>} A URL to cache key mapping.
   */
  getURLsToCacheKeys() {
    return this._urlsToCacheKeys;
  }
  /**
   * Returns a list of all the URLs that have been precached by the current
   * service worker.
   *
   * @return {Array<string>} The precached URLs.
   */
  getCachedURLs() {
    return [...this._urlsToCacheKeys.keys()];
  }
  /**
   * Returns the cache key used for storing a given URL. If that URL is
   * unversioned, like `/index.html', then the cache key will be the original
   * URL with a search parameter appended to it.
   *
   * @param {string} url A URL whose cache key you want to look up.
   * @return {string} The versioned URL that corresponds to a cache key
   * for the original URL, or undefined if that URL isn't precached.
   */
  getCacheKeyForURL(url) {
    const urlObject = new URL(url, location.href);
    return this._urlsToCacheKeys.get(urlObject.href);
  }
  /**
   * @param {string} url A cache key whose SRI you want to look up.
   * @return {string} The subresource integrity associated with the cache key,
   * or undefined if it's not set.
   */
  getIntegrityForCacheKey(cacheKey) {
    return this._cacheKeysToIntegrities.get(cacheKey);
  }
  /**
   * This acts as a drop-in replacement for
   * [`cache.match()`](https://developer.mozilla.org/en-US/docs/Web/API/Cache/match)
   * with the following differences:
   *
   * - It knows what the name of the precache is, and only checks in that cache.
   * - It allows you to pass in an "original" URL without versioning parameters,
   * and it will automatically look up the correct cache key for the currently
   * active revision of that URL.
   *
   * E.g., `matchPrecache('index.html')` will find the correct precached
   * response for the currently active service worker, even if the actual cache
   * key is `'/index.html?__WB_REVISION__=1234abcd'`.
   *
   * @param {string|Request} request The key (without revisioning parameters)
   * to look up in the precache.
   * @return {Promise<Response|undefined>}
   */
  async matchPrecache(request) {
    const url = request instanceof Request ? request.url : request;
    const cacheKey = this.getCacheKeyForURL(url);
    if (cacheKey) {
      const cache = await self.caches.open(this.strategy.cacheName);
      return cache.match(cacheKey);
    }
    return undefined;
  }
  /**
   * Returns a function that looks up `url` in the precache (taking into
   * account revision information), and returns the corresponding `Response`.
   *
   * @param {string} url The precached URL which will be used to lookup the
   * `Response`.
   * @return {workbox-routing~handlerCallback}
   */
  createHandlerBoundToURL(url) {
    const cacheKey = this.getCacheKeyForURL(url);
    if (!cacheKey) {
      throw new workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_3__.WorkboxError('non-precached-url', {
        url
      });
    }
    return options => {
      options.request = new Request(url);
      options.params = Object.assign({
        cacheKey
      }, options.params);
      return this.strategy.handle(options);
    };
  }
}


/***/ }),

/***/ "./node_modules/workbox-precaching/PrecacheFallbackPlugin.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PrecacheFallbackPlugin: () => (/* binding */ PrecacheFallbackPlugin)
/* harmony export */ });
/* harmony import */ var _utils_getOrCreatePrecacheController_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-precaching/utils/getOrCreatePrecacheController.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-precaching/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_1__);
/*
  Copyright 2020 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * `PrecacheFallbackPlugin` allows you to specify an "offline fallback"
 * response to be used when a given strategy is unable to generate a response.
 *
 * It does this by intercepting the `handlerDidError` plugin callback
 * and returning a precached response, taking the expected revision parameter
 * into account automatically.
 *
 * Unless you explicitly pass in a `PrecacheController` instance to the
 * constructor, the default instance will be used. Generally speaking, most
 * developers will end up using the default.
 *
 * @memberof workbox-precaching
 */
class PrecacheFallbackPlugin {
  /**
   * Constructs a new PrecacheFallbackPlugin with the associated fallbackURL.
   *
   * @param {Object} config
   * @param {string} config.fallbackURL A precached URL to use as the fallback
   *     if the associated strategy can't generate a response.
   * @param {PrecacheController} [config.precacheController] An optional
   *     PrecacheController instance. If not provided, the default
   *     PrecacheController will be used.
   */
  constructor(_ref) {
    let {
      fallbackURL,
      precacheController
    } = _ref;
    /**
     * @return {Promise<Response>} The precache response for the fallback URL.
     *
     * @private
     */
    this.handlerDidError = () => this._precacheController.matchPrecache(this._fallbackURL);
    this._fallbackURL = fallbackURL;
    this._precacheController = precacheController || (0,_utils_getOrCreatePrecacheController_js__WEBPACK_IMPORTED_MODULE_0__.getOrCreatePrecacheController)();
  }
}


/***/ }),

/***/ "./node_modules/workbox-precaching/PrecacheRoute.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PrecacheRoute: () => (/* binding */ PrecacheRoute)
/* harmony export */ });
/* harmony import */ var workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/logger.js");
/* harmony import */ var workbox_core_private_getFriendlyURL_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_private/getFriendlyURL.js");
/* harmony import */ var workbox_routing_Route_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-routing/Route.js");
/* harmony import */ var _utils_generateURLVariations_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-precaching/utils/generateURLVariations.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./node_modules/workbox-precaching/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_4__);
/*
  Copyright 2020 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/





/**
 * A subclass of {@link workbox-routing.Route} that takes a
 * {@link workbox-precaching.PrecacheController}
 * instance and uses it to match incoming requests and handle fetching
 * responses from the precache.
 *
 * @memberof workbox-precaching
 * @extends workbox-routing.Route
 */
class PrecacheRoute extends workbox_routing_Route_js__WEBPACK_IMPORTED_MODULE_2__.Route {
  /**
   * @param {PrecacheController} precacheController A `PrecacheController`
   * instance used to both match requests and respond to fetch events.
   * @param {Object} [options] Options to control how requests are matched
   * against the list of precached URLs.
   * @param {string} [options.directoryIndex=index.html] The `directoryIndex` will
   * check cache entries for a URLs ending with '/' to see if there is a hit when
   * appending the `directoryIndex` value.
   * @param {Array<RegExp>} [options.ignoreURLParametersMatching=[/^utm_/, /^fbclid$/]] An
   * array of regex's to remove search params when looking for a cache match.
   * @param {boolean} [options.cleanURLs=true] The `cleanURLs` option will
   * check the cache for the URL with a `.html` added to the end of the end.
   * @param {workbox-precaching~urlManipulation} [options.urlManipulation]
   * This is a function that should take a URL and return an array of
   * alternative URLs that should be checked for precache matches.
   */
  constructor(precacheController, options) {
    const match = _ref => {
      let {
        request
      } = _ref;
      const urlsToCacheKeys = precacheController.getURLsToCacheKeys();
      for (const possibleURL of (0,_utils_generateURLVariations_js__WEBPACK_IMPORTED_MODULE_3__.generateURLVariations)(request.url, options)) {
        const cacheKey = urlsToCacheKeys.get(possibleURL);
        if (cacheKey) {
          const integrity = precacheController.getIntegrityForCacheKey(cacheKey);
          return {
            cacheKey,
            integrity
          };
        }
      }
      if (false) {}
      return;
    };
    super(match, precacheController.strategy);
  }
}


/***/ }),

/***/ "./node_modules/workbox-precaching/PrecacheStrategy.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PrecacheStrategy: () => (/* binding */ PrecacheStrategy)
/* harmony export */ });
/* harmony import */ var workbox_core_copyResponse_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/copyResponse.js");
/* harmony import */ var workbox_core_private_cacheNames_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_private/cacheNames.js");
/* harmony import */ var workbox_core_private_getFriendlyURL_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-core/_private/getFriendlyURL.js");
/* harmony import */ var workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-core/_private/logger.js");
/* harmony import */ var workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./node_modules/workbox-core/_private/WorkboxError.js");
/* harmony import */ var workbox_strategies_Strategy_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./node_modules/workbox-strategies/Strategy.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("./node_modules/workbox-precaching/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_6__);
/*
  Copyright 2020 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/







/**
 * A {@link workbox-strategies.Strategy} implementation
 * specifically designed to work with
 * {@link workbox-precaching.PrecacheController}
 * to both cache and fetch precached assets.
 *
 * Note: an instance of this class is created automatically when creating a
 * `PrecacheController`; it's generally not necessary to create this yourself.
 *
 * @extends workbox-strategies.Strategy
 * @memberof workbox-precaching
 */
class PrecacheStrategy extends workbox_strategies_Strategy_js__WEBPACK_IMPORTED_MODULE_5__.Strategy {
  /**
   *
   * @param {Object} [options]
   * @param {string} [options.cacheName] Cache name to store and retrieve
   * requests. Defaults to the cache names provided by
   * {@link workbox-core.cacheNames}.
   * @param {Array<Object>} [options.plugins] {@link https://developers.google.com/web/tools/workbox/guides/using-plugins|Plugins}
   * to use in conjunction with this caching strategy.
   * @param {Object} [options.fetchOptions] Values passed along to the
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters|init}
   * of all fetch() requests made by this strategy.
   * @param {Object} [options.matchOptions] The
   * {@link https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions|CacheQueryOptions}
   * for any `cache.match()` or `cache.put()` calls made by this strategy.
   * @param {boolean} [options.fallbackToNetwork=true] Whether to attempt to
   * get the response from the network if there's a precache miss.
   */
  constructor() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    options.cacheName = workbox_core_private_cacheNames_js__WEBPACK_IMPORTED_MODULE_1__.cacheNames.getPrecacheName(options.cacheName);
    super(options);
    this._fallbackToNetwork = options.fallbackToNetwork === false ? false : true;
    // Redirected responses cannot be used to satisfy a navigation request, so
    // any redirected response must be "copied" rather than cloned, so the new
    // response doesn't contain the `redirected` flag. See:
    // https://bugs.chromium.org/p/chromium/issues/detail?id=669363&desc=2#c1
    this.plugins.push(PrecacheStrategy.copyRedirectedCacheableResponsesPlugin);
  }
  /**
   * @private
   * @param {Request|string} request A request to run this strategy for.
   * @param {workbox-strategies.StrategyHandler} handler The event that
   *     triggered the request.
   * @return {Promise<Response>}
   */
  async _handle(request, handler) {
    const response = await handler.cacheMatch(request);
    if (response) {
      return response;
    }
    // If this is an `install` event for an entry that isn't already cached,
    // then populate the cache.
    if (handler.event && handler.event.type === 'install') {
      return await this._handleInstall(request, handler);
    }
    // Getting here means something went wrong. An entry that should have been
    // precached wasn't found in the cache.
    return await this._handleFetch(request, handler);
  }
  async _handleFetch(request, handler) {
    let response;
    const params = handler.params || {};
    // Fall back to the network if we're configured to do so.
    if (this._fallbackToNetwork) {
      if (false) {}
      const integrityInManifest = params.integrity;
      const integrityInRequest = request.integrity;
      const noIntegrityConflict = !integrityInRequest || integrityInRequest === integrityInManifest;
      // Do not add integrity if the original request is no-cors
      // See https://github.com/GoogleChrome/workbox/issues/3096
      response = await handler.fetch(new Request(request, {
        integrity: request.mode !== 'no-cors' ? integrityInRequest || integrityInManifest : undefined
      }));
      // It's only "safe" to repair the cache if we're using SRI to guarantee
      // that the response matches the precache manifest's expectations,
      // and there's either a) no integrity property in the incoming request
      // or b) there is an integrity, and it matches the precache manifest.
      // See https://github.com/GoogleChrome/workbox/issues/2858
      // Also if the original request users no-cors we don't use integrity.
      // See https://github.com/GoogleChrome/workbox/issues/3096
      if (integrityInManifest && noIntegrityConflict && request.mode !== 'no-cors') {
        this._useDefaultCacheabilityPluginIfNeeded();
        const wasCached = await handler.cachePut(request, response.clone());
        if (false) {}
      }
    } else {
      // This shouldn't normally happen, but there are edge cases:
      // https://github.com/GoogleChrome/workbox/issues/1441
      throw new workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_4__.WorkboxError('missing-precache-entry', {
        cacheName: this.cacheName,
        url: request.url
      });
    }
    if (false) {}
    return response;
  }
  async _handleInstall(request, handler) {
    this._useDefaultCacheabilityPluginIfNeeded();
    const response = await handler.fetch(request);
    // Make sure we defer cachePut() until after we know the response
    // should be cached; see https://github.com/GoogleChrome/workbox/issues/2737
    const wasCached = await handler.cachePut(request, response.clone());
    if (!wasCached) {
      // Throwing here will lead to the `install` handler failing, which
      // we want to do if *any* of the responses aren't safe to cache.
      throw new workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_4__.WorkboxError('bad-precaching-response', {
        url: request.url,
        status: response.status
      });
    }
    return response;
  }
  /**
   * This method is complex, as there a number of things to account for:
   *
   * The `plugins` array can be set at construction, and/or it might be added to
   * to at any time before the strategy is used.
   *
   * At the time the strategy is used (i.e. during an `install` event), there
   * needs to be at least one plugin that implements `cacheWillUpdate` in the
   * array, other than `copyRedirectedCacheableResponsesPlugin`.
   *
   * - If this method is called and there are no suitable `cacheWillUpdate`
   * plugins, we need to add `defaultPrecacheCacheabilityPlugin`.
   *
   * - If this method is called and there is exactly one `cacheWillUpdate`, then
   * we don't have to do anything (this might be a previously added
   * `defaultPrecacheCacheabilityPlugin`, or it might be a custom plugin).
   *
   * - If this method is called and there is more than one `cacheWillUpdate`,
   * then we need to check if one is `defaultPrecacheCacheabilityPlugin`. If so,
   * we need to remove it. (This situation is unlikely, but it could happen if
   * the strategy is used multiple times, the first without a `cacheWillUpdate`,
   * and then later on after manually adding a custom `cacheWillUpdate`.)
   *
   * See https://github.com/GoogleChrome/workbox/issues/2737 for more context.
   *
   * @private
   */
  _useDefaultCacheabilityPluginIfNeeded() {
    let defaultPluginIndex = null;
    let cacheWillUpdatePluginCount = 0;
    for (const [index, plugin] of this.plugins.entries()) {
      // Ignore the copy redirected plugin when determining what to do.
      if (plugin === PrecacheStrategy.copyRedirectedCacheableResponsesPlugin) {
        continue;
      }
      // Save the default plugin's index, in case it needs to be removed.
      if (plugin === PrecacheStrategy.defaultPrecacheCacheabilityPlugin) {
        defaultPluginIndex = index;
      }
      if (plugin.cacheWillUpdate) {
        cacheWillUpdatePluginCount++;
      }
    }
    if (cacheWillUpdatePluginCount === 0) {
      this.plugins.push(PrecacheStrategy.defaultPrecacheCacheabilityPlugin);
    } else if (cacheWillUpdatePluginCount > 1 && defaultPluginIndex !== null) {
      // Only remove the default plugin; multiple custom plugins are allowed.
      this.plugins.splice(defaultPluginIndex, 1);
    }
    // Nothing needs to be done if cacheWillUpdatePluginCount is 1
  }
}
PrecacheStrategy.defaultPrecacheCacheabilityPlugin = {
  async cacheWillUpdate(_ref) {
    let {
      response
    } = _ref;
    if (!response || response.status >= 400) {
      return null;
    }
    return response;
  }
};
PrecacheStrategy.copyRedirectedCacheableResponsesPlugin = {
  async cacheWillUpdate(_ref2) {
    let {
      response
    } = _ref2;
    return response.redirected ? await (0,workbox_core_copyResponse_js__WEBPACK_IMPORTED_MODULE_0__.copyResponse)(response) : response;
  }
};


/***/ }),

/***/ "./node_modules/workbox-precaching/_types.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-precaching/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_0__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

// * * * IMPORTANT! * * *
// ------------------------------------------------------------------------- //
// jdsoc type definitions cannot be declared above TypeScript definitions or
// they'll be stripped from the built `.js` files, and they'll only be in the
// `d.ts` files, which aren't read by the jsdoc generator. As a result we
// have to put declare them below.
/**
 * @typedef {Object} InstallResult
 * @property {Array<string>} updatedURLs List of URLs that were updated during
 * installation.
 * @property {Array<string>} notUpdatedURLs List of URLs that were already up to
 * date.
 *
 * @memberof workbox-precaching
 */
/**
 * @typedef {Object} CleanupResult
 * @property {Array<string>} deletedCacheRequests List of URLs that were deleted
 * while cleaning up the cache.
 *
 * @memberof workbox-precaching
 */
/**
 * @typedef {Object} PrecacheEntry
 * @property {string} url URL to precache.
 * @property {string} [revision] Revision information for the URL.
 * @property {string} [integrity] Integrity metadata that will be used when
 * making the network request for the URL.
 *
 * @memberof workbox-precaching
 */
/**
 * The "urlManipulation" callback can be used to determine if there are any
 * additional permutations of a URL that should be used to check against
 * the available precached files.
 *
 * For example, Workbox supports checking for '/index.html' when the URL
 * '/' is provided. This callback allows additional, custom checks.
 *
 * @callback ~urlManipulation
 * @param {Object} context
 * @param {URL} context.url The request's URL.
 * @return {Array<URL>} To add additional urls to test, return an Array of
 * URLs. Please note that these **should not be strings**, but URL objects.
 *
 * @memberof workbox-precaching
 */

/***/ }),

/***/ "./node_modules/workbox-precaching/_version.js":
/***/ (() => {



// @ts-ignore
try {
  self['workbox:precaching:6.6.0'] && _();
} catch (e) {}

/***/ }),

/***/ "./node_modules/workbox-precaching/addPlugins.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addPlugins: () => (/* binding */ addPlugins)
/* harmony export */ });
/* harmony import */ var _utils_getOrCreatePrecacheController_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-precaching/utils/getOrCreatePrecacheController.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-precaching/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_1__);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * Adds plugins to the precaching strategy.
 *
 * @param {Array<Object>} plugins
 *
 * @memberof workbox-precaching
 */
function addPlugins(plugins) {
  const precacheController = (0,_utils_getOrCreatePrecacheController_js__WEBPACK_IMPORTED_MODULE_0__.getOrCreatePrecacheController)();
  precacheController.strategy.plugins.push(...plugins);
}


/***/ }),

/***/ "./node_modules/workbox-precaching/addRoute.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addRoute: () => (/* binding */ addRoute)
/* harmony export */ });
/* harmony import */ var workbox_routing_registerRoute_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-routing/registerRoute.js");
/* harmony import */ var _utils_getOrCreatePrecacheController_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-precaching/utils/getOrCreatePrecacheController.js");
/* harmony import */ var _PrecacheRoute_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-precaching/PrecacheRoute.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-precaching/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_3__);
/*
  Copyright 2019 Google LLC
  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/




/**
 * Add a `fetch` listener to the service worker that will
 * respond to
 * [network requests]{@link https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers#Custom_responses_to_requests}
 * with precached assets.
 *
 * Requests for assets that aren't precached, the `FetchEvent` will not be
 * responded to, allowing the event to fall through to other `fetch` event
 * listeners.
 *
 * @param {Object} [options] See the {@link workbox-precaching.PrecacheRoute}
 * options.
 *
 * @memberof workbox-precaching
 */
function addRoute(options) {
  const precacheController = (0,_utils_getOrCreatePrecacheController_js__WEBPACK_IMPORTED_MODULE_1__.getOrCreatePrecacheController)();
  const precacheRoute = new _PrecacheRoute_js__WEBPACK_IMPORTED_MODULE_2__.PrecacheRoute(precacheController, options);
  (0,workbox_routing_registerRoute_js__WEBPACK_IMPORTED_MODULE_0__.registerRoute)(precacheRoute);
}


/***/ }),

/***/ "./node_modules/workbox-precaching/cleanupOutdatedCaches.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cleanupOutdatedCaches: () => (/* binding */ cleanupOutdatedCaches)
/* harmony export */ });
/* harmony import */ var workbox_core_private_cacheNames_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/cacheNames.js");
/* harmony import */ var workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_private/logger.js");
/* harmony import */ var _utils_deleteOutdatedCaches_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-precaching/utils/deleteOutdatedCaches.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-precaching/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_3__);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/




/**
 * Adds an `activate` event listener which will clean up incompatible
 * precaches that were created by older versions of Workbox.
 *
 * @memberof workbox-precaching
 */
function cleanupOutdatedCaches() {
  // See https://github.com/Microsoft/TypeScript/issues/28357#issuecomment-436484705
  self.addEventListener('activate', event => {
    const cacheName = workbox_core_private_cacheNames_js__WEBPACK_IMPORTED_MODULE_0__.cacheNames.getPrecacheName();
    event.waitUntil((0,_utils_deleteOutdatedCaches_js__WEBPACK_IMPORTED_MODULE_2__.deleteOutdatedCaches)(cacheName).then(cachesDeleted => {
      if (false) {}
    }));
  });
}


/***/ }),

/***/ "./node_modules/workbox-precaching/createHandlerBoundToURL.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createHandlerBoundToURL: () => (/* binding */ createHandlerBoundToURL)
/* harmony export */ });
/* harmony import */ var _utils_getOrCreatePrecacheController_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-precaching/utils/getOrCreatePrecacheController.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-precaching/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_1__);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * Helper function that calls
 * {@link PrecacheController#createHandlerBoundToURL} on the default
 * {@link PrecacheController} instance.
 *
 * If you are creating your own {@link PrecacheController}, then call the
 * {@link PrecacheController#createHandlerBoundToURL} on that instance,
 * instead of using this function.
 *
 * @param {string} url The precached URL which will be used to lookup the
 * `Response`.
 * @param {boolean} [fallbackToNetwork=true] Whether to attempt to get the
 * response from the network if there's a precache miss.
 * @return {workbox-routing~handlerCallback}
 *
 * @memberof workbox-precaching
 */
function createHandlerBoundToURL(url) {
  const precacheController = (0,_utils_getOrCreatePrecacheController_js__WEBPACK_IMPORTED_MODULE_0__.getOrCreatePrecacheController)();
  return precacheController.createHandlerBoundToURL(url);
}


/***/ }),

/***/ "./node_modules/workbox-precaching/getCacheKeyForURL.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getCacheKeyForURL: () => (/* binding */ getCacheKeyForURL)
/* harmony export */ });
/* harmony import */ var _utils_getOrCreatePrecacheController_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-precaching/utils/getOrCreatePrecacheController.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-precaching/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_1__);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * Takes in a URL, and returns the corresponding URL that could be used to
 * lookup the entry in the precache.
 *
 * If a relative URL is provided, the location of the service worker file will
 * be used as the base.
 *
 * For precached entries without revision information, the cache key will be the
 * same as the original URL.
 *
 * For precached entries with revision information, the cache key will be the
 * original URL with the addition of a query parameter used for keeping track of
 * the revision info.
 *
 * @param {string} url The URL whose cache key to look up.
 * @return {string} The cache key that corresponds to that URL.
 *
 * @memberof workbox-precaching
 */
function getCacheKeyForURL(url) {
  const precacheController = (0,_utils_getOrCreatePrecacheController_js__WEBPACK_IMPORTED_MODULE_0__.getOrCreatePrecacheController)();
  return precacheController.getCacheKeyForURL(url);
}


/***/ }),

/***/ "./node_modules/workbox-precaching/index.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PrecacheController: () => (/* reexport safe */ _PrecacheController_js__WEBPACK_IMPORTED_MODULE_8__.PrecacheController),
/* harmony export */   PrecacheFallbackPlugin: () => (/* reexport safe */ _PrecacheFallbackPlugin_js__WEBPACK_IMPORTED_MODULE_11__.PrecacheFallbackPlugin),
/* harmony export */   PrecacheRoute: () => (/* reexport safe */ _PrecacheRoute_js__WEBPACK_IMPORTED_MODULE_9__.PrecacheRoute),
/* harmony export */   PrecacheStrategy: () => (/* reexport safe */ _PrecacheStrategy_js__WEBPACK_IMPORTED_MODULE_10__.PrecacheStrategy),
/* harmony export */   addPlugins: () => (/* reexport safe */ _addPlugins_js__WEBPACK_IMPORTED_MODULE_0__.addPlugins),
/* harmony export */   addRoute: () => (/* reexport safe */ _addRoute_js__WEBPACK_IMPORTED_MODULE_1__.addRoute),
/* harmony export */   cleanupOutdatedCaches: () => (/* reexport safe */ _cleanupOutdatedCaches_js__WEBPACK_IMPORTED_MODULE_2__.cleanupOutdatedCaches),
/* harmony export */   createHandlerBoundToURL: () => (/* reexport safe */ _createHandlerBoundToURL_js__WEBPACK_IMPORTED_MODULE_3__.createHandlerBoundToURL),
/* harmony export */   getCacheKeyForURL: () => (/* reexport safe */ _getCacheKeyForURL_js__WEBPACK_IMPORTED_MODULE_4__.getCacheKeyForURL),
/* harmony export */   matchPrecache: () => (/* reexport safe */ _matchPrecache_js__WEBPACK_IMPORTED_MODULE_5__.matchPrecache),
/* harmony export */   precache: () => (/* reexport safe */ _precache_js__WEBPACK_IMPORTED_MODULE_6__.precache),
/* harmony export */   precacheAndRoute: () => (/* reexport safe */ _precacheAndRoute_js__WEBPACK_IMPORTED_MODULE_7__.precacheAndRoute)
/* harmony export */ });
/* harmony import */ var _addPlugins_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-precaching/addPlugins.js");
/* harmony import */ var _addRoute_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-precaching/addRoute.js");
/* harmony import */ var _cleanupOutdatedCaches_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-precaching/cleanupOutdatedCaches.js");
/* harmony import */ var _createHandlerBoundToURL_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-precaching/createHandlerBoundToURL.js");
/* harmony import */ var _getCacheKeyForURL_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./node_modules/workbox-precaching/getCacheKeyForURL.js");
/* harmony import */ var _matchPrecache_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./node_modules/workbox-precaching/matchPrecache.js");
/* harmony import */ var _precache_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("./node_modules/workbox-precaching/precache.js");
/* harmony import */ var _precacheAndRoute_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__("./node_modules/workbox-precaching/precacheAndRoute.js");
/* harmony import */ var _PrecacheController_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__("./node_modules/workbox-precaching/PrecacheController.js");
/* harmony import */ var _PrecacheRoute_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__("./node_modules/workbox-precaching/PrecacheRoute.js");
/* harmony import */ var _PrecacheStrategy_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__("./node_modules/workbox-precaching/PrecacheStrategy.js");
/* harmony import */ var _PrecacheFallbackPlugin_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__("./node_modules/workbox-precaching/PrecacheFallbackPlugin.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__("./node_modules/workbox-precaching/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var _types_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__("./node_modules/workbox-precaching/_types.js");
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/













/**
 * Most consumers of this module will want to use the
 * {@link workbox-precaching.precacheAndRoute}
 * method to add assets to the cache and respond to network requests with these
 * cached assets.
 *
 * If you require more control over caching and routing, you can use the
 * {@link workbox-precaching.PrecacheController}
 * interface.
 *
 * @module workbox-precaching
 */



/***/ }),

/***/ "./node_modules/workbox-precaching/matchPrecache.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   matchPrecache: () => (/* binding */ matchPrecache)
/* harmony export */ });
/* harmony import */ var _utils_getOrCreatePrecacheController_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-precaching/utils/getOrCreatePrecacheController.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-precaching/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_1__);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * Helper function that calls
 * {@link PrecacheController#matchPrecache} on the default
 * {@link PrecacheController} instance.
 *
 * If you are creating your own {@link PrecacheController}, then call
 * {@link PrecacheController#matchPrecache} on that instance,
 * instead of using this function.
 *
 * @param {string|Request} request The key (without revisioning parameters)
 * to look up in the precache.
 * @return {Promise<Response|undefined>}
 *
 * @memberof workbox-precaching
 */
function matchPrecache(request) {
  const precacheController = (0,_utils_getOrCreatePrecacheController_js__WEBPACK_IMPORTED_MODULE_0__.getOrCreatePrecacheController)();
  return precacheController.matchPrecache(request);
}


/***/ }),

/***/ "./node_modules/workbox-precaching/precache.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   precache: () => (/* binding */ precache)
/* harmony export */ });
/* harmony import */ var _utils_getOrCreatePrecacheController_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-precaching/utils/getOrCreatePrecacheController.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-precaching/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_1__);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * Adds items to the precache list, removing any duplicates and
 * stores the files in the
 * {@link workbox-core.cacheNames|"precache cache"} when the service
 * worker installs.
 *
 * This method can be called multiple times.
 *
 * Please note: This method **will not** serve any of the cached files for you.
 * It only precaches files. To respond to a network request you call
 * {@link workbox-precaching.addRoute}.
 *
 * If you have a single array of files to precache, you can just call
 * {@link workbox-precaching.precacheAndRoute}.
 *
 * @param {Array<Object|string>} [entries=[]] Array of entries to precache.
 *
 * @memberof workbox-precaching
 */
function precache(entries) {
  const precacheController = (0,_utils_getOrCreatePrecacheController_js__WEBPACK_IMPORTED_MODULE_0__.getOrCreatePrecacheController)();
  precacheController.precache(entries);
}


/***/ }),

/***/ "./node_modules/workbox-precaching/precacheAndRoute.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   precacheAndRoute: () => (/* binding */ precacheAndRoute)
/* harmony export */ });
/* harmony import */ var _addRoute_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-precaching/addRoute.js");
/* harmony import */ var _precache_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-precaching/precache.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-precaching/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_2__);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/



/**
 * This method will add entries to the precache list and add a route to
 * respond to fetch events.
 *
 * This is a convenience method that will call
 * {@link workbox-precaching.precache} and
 * {@link workbox-precaching.addRoute} in a single call.
 *
 * @param {Array<Object|string>} entries Array of entries to precache.
 * @param {Object} [options] See the
 * {@link workbox-precaching.PrecacheRoute} options.
 *
 * @memberof workbox-precaching
 */
function precacheAndRoute(entries, options) {
  (0,_precache_js__WEBPACK_IMPORTED_MODULE_1__.precache)(entries);
  (0,_addRoute_js__WEBPACK_IMPORTED_MODULE_0__.addRoute)(options);
}


/***/ }),

/***/ "./node_modules/workbox-precaching/utils/PrecacheCacheKeyPlugin.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PrecacheCacheKeyPlugin: () => (/* binding */ PrecacheCacheKeyPlugin)
/* harmony export */ });
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-precaching/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_0__);
/*
  Copyright 2020 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

/**
 * A plugin, designed to be used with PrecacheController, to translate URLs into
 * the corresponding cache key, based on the current revision info.
 *
 * @private
 */
class PrecacheCacheKeyPlugin {
  constructor(_ref) {
    let {
      precacheController
    } = _ref;
    this.cacheKeyWillBeUsed = async _ref2 => {
      let {
        request,
        params
      } = _ref2;
      // Params is type any, can't change right now.
      /* eslint-disable */
      const cacheKey = (params === null || params === void 0 ? void 0 : params.cacheKey) || this._precacheController.getCacheKeyForURL(request.url);
      /* eslint-enable */
      return cacheKey ? new Request(cacheKey, {
        headers: request.headers
      }) : request;
    };
    this._precacheController = precacheController;
  }
}


/***/ }),

/***/ "./node_modules/workbox-precaching/utils/PrecacheInstallReportPlugin.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PrecacheInstallReportPlugin: () => (/* binding */ PrecacheInstallReportPlugin)
/* harmony export */ });
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-precaching/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_0__);
/*
  Copyright 2020 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

/**
 * A plugin, designed to be used with PrecacheController, to determine the
 * of assets that were updated (or not updated) during the install event.
 *
 * @private
 */
class PrecacheInstallReportPlugin {
  constructor() {
    this.updatedURLs = [];
    this.notUpdatedURLs = [];
    this.handlerWillStart = async _ref => {
      let {
        request,
        state
      } = _ref;
      // TODO: `state` should never be undefined...
      if (state) {
        state.originalRequest = request;
      }
    };
    this.cachedResponseWillBeUsed = async _ref2 => {
      let {
        event,
        state,
        cachedResponse
      } = _ref2;
      if (event.type === 'install') {
        if (state && state.originalRequest && state.originalRequest instanceof Request) {
          // TODO: `state` should never be undefined...
          const url = state.originalRequest.url;
          if (cachedResponse) {
            this.notUpdatedURLs.push(url);
          } else {
            this.updatedURLs.push(url);
          }
        }
      }
      return cachedResponse;
    };
  }
}


/***/ }),

/***/ "./node_modules/workbox-precaching/utils/createCacheKey.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createCacheKey: () => (/* binding */ createCacheKey)
/* harmony export */ });
/* harmony import */ var workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/WorkboxError.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-precaching/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_1__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


// Name of the search parameter used to store revision info.
const REVISION_SEARCH_PARAM = '__WB_REVISION__';
/**
 * Converts a manifest entry into a versioned URL suitable for precaching.
 *
 * @param {Object|string} entry
 * @return {string} A URL with versioning info.
 *
 * @private
 * @memberof workbox-precaching
 */
function createCacheKey(entry) {
  if (!entry) {
    throw new workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_0__.WorkboxError('add-to-cache-list-unexpected-type', {
      entry
    });
  }
  // If a precache manifest entry is a string, it's assumed to be a versioned
  // URL, like '/app.abcd1234.js'. Return as-is.
  if (typeof entry === 'string') {
    const urlObject = new URL(entry, location.href);
    return {
      cacheKey: urlObject.href,
      url: urlObject.href
    };
  }
  const {
    revision,
    url
  } = entry;
  if (!url) {
    throw new workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_0__.WorkboxError('add-to-cache-list-unexpected-type', {
      entry
    });
  }
  // If there's just a URL and no revision, then it's also assumed to be a
  // versioned URL.
  if (!revision) {
    const urlObject = new URL(url, location.href);
    return {
      cacheKey: urlObject.href,
      url: urlObject.href
    };
  }
  // Otherwise, construct a properly versioned URL using the custom Workbox
  // search parameter along with the revision info.
  const cacheKeyURL = new URL(url, location.href);
  const originalURL = new URL(url, location.href);
  cacheKeyURL.searchParams.set(REVISION_SEARCH_PARAM, revision);
  return {
    cacheKey: cacheKeyURL.href,
    url: originalURL.href
  };
}

/***/ }),

/***/ "./node_modules/workbox-precaching/utils/deleteOutdatedCaches.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   deleteOutdatedCaches: () => (/* binding */ deleteOutdatedCaches)
/* harmony export */ });
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-precaching/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_0__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

const SUBSTRING_TO_FIND = '-precache-';
/**
 * Cleans up incompatible precaches that were created by older versions of
 * Workbox, by a service worker registered under the current scope.
 *
 * This is meant to be called as part of the `activate` event.
 *
 * This should be safe to use as long as you don't include `substringToFind`
 * (defaulting to `-precache-`) in your non-precache cache names.
 *
 * @param {string} currentPrecacheName The cache name currently in use for
 * precaching. This cache won't be deleted.
 * @param {string} [substringToFind='-precache-'] Cache names which include this
 * substring will be deleted (excluding `currentPrecacheName`).
 * @return {Array<string>} A list of all the cache names that were deleted.
 *
 * @private
 * @memberof workbox-precaching
 */
const deleteOutdatedCaches = async function (currentPrecacheName) {
  let substringToFind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : SUBSTRING_TO_FIND;
  const cacheNames = await self.caches.keys();
  const cacheNamesToDelete = cacheNames.filter(cacheName => {
    return cacheName.includes(substringToFind) && cacheName.includes(self.registration.scope) && cacheName !== currentPrecacheName;
  });
  await Promise.all(cacheNamesToDelete.map(cacheName => self.caches.delete(cacheName)));
  return cacheNamesToDelete;
};


/***/ }),

/***/ "./node_modules/workbox-precaching/utils/generateURLVariations.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   generateURLVariations: () => (/* binding */ generateURLVariations)
/* harmony export */ });
/* harmony import */ var _removeIgnoredSearchParams_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-precaching/utils/removeIgnoredSearchParams.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-precaching/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_1__);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * Generator function that yields possible variations on the original URL to
 * check, one at a time.
 *
 * @param {string} url
 * @param {Object} options
 *
 * @private
 * @memberof workbox-precaching
 */
function generateURLVariations(url) {
  let {
    ignoreURLParametersMatching = [/^utm_/, /^fbclid$/],
    directoryIndex = 'index.html',
    cleanURLs = true,
    urlManipulation
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return function* () {
    const urlObject = new URL(url, location.href);
    urlObject.hash = '';
    yield urlObject.href;
    const urlWithoutIgnoredParams = (0,_removeIgnoredSearchParams_js__WEBPACK_IMPORTED_MODULE_0__.removeIgnoredSearchParams)(urlObject, ignoreURLParametersMatching);
    yield urlWithoutIgnoredParams.href;
    if (directoryIndex && urlWithoutIgnoredParams.pathname.endsWith('/')) {
      const directoryURL = new URL(urlWithoutIgnoredParams.href);
      directoryURL.pathname += directoryIndex;
      yield directoryURL.href;
    }
    if (cleanURLs) {
      const cleanURL = new URL(urlWithoutIgnoredParams.href);
      cleanURL.pathname += '.html';
      yield cleanURL.href;
    }
    if (urlManipulation) {
      const additionalURLs = urlManipulation({
        url: urlObject
      });
      for (const urlToAttempt of additionalURLs) {
        yield urlToAttempt.href;
      }
    }
  }();
}

/***/ }),

/***/ "./node_modules/workbox-precaching/utils/getOrCreatePrecacheController.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getOrCreatePrecacheController: () => (/* binding */ getOrCreatePrecacheController)
/* harmony export */ });
/* harmony import */ var _PrecacheController_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-precaching/PrecacheController.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-precaching/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_1__);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


let precacheController;
/**
 * @return {PrecacheController}
 * @private
 */
const getOrCreatePrecacheController = () => {
  if (!precacheController) {
    precacheController = new _PrecacheController_js__WEBPACK_IMPORTED_MODULE_0__.PrecacheController();
  }
  return precacheController;
};

/***/ }),

/***/ "./node_modules/workbox-precaching/utils/printCleanupDetails.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   printCleanupDetails: () => (/* binding */ printCleanupDetails)
/* harmony export */ });
/* harmony import */ var workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/logger.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-precaching/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_1__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * @param {string} groupTitle
 * @param {Array<string>} deletedURLs
 *
 * @private
 */
const logGroup = (groupTitle, deletedURLs) => {
  workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_0__.logger.groupCollapsed(groupTitle);
  for (const url of deletedURLs) {
    workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_0__.logger.log(url);
  }
  workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_0__.logger.groupEnd();
};
/**
 * @param {Array<string>} deletedURLs
 *
 * @private
 * @memberof workbox-precaching
 */
function printCleanupDetails(deletedURLs) {
  const deletionCount = deletedURLs.length;
  if (deletionCount > 0) {
    workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_0__.logger.groupCollapsed("During precaching cleanup, " + "".concat(deletionCount, " cached ") + "request".concat(deletionCount === 1 ? ' was' : 's were', " deleted."));
    logGroup('Deleted Cache Requests', deletedURLs);
    workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_0__.logger.groupEnd();
  }
}

/***/ }),

/***/ "./node_modules/workbox-precaching/utils/printInstallDetails.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   printInstallDetails: () => (/* binding */ printInstallDetails)
/* harmony export */ });
/* harmony import */ var workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/logger.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-precaching/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_1__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * @param {string} groupTitle
 * @param {Array<string>} urls
 *
 * @private
 */
function _nestedGroup(groupTitle, urls) {
  if (urls.length === 0) {
    return;
  }
  workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_0__.logger.groupCollapsed(groupTitle);
  for (const url of urls) {
    workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_0__.logger.log(url);
  }
  workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_0__.logger.groupEnd();
}
/**
 * @param {Array<string>} urlsToPrecache
 * @param {Array<string>} urlsAlreadyPrecached
 *
 * @private
 * @memberof workbox-precaching
 */
function printInstallDetails(urlsToPrecache, urlsAlreadyPrecached) {
  const precachedCount = urlsToPrecache.length;
  const alreadyPrecachedCount = urlsAlreadyPrecached.length;
  if (precachedCount || alreadyPrecachedCount) {
    let message = "Precaching ".concat(precachedCount, " file").concat(precachedCount === 1 ? '' : 's', ".");
    if (alreadyPrecachedCount > 0) {
      message += " ".concat(alreadyPrecachedCount, " ") + "file".concat(alreadyPrecachedCount === 1 ? ' is' : 's are', " already cached.");
    }
    workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_0__.logger.groupCollapsed(message);
    _nestedGroup("View newly precached URLs.", urlsToPrecache);
    _nestedGroup("View previously precached URLs.", urlsAlreadyPrecached);
    workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_0__.logger.groupEnd();
  }
}

/***/ }),

/***/ "./node_modules/workbox-precaching/utils/removeIgnoredSearchParams.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   removeIgnoredSearchParams: () => (/* binding */ removeIgnoredSearchParams)
/* harmony export */ });
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-precaching/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_0__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

/**
 * Removes any URL search parameters that should be ignored.
 *
 * @param {URL} urlObject The original URL.
 * @param {Array<RegExp>} ignoreURLParametersMatching RegExps to test against
 * each search parameter name. Matches mean that the search parameter should be
 * ignored.
 * @return {URL} The URL with any ignored search parameters removed.
 *
 * @private
 * @memberof workbox-precaching
 */
function removeIgnoredSearchParams(urlObject) {
  let ignoreURLParametersMatching = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  // Convert the iterable into an array at the start of the loop to make sure
  // deletion doesn't mess up iteration.
  for (const paramName of [...urlObject.searchParams.keys()]) {
    if (ignoreURLParametersMatching.some(regExp => regExp.test(paramName))) {
      urlObject.searchParams.delete(paramName);
    }
  }
  return urlObject;
}

/***/ }),

/***/ "./node_modules/workbox-routing/NavigationRoute.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NavigationRoute: () => (/* binding */ NavigationRoute)
/* harmony export */ });
/* harmony import */ var workbox_core_private_assert_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/assert.js");
/* harmony import */ var workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_private/logger.js");
/* harmony import */ var _Route_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-routing/Route.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-routing/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_3__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/




/**
 * NavigationRoute makes it easy to create a
 * {@link workbox-routing.Route} that matches for browser
 * [navigation requests]{@link https://developers.google.com/web/fundamentals/primers/service-workers/high-performance-loading#first_what_are_navigation_requests}.
 *
 * It will only match incoming Requests whose
 * {@link https://fetch.spec.whatwg.org/#concept-request-mode|mode}
 * is set to `navigate`.
 *
 * You can optionally only apply this route to a subset of navigation requests
 * by using one or both of the `denylist` and `allowlist` parameters.
 *
 * @memberof workbox-routing
 * @extends workbox-routing.Route
 */
class NavigationRoute extends _Route_js__WEBPACK_IMPORTED_MODULE_2__.Route {
  /**
   * If both `denylist` and `allowlist` are provided, the `denylist` will
   * take precedence and the request will not match this route.
   *
   * The regular expressions in `allowlist` and `denylist`
   * are matched against the concatenated
   * [`pathname`]{@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/pathname}
   * and [`search`]{@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/search}
   * portions of the requested URL.
   *
   * *Note*: These RegExps may be evaluated against every destination URL during
   * a navigation. Avoid using
   * [complex RegExps](https://github.com/GoogleChrome/workbox/issues/3077),
   * or else your users may see delays when navigating your site.
   *
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   * @param {Object} options
   * @param {Array<RegExp>} [options.denylist] If any of these patterns match,
   * the route will not handle the request (even if a allowlist RegExp matches).
   * @param {Array<RegExp>} [options.allowlist=[/./]] If any of these patterns
   * match the URL's pathname and search parameter, the route will handle the
   * request (assuming the denylist doesn't match).
   */
  constructor(handler) {
    let {
      allowlist = [/./],
      denylist = []
    } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (false) {}
    super(options => this._match(options), handler);
    this._allowlist = allowlist;
    this._denylist = denylist;
  }
  /**
   * Routes match handler.
   *
   * @param {Object} options
   * @param {URL} options.url
   * @param {Request} options.request
   * @return {boolean}
   *
   * @private
   */
  _match(_ref) {
    let {
      url,
      request
    } = _ref;
    if (request && request.mode !== 'navigate') {
      return false;
    }
    const pathnameAndSearch = url.pathname + url.search;
    for (const regExp of this._denylist) {
      if (regExp.test(pathnameAndSearch)) {
        if (false) {}
        return false;
      }
    }
    if (this._allowlist.some(regExp => regExp.test(pathnameAndSearch))) {
      if (false) {}
      return true;
    }
    if (false) {}
    return false;
  }
}


/***/ }),

/***/ "./node_modules/workbox-routing/RegExpRoute.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RegExpRoute: () => (/* binding */ RegExpRoute)
/* harmony export */ });
/* harmony import */ var workbox_core_private_assert_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/assert.js");
/* harmony import */ var workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_private/logger.js");
/* harmony import */ var _Route_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-routing/Route.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-routing/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_3__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/




/**
 * RegExpRoute makes it easy to create a regular expression based
 * {@link workbox-routing.Route}.
 *
 * For same-origin requests the RegExp only needs to match part of the URL. For
 * requests against third-party servers, you must define a RegExp that matches
 * the start of the URL.
 *
 * @memberof workbox-routing
 * @extends workbox-routing.Route
 */
class RegExpRoute extends _Route_js__WEBPACK_IMPORTED_MODULE_2__.Route {
  /**
   * If the regular expression contains
   * [capture groups]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#grouping-back-references},
   * the captured values will be passed to the
   * {@link workbox-routing~handlerCallback} `params`
   * argument.
   *
   * @param {RegExp} regExp The regular expression to match against URLs.
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   * @param {string} [method='GET'] The HTTP method to match the Route
   * against.
   */
  constructor(regExp, handler, method) {
    if (false) {}
    const match = _ref => {
      let {
        url
      } = _ref;
      const result = regExp.exec(url.href);
      // Return immediately if there's no match.
      if (!result) {
        return;
      }
      // Require that the match start at the first character in the URL string
      // if it's a cross-origin request.
      // See https://github.com/GoogleChrome/workbox/issues/281 for the context
      // behind this behavior.
      if (url.origin !== location.origin && result.index !== 0) {
        if (false) {}
        return;
      }
      // If the route matches, but there aren't any capture groups defined, then
      // this will return [], which is truthy and therefore sufficient to
      // indicate a match.
      // If there are capture groups, then it will return their values.
      return result.slice(1);
    };
    super(match, handler, method);
  }
}


/***/ }),

/***/ "./node_modules/workbox-routing/Route.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Route: () => (/* binding */ Route)
/* harmony export */ });
/* harmony import */ var workbox_core_private_assert_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/assert.js");
/* harmony import */ var _utils_constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-routing/utils/constants.js");
/* harmony import */ var _utils_normalizeHandler_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-routing/utils/normalizeHandler.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-routing/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_3__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/




/**
 * A `Route` consists of a pair of callback functions, "match" and "handler".
 * The "match" callback determine if a route should be used to "handle" a
 * request by returning a non-falsy value if it can. The "handler" callback
 * is called when there is a match and should return a Promise that resolves
 * to a `Response`.
 *
 * @memberof workbox-routing
 */
class Route {
  /**
   * Constructor for Route class.
   *
   * @param {workbox-routing~matchCallback} match
   * A callback function that determines whether the route matches a given
   * `fetch` event by returning a non-falsy value.
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resolving to a Response.
   * @param {string} [method='GET'] The HTTP method to match the Route
   * against.
   */
  constructor(match, handler) {
    let method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _utils_constants_js__WEBPACK_IMPORTED_MODULE_1__.defaultMethod;
    if (false) {}
    // These values are referenced directly by Router so cannot be
    // altered by minificaton.
    this.handler = (0,_utils_normalizeHandler_js__WEBPACK_IMPORTED_MODULE_2__.normalizeHandler)(handler);
    this.match = match;
    this.method = method;
  }
  /**
   *
   * @param {workbox-routing-handlerCallback} handler A callback
   * function that returns a Promise resolving to a Response
   */
  setCatchHandler(handler) {
    this.catchHandler = (0,_utils_normalizeHandler_js__WEBPACK_IMPORTED_MODULE_2__.normalizeHandler)(handler);
  }
}


/***/ }),

/***/ "./node_modules/workbox-routing/Router.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Router: () => (/* binding */ Router)
/* harmony export */ });
/* harmony import */ var workbox_core_private_assert_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/assert.js");
/* harmony import */ var workbox_core_private_getFriendlyURL_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_private/getFriendlyURL.js");
/* harmony import */ var _utils_constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-routing/utils/constants.js");
/* harmony import */ var workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-core/_private/logger.js");
/* harmony import */ var _utils_normalizeHandler_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./node_modules/workbox-routing/utils/normalizeHandler.js");
/* harmony import */ var workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./node_modules/workbox-core/_private/WorkboxError.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("./node_modules/workbox-routing/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_6__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/







/**
 * The Router can be used to process a `FetchEvent` using one or more
 * {@link workbox-routing.Route}, responding with a `Response` if
 * a matching route exists.
 *
 * If no route matches a given a request, the Router will use a "default"
 * handler if one is defined.
 *
 * Should the matching Route throw an error, the Router will use a "catch"
 * handler if one is defined to gracefully deal with issues and respond with a
 * Request.
 *
 * If a request matches multiple routes, the **earliest** registered route will
 * be used to respond to the request.
 *
 * @memberof workbox-routing
 */
class Router {
  /**
   * Initializes a new Router.
   */
  constructor() {
    this._routes = new Map();
    this._defaultHandlerMap = new Map();
  }
  /**
   * @return {Map<string, Array<workbox-routing.Route>>} routes A `Map` of HTTP
   * method name ('GET', etc.) to an array of all the corresponding `Route`
   * instances that are registered.
   */
  get routes() {
    return this._routes;
  }
  /**
   * Adds a fetch event listener to respond to events when a route matches
   * the event's request.
   */
  addFetchListener() {
    // See https://github.com/Microsoft/TypeScript/issues/28357#issuecomment-436484705
    self.addEventListener('fetch', event => {
      const {
        request
      } = event;
      const responsePromise = this.handleRequest({
        request,
        event
      });
      if (responsePromise) {
        event.respondWith(responsePromise);
      }
    });
  }
  /**
   * Adds a message event listener for URLs to cache from the window.
   * This is useful to cache resources loaded on the page prior to when the
   * service worker started controlling it.
   *
   * The format of the message data sent from the window should be as follows.
   * Where the `urlsToCache` array may consist of URL strings or an array of
   * URL string + `requestInit` object (the same as you'd pass to `fetch()`).
   *
   * ```
   * {
   *   type: 'CACHE_URLS',
   *   payload: {
   *     urlsToCache: [
   *       './script1.js',
   *       './script2.js',
   *       ['./script3.js', {mode: 'no-cors'}],
   *     ],
   *   },
   * }
   * ```
   */
  addCacheListener() {
    // See https://github.com/Microsoft/TypeScript/issues/28357#issuecomment-436484705
    self.addEventListener('message', event => {
      // event.data is type 'any'
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (event.data && event.data.type === 'CACHE_URLS') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const {
          payload
        } = event.data;
        if (false) {}
        const requestPromises = Promise.all(payload.urlsToCache.map(entry => {
          if (typeof entry === 'string') {
            entry = [entry];
          }
          const request = new Request(...entry);
          return this.handleRequest({
            request,
            event
          });
          // TODO(philipwalton): TypeScript errors without this typecast for
          // some reason (probably a bug). The real type here should work but
          // doesn't: `Array<Promise<Response> | undefined>`.
        })); // TypeScript
        event.waitUntil(requestPromises);
        // If a MessageChannel was used, reply to the message on success.
        if (event.ports && event.ports[0]) {
          void requestPromises.then(() => event.ports[0].postMessage(true));
        }
      }
    });
  }
  /**
   * Apply the routing rules to a FetchEvent object to get a Response from an
   * appropriate Route's handler.
   *
   * @param {Object} options
   * @param {Request} options.request The request to handle.
   * @param {ExtendableEvent} options.event The event that triggered the
   *     request.
   * @return {Promise<Response>|undefined} A promise is returned if a
   *     registered route can handle the request. If there is no matching
   *     route and there's no `defaultHandler`, `undefined` is returned.
   */
  handleRequest(_ref) {
    let {
      request,
      event
    } = _ref;
    if (false) {}
    const url = new URL(request.url, location.href);
    if (!url.protocol.startsWith('http')) {
      if (false) {}
      return;
    }
    const sameOrigin = url.origin === location.origin;
    const {
      params,
      route
    } = this.findMatchingRoute({
      event,
      request,
      sameOrigin,
      url
    });
    let handler = route && route.handler;
    const debugMessages = [];
    if (false) {}
    // If we don't have a handler because there was no matching route, then
    // fall back to defaultHandler if that's defined.
    const method = request.method;
    if (!handler && this._defaultHandlerMap.has(method)) {
      if (false) {}
      handler = this._defaultHandlerMap.get(method);
    }
    if (!handler) {
      if (false) {}
      return;
    }
    if (false) {}
    // Wrap in try and catch in case the handle method throws a synchronous
    // error. It should still callback to the catch handler.
    let responsePromise;
    try {
      responsePromise = handler.handle({
        url,
        request,
        event,
        params
      });
    } catch (err) {
      responsePromise = Promise.reject(err);
    }
    // Get route's catch handler, if it exists
    const catchHandler = route && route.catchHandler;
    if (responsePromise instanceof Promise && (this._catchHandler || catchHandler)) {
      responsePromise = responsePromise.catch(async err => {
        // If there's a route catch handler, process that first
        if (catchHandler) {
          if (false) {}
          try {
            return await catchHandler.handle({
              url,
              request,
              event,
              params
            });
          } catch (catchErr) {
            if (catchErr instanceof Error) {
              err = catchErr;
            }
          }
        }
        if (this._catchHandler) {
          if (false) {}
          return this._catchHandler.handle({
            url,
            request,
            event
          });
        }
        throw err;
      });
    }
    return responsePromise;
  }
  /**
   * Checks a request and URL (and optionally an event) against the list of
   * registered routes, and if there's a match, returns the corresponding
   * route along with any params generated by the match.
   *
   * @param {Object} options
   * @param {URL} options.url
   * @param {boolean} options.sameOrigin The result of comparing `url.origin`
   *     against the current origin.
   * @param {Request} options.request The request to match.
   * @param {Event} options.event The corresponding event.
   * @return {Object} An object with `route` and `params` properties.
   *     They are populated if a matching route was found or `undefined`
   *     otherwise.
   */
  findMatchingRoute(_ref2) {
    let {
      url,
      sameOrigin,
      request,
      event
    } = _ref2;
    const routes = this._routes.get(request.method) || [];
    for (const route of routes) {
      let params;
      // route.match returns type any, not possible to change right now.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const matchResult = route.match({
        url,
        sameOrigin,
        request,
        event
      });
      if (matchResult) {
        if (false) {}
        // See https://github.com/GoogleChrome/workbox/issues/2079
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        params = matchResult;
        if (Array.isArray(params) && params.length === 0) {
          // Instead of passing an empty array in as params, use undefined.
          params = undefined;
        } else if (matchResult.constructor === Object &&
        // eslint-disable-line
        Object.keys(matchResult).length === 0) {
          // Instead of passing an empty object in as params, use undefined.
          params = undefined;
        } else if (typeof matchResult === 'boolean') {
          // For the boolean value true (rather than just something truth-y),
          // don't set params.
          // See https://github.com/GoogleChrome/workbox/pull/2134#issuecomment-513924353
          params = undefined;
        }
        // Return early if have a match.
        return {
          route,
          params
        };
      }
    }
    // If no match was found above, return and empty object.
    return {};
  }
  /**
   * Define a default `handler` that's called when no routes explicitly
   * match the incoming request.
   *
   * Each HTTP method ('GET', 'POST', etc.) gets its own default handler.
   *
   * Without a default handler, unmatched requests will go against the
   * network as if there were no service worker present.
   *
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   * @param {string} [method='GET'] The HTTP method to associate with this
   * default handler. Each method has its own default.
   */
  setDefaultHandler(handler) {
    let method = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _utils_constants_js__WEBPACK_IMPORTED_MODULE_2__.defaultMethod;
    this._defaultHandlerMap.set(method, (0,_utils_normalizeHandler_js__WEBPACK_IMPORTED_MODULE_4__.normalizeHandler)(handler));
  }
  /**
   * If a Route throws an error while handling a request, this `handler`
   * will be called and given a chance to provide a response.
   *
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   */
  setCatchHandler(handler) {
    this._catchHandler = (0,_utils_normalizeHandler_js__WEBPACK_IMPORTED_MODULE_4__.normalizeHandler)(handler);
  }
  /**
   * Registers a route with the router.
   *
   * @param {workbox-routing.Route} route The route to register.
   */
  registerRoute(route) {
    if (false) {}
    if (!this._routes.has(route.method)) {
      this._routes.set(route.method, []);
    }
    // Give precedence to all of the earlier routes by adding this additional
    // route to the end of the array.
    this._routes.get(route.method).push(route);
  }
  /**
   * Unregisters a route with the router.
   *
   * @param {workbox-routing.Route} route The route to unregister.
   */
  unregisterRoute(route) {
    if (!this._routes.has(route.method)) {
      throw new workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_5__.WorkboxError('unregister-route-but-not-found-with-method', {
        method: route.method
      });
    }
    const routeIndex = this._routes.get(route.method).indexOf(route);
    if (routeIndex > -1) {
      this._routes.get(route.method).splice(routeIndex, 1);
    } else {
      throw new workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_5__.WorkboxError('unregister-route-route-not-registered');
    }
  }
}


/***/ }),

/***/ "./node_modules/workbox-routing/_version.js":
/***/ (() => {



// @ts-ignore
try {
  self['workbox:routing:6.6.0'] && _();
} catch (e) {}

/***/ }),

/***/ "./node_modules/workbox-routing/index.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NavigationRoute: () => (/* reexport safe */ _NavigationRoute_js__WEBPACK_IMPORTED_MODULE_0__.NavigationRoute),
/* harmony export */   RegExpRoute: () => (/* reexport safe */ _RegExpRoute_js__WEBPACK_IMPORTED_MODULE_1__.RegExpRoute),
/* harmony export */   Route: () => (/* reexport safe */ _Route_js__WEBPACK_IMPORTED_MODULE_3__.Route),
/* harmony export */   Router: () => (/* reexport safe */ _Router_js__WEBPACK_IMPORTED_MODULE_4__.Router),
/* harmony export */   registerRoute: () => (/* reexport safe */ _registerRoute_js__WEBPACK_IMPORTED_MODULE_2__.registerRoute),
/* harmony export */   setCatchHandler: () => (/* reexport safe */ _setCatchHandler_js__WEBPACK_IMPORTED_MODULE_5__.setCatchHandler),
/* harmony export */   setDefaultHandler: () => (/* reexport safe */ _setDefaultHandler_js__WEBPACK_IMPORTED_MODULE_6__.setDefaultHandler)
/* harmony export */ });
/* harmony import */ var _NavigationRoute_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-routing/NavigationRoute.js");
/* harmony import */ var _RegExpRoute_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-routing/RegExpRoute.js");
/* harmony import */ var _registerRoute_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-routing/registerRoute.js");
/* harmony import */ var _Route_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-routing/Route.js");
/* harmony import */ var _Router_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./node_modules/workbox-routing/Router.js");
/* harmony import */ var _setCatchHandler_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./node_modules/workbox-routing/setCatchHandler.js");
/* harmony import */ var _setDefaultHandler_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("./node_modules/workbox-routing/setDefaultHandler.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__("./node_modules/workbox-routing/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_7__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/








/**
 * @module workbox-routing
 */


/***/ }),

/***/ "./node_modules/workbox-routing/registerRoute.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   registerRoute: () => (/* binding */ registerRoute)
/* harmony export */ });
/* harmony import */ var workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/logger.js");
/* harmony import */ var workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_private/WorkboxError.js");
/* harmony import */ var _Route_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-routing/Route.js");
/* harmony import */ var _RegExpRoute_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-routing/RegExpRoute.js");
/* harmony import */ var _utils_getOrCreateDefaultRouter_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./node_modules/workbox-routing/utils/getOrCreateDefaultRouter.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./node_modules/workbox-routing/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_5__);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/






/**
 * Easily register a RegExp, string, or function with a caching
 * strategy to a singleton Router instance.
 *
 * This method will generate a Route for you if needed and
 * call {@link workbox-routing.Router#registerRoute}.
 *
 * @param {RegExp|string|workbox-routing.Route~matchCallback|workbox-routing.Route} capture
 * If the capture param is a `Route`, all other arguments will be ignored.
 * @param {workbox-routing~handlerCallback} [handler] A callback
 * function that returns a Promise resulting in a Response. This parameter
 * is required if `capture` is not a `Route` object.
 * @param {string} [method='GET'] The HTTP method to match the Route
 * against.
 * @return {workbox-routing.Route} The generated `Route`.
 *
 * @memberof workbox-routing
 */
function registerRoute(capture, handler, method) {
  let route;
  if (typeof capture === 'string') {
    const captureUrl = new URL(capture, location.href);
    if (false) {}
    const matchCallback = _ref => {
      let {
        url
      } = _ref;
      if (false) {}
      return url.href === captureUrl.href;
    };
    // If `capture` is a string then `handler` and `method` must be present.
    route = new _Route_js__WEBPACK_IMPORTED_MODULE_2__.Route(matchCallback, handler, method);
  } else if (capture instanceof RegExp) {
    // If `capture` is a `RegExp` then `handler` and `method` must be present.
    route = new _RegExpRoute_js__WEBPACK_IMPORTED_MODULE_3__.RegExpRoute(capture, handler, method);
  } else if (typeof capture === 'function') {
    // If `capture` is a function then `handler` and `method` must be present.
    route = new _Route_js__WEBPACK_IMPORTED_MODULE_2__.Route(capture, handler, method);
  } else if (capture instanceof _Route_js__WEBPACK_IMPORTED_MODULE_2__.Route) {
    route = capture;
  } else {
    throw new workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_1__.WorkboxError('unsupported-route-type', {
      moduleName: 'workbox-routing',
      funcName: 'registerRoute',
      paramName: 'capture'
    });
  }
  const defaultRouter = (0,_utils_getOrCreateDefaultRouter_js__WEBPACK_IMPORTED_MODULE_4__.getOrCreateDefaultRouter)();
  defaultRouter.registerRoute(route);
  return route;
}


/***/ }),

/***/ "./node_modules/workbox-routing/setCatchHandler.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   setCatchHandler: () => (/* binding */ setCatchHandler)
/* harmony export */ });
/* harmony import */ var _utils_getOrCreateDefaultRouter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-routing/utils/getOrCreateDefaultRouter.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-routing/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_1__);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * If a Route throws an error while handling a request, this `handler`
 * will be called and given a chance to provide a response.
 *
 * @param {workbox-routing~handlerCallback} handler A callback
 * function that returns a Promise resulting in a Response.
 *
 * @memberof workbox-routing
 */
function setCatchHandler(handler) {
  const defaultRouter = (0,_utils_getOrCreateDefaultRouter_js__WEBPACK_IMPORTED_MODULE_0__.getOrCreateDefaultRouter)();
  defaultRouter.setCatchHandler(handler);
}


/***/ }),

/***/ "./node_modules/workbox-routing/setDefaultHandler.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   setDefaultHandler: () => (/* binding */ setDefaultHandler)
/* harmony export */ });
/* harmony import */ var _utils_getOrCreateDefaultRouter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-routing/utils/getOrCreateDefaultRouter.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-routing/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_1__);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * Define a default `handler` that's called when no routes explicitly
 * match the incoming request.
 *
 * Without a default handler, unmatched requests will go against the
 * network as if there were no service worker present.
 *
 * @param {workbox-routing~handlerCallback} handler A callback
 * function that returns a Promise resulting in a Response.
 *
 * @memberof workbox-routing
 */
function setDefaultHandler(handler) {
  const defaultRouter = (0,_utils_getOrCreateDefaultRouter_js__WEBPACK_IMPORTED_MODULE_0__.getOrCreateDefaultRouter)();
  defaultRouter.setDefaultHandler(handler);
}


/***/ }),

/***/ "./node_modules/workbox-routing/utils/constants.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   defaultMethod: () => (/* binding */ defaultMethod),
/* harmony export */   validMethods: () => (/* binding */ validMethods)
/* harmony export */ });
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-routing/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_0__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

/**
 * The default HTTP method, 'GET', used when there's no specific method
 * configured for a route.
 *
 * @type {string}
 *
 * @private
 */
const defaultMethod = 'GET';
/**
 * The list of valid HTTP methods associated with requests that could be routed.
 *
 * @type {Array<string>}
 *
 * @private
 */
const validMethods = ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT'];

/***/ }),

/***/ "./node_modules/workbox-routing/utils/getOrCreateDefaultRouter.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getOrCreateDefaultRouter: () => (/* binding */ getOrCreateDefaultRouter)
/* harmony export */ });
/* harmony import */ var _Router_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-routing/Router.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-routing/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_1__);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


let defaultRouter;
/**
 * Creates a new, singleton Router instance if one does not exist. If one
 * does already exist, that instance is returned.
 *
 * @private
 * @return {Router}
 */
const getOrCreateDefaultRouter = () => {
  if (!defaultRouter) {
    defaultRouter = new _Router_js__WEBPACK_IMPORTED_MODULE_0__.Router();
    // The helpers that use the default Router assume these listeners exist.
    defaultRouter.addFetchListener();
    defaultRouter.addCacheListener();
  }
  return defaultRouter;
};

/***/ }),

/***/ "./node_modules/workbox-routing/utils/normalizeHandler.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   normalizeHandler: () => (/* binding */ normalizeHandler)
/* harmony export */ });
/* harmony import */ var workbox_core_private_assert_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/assert.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-routing/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_1__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * @param {function()|Object} handler Either a function, or an object with a
 * 'handle' method.
 * @return {Object} An object with a handle method.
 *
 * @private
 */
const normalizeHandler = handler => {
  if (handler && typeof handler === 'object') {
    if (false) {}
    return handler;
  } else {
    if (false) {}
    return {
      handle: handler
    };
  }
};

/***/ }),

/***/ "./node_modules/workbox-strategies/CacheFirst.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CacheFirst: () => (/* binding */ CacheFirst)
/* harmony export */ });
/* harmony import */ var workbox_core_private_assert_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/assert.js");
/* harmony import */ var workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_private/logger.js");
/* harmony import */ var workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-core/_private/WorkboxError.js");
/* harmony import */ var _Strategy_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-strategies/Strategy.js");
/* harmony import */ var _utils_messages_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./node_modules/workbox-strategies/utils/messages.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./node_modules/workbox-strategies/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_5__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/






/**
 * An implementation of a [cache-first](https://developer.chrome.com/docs/workbox/caching-strategies-overview/#cache-first-falling-back-to-network)
 * request strategy.
 *
 * A cache first strategy is useful for assets that have been revisioned,
 * such as URLs like `/styles/example.a8f5f1.css`, since they
 * can be cached for long periods of time.
 *
 * If the network request fails, and there is no cache match, this will throw
 * a `WorkboxError` exception.
 *
 * @extends workbox-strategies.Strategy
 * @memberof workbox-strategies
 */
class CacheFirst extends _Strategy_js__WEBPACK_IMPORTED_MODULE_3__.Strategy {
  /**
   * @private
   * @param {Request|string} request A request to run this strategy for.
   * @param {workbox-strategies.StrategyHandler} handler The event that
   *     triggered the request.
   * @return {Promise<Response>}
   */
  async _handle(request, handler) {
    const logs = [];
    if (false) {}
    let response = await handler.cacheMatch(request);
    let error = undefined;
    if (!response) {
      if (false) {}
      try {
        response = await handler.fetchAndCachePut(request);
      } catch (err) {
        if (err instanceof Error) {
          error = err;
        }
      }
      if (false) {}
    } else {
      if (false) {}
    }
    if (false) {}
    if (!response) {
      throw new workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_2__.WorkboxError('no-response', {
        url: request.url,
        error
      });
    }
    return response;
  }
}


/***/ }),

/***/ "./node_modules/workbox-strategies/CacheOnly.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CacheOnly: () => (/* binding */ CacheOnly)
/* harmony export */ });
/* harmony import */ var workbox_core_private_assert_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/assert.js");
/* harmony import */ var workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_private/logger.js");
/* harmony import */ var workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-core/_private/WorkboxError.js");
/* harmony import */ var _Strategy_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-strategies/Strategy.js");
/* harmony import */ var _utils_messages_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./node_modules/workbox-strategies/utils/messages.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./node_modules/workbox-strategies/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_5__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/






/**
 * An implementation of a [cache-only](https://developer.chrome.com/docs/workbox/caching-strategies-overview/#cache-only)
 * request strategy.
 *
 * This class is useful if you want to take advantage of any
 * [Workbox plugins](https://developer.chrome.com/docs/workbox/using-plugins/).
 *
 * If there is no cache match, this will throw a `WorkboxError` exception.
 *
 * @extends workbox-strategies.Strategy
 * @memberof workbox-strategies
 */
class CacheOnly extends _Strategy_js__WEBPACK_IMPORTED_MODULE_3__.Strategy {
  /**
   * @private
   * @param {Request|string} request A request to run this strategy for.
   * @param {workbox-strategies.StrategyHandler} handler The event that
   *     triggered the request.
   * @return {Promise<Response>}
   */
  async _handle(request, handler) {
    if (false) {}
    const response = await handler.cacheMatch(request);
    if (false) {}
    if (!response) {
      throw new workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_2__.WorkboxError('no-response', {
        url: request.url
      });
    }
    return response;
  }
}


/***/ }),

/***/ "./node_modules/workbox-strategies/NetworkFirst.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NetworkFirst: () => (/* binding */ NetworkFirst)
/* harmony export */ });
/* harmony import */ var workbox_core_private_assert_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/assert.js");
/* harmony import */ var workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_private/logger.js");
/* harmony import */ var workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-core/_private/WorkboxError.js");
/* harmony import */ var _plugins_cacheOkAndOpaquePlugin_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-strategies/plugins/cacheOkAndOpaquePlugin.js");
/* harmony import */ var _Strategy_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./node_modules/workbox-strategies/Strategy.js");
/* harmony import */ var _utils_messages_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./node_modules/workbox-strategies/utils/messages.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("./node_modules/workbox-strategies/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_6__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/







/**
 * An implementation of a
 * [network first](https://developer.chrome.com/docs/workbox/caching-strategies-overview/#network-first-falling-back-to-cache)
 * request strategy.
 *
 * By default, this strategy will cache responses with a 200 status code as
 * well as [opaque responses](https://developer.chrome.com/docs/workbox/caching-resources-during-runtime/#opaque-responses).
 * Opaque responses are are cross-origin requests where the response doesn't
 * support [CORS](https://enable-cors.org/).
 *
 * If the network request fails, and there is no cache match, this will throw
 * a `WorkboxError` exception.
 *
 * @extends workbox-strategies.Strategy
 * @memberof workbox-strategies
 */
class NetworkFirst extends _Strategy_js__WEBPACK_IMPORTED_MODULE_4__.Strategy {
  /**
   * @param {Object} [options]
   * @param {string} [options.cacheName] Cache name to store and retrieve
   * requests. Defaults to cache names provided by
   * {@link workbox-core.cacheNames}.
   * @param {Array<Object>} [options.plugins] [Plugins]{@link https://developers.google.com/web/tools/workbox/guides/using-plugins}
   * to use in conjunction with this caching strategy.
   * @param {Object} [options.fetchOptions] Values passed along to the
   * [`init`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)
   * of [non-navigation](https://github.com/GoogleChrome/workbox/issues/1796)
   * `fetch()` requests made by this strategy.
   * @param {Object} [options.matchOptions] [`CacheQueryOptions`](https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions)
   * @param {number} [options.networkTimeoutSeconds] If set, any network requests
   * that fail to respond within the timeout will fallback to the cache.
   *
   * This option can be used to combat
   * "[lie-fi]{@link https://developers.google.com/web/fundamentals/performance/poor-connectivity/#lie-fi}"
   * scenarios.
   */
  constructor() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    super(options);
    // If this instance contains no plugins with a 'cacheWillUpdate' callback,
    // prepend the `cacheOkAndOpaquePlugin` plugin to the plugins list.
    if (!this.plugins.some(p => 'cacheWillUpdate' in p)) {
      this.plugins.unshift(_plugins_cacheOkAndOpaquePlugin_js__WEBPACK_IMPORTED_MODULE_3__.cacheOkAndOpaquePlugin);
    }
    this._networkTimeoutSeconds = options.networkTimeoutSeconds || 0;
    if (false) {}
  }
  /**
   * @private
   * @param {Request|string} request A request to run this strategy for.
   * @param {workbox-strategies.StrategyHandler} handler The event that
   *     triggered the request.
   * @return {Promise<Response>}
   */
  async _handle(request, handler) {
    const logs = [];
    if (false) {}
    const promises = [];
    let timeoutId;
    if (this._networkTimeoutSeconds) {
      const {
        id,
        promise
      } = this._getTimeoutPromise({
        request,
        logs,
        handler
      });
      timeoutId = id;
      promises.push(promise);
    }
    const networkPromise = this._getNetworkPromise({
      timeoutId,
      request,
      logs,
      handler
    });
    promises.push(networkPromise);
    const response = await handler.waitUntil((async () => {
      // Promise.race() will resolve as soon as the first promise resolves.
      return (await handler.waitUntil(Promise.race(promises))) || (
      // If Promise.race() resolved with null, it might be due to a network
      // timeout + a cache miss. If that were to happen, we'd rather wait until
      // the networkPromise resolves instead of returning null.
      // Note that it's fine to await an already-resolved promise, so we don't
      // have to check to see if it's still "in flight".
      await networkPromise);
    })());
    if (false) {}
    if (!response) {
      throw new workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_2__.WorkboxError('no-response', {
        url: request.url
      });
    }
    return response;
  }
  /**
   * @param {Object} options
   * @param {Request} options.request
   * @param {Array} options.logs A reference to the logs array
   * @param {Event} options.event
   * @return {Promise<Response>}
   *
   * @private
   */
  _getTimeoutPromise(_ref) {
    let {
      request,
      logs,
      handler
    } = _ref;
    let timeoutId;
    const timeoutPromise = new Promise(resolve => {
      const onNetworkTimeout = async () => {
        if (false) {}
        resolve(await handler.cacheMatch(request));
      };
      timeoutId = setTimeout(onNetworkTimeout, this._networkTimeoutSeconds * 1000);
    });
    return {
      promise: timeoutPromise,
      id: timeoutId
    };
  }
  /**
   * @param {Object} options
   * @param {number|undefined} options.timeoutId
   * @param {Request} options.request
   * @param {Array} options.logs A reference to the logs Array.
   * @param {Event} options.event
   * @return {Promise<Response>}
   *
   * @private
   */
  async _getNetworkPromise(_ref2) {
    let {
      timeoutId,
      request,
      logs,
      handler
    } = _ref2;
    let error;
    let response;
    try {
      response = await handler.fetchAndCachePut(request);
    } catch (fetchError) {
      if (fetchError instanceof Error) {
        error = fetchError;
      }
    }
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (false) {}
    if (error || !response) {
      response = await handler.cacheMatch(request);
      if (false) {}
    }
    return response;
  }
}


/***/ }),

/***/ "./node_modules/workbox-strategies/NetworkOnly.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NetworkOnly: () => (/* binding */ NetworkOnly)
/* harmony export */ });
/* harmony import */ var workbox_core_private_assert_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/assert.js");
/* harmony import */ var workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_private/logger.js");
/* harmony import */ var workbox_core_private_timeout_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-core/_private/timeout.js");
/* harmony import */ var workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-core/_private/WorkboxError.js");
/* harmony import */ var _Strategy_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./node_modules/workbox-strategies/Strategy.js");
/* harmony import */ var _utils_messages_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./node_modules/workbox-strategies/utils/messages.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("./node_modules/workbox-strategies/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_6__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/







/**
 * An implementation of a
 * [network-only](https://developer.chrome.com/docs/workbox/caching-strategies-overview/#network-only)
 * request strategy.
 *
 * This class is useful if you want to take advantage of any
 * [Workbox plugins](https://developer.chrome.com/docs/workbox/using-plugins/).
 *
 * If the network request fails, this will throw a `WorkboxError` exception.
 *
 * @extends workbox-strategies.Strategy
 * @memberof workbox-strategies
 */
class NetworkOnly extends _Strategy_js__WEBPACK_IMPORTED_MODULE_4__.Strategy {
  /**
   * @param {Object} [options]
   * @param {Array<Object>} [options.plugins] [Plugins]{@link https://developers.google.com/web/tools/workbox/guides/using-plugins}
   * to use in conjunction with this caching strategy.
   * @param {Object} [options.fetchOptions] Values passed along to the
   * [`init`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)
   * of [non-navigation](https://github.com/GoogleChrome/workbox/issues/1796)
   * `fetch()` requests made by this strategy.
   * @param {number} [options.networkTimeoutSeconds] If set, any network requests
   * that fail to respond within the timeout will result in a network error.
   */
  constructor() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    super(options);
    this._networkTimeoutSeconds = options.networkTimeoutSeconds || 0;
  }
  /**
   * @private
   * @param {Request|string} request A request to run this strategy for.
   * @param {workbox-strategies.StrategyHandler} handler The event that
   *     triggered the request.
   * @return {Promise<Response>}
   */
  async _handle(request, handler) {
    if (false) {}
    let error = undefined;
    let response;
    try {
      const promises = [handler.fetch(request)];
      if (this._networkTimeoutSeconds) {
        const timeoutPromise = (0,workbox_core_private_timeout_js__WEBPACK_IMPORTED_MODULE_2__.timeout)(this._networkTimeoutSeconds * 1000);
        promises.push(timeoutPromise);
      }
      response = await Promise.race(promises);
      if (!response) {
        throw new Error("Timed out the network response after " + "".concat(this._networkTimeoutSeconds, " seconds."));
      }
    } catch (err) {
      if (err instanceof Error) {
        error = err;
      }
    }
    if (false) {}
    if (!response) {
      throw new workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_3__.WorkboxError('no-response', {
        url: request.url,
        error
      });
    }
    return response;
  }
}


/***/ }),

/***/ "./node_modules/workbox-strategies/StaleWhileRevalidate.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StaleWhileRevalidate: () => (/* binding */ StaleWhileRevalidate)
/* harmony export */ });
/* harmony import */ var workbox_core_private_assert_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/assert.js");
/* harmony import */ var workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_private/logger.js");
/* harmony import */ var workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-core/_private/WorkboxError.js");
/* harmony import */ var _plugins_cacheOkAndOpaquePlugin_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-strategies/plugins/cacheOkAndOpaquePlugin.js");
/* harmony import */ var _Strategy_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./node_modules/workbox-strategies/Strategy.js");
/* harmony import */ var _utils_messages_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./node_modules/workbox-strategies/utils/messages.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("./node_modules/workbox-strategies/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_6__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/







/**
 * An implementation of a
 * [stale-while-revalidate](https://developer.chrome.com/docs/workbox/caching-strategies-overview/#stale-while-revalidate)
 * request strategy.
 *
 * Resources are requested from both the cache and the network in parallel.
 * The strategy will respond with the cached version if available, otherwise
 * wait for the network response. The cache is updated with the network response
 * with each successful request.
 *
 * By default, this strategy will cache responses with a 200 status code as
 * well as [opaque responses](https://developer.chrome.com/docs/workbox/caching-resources-during-runtime/#opaque-responses).
 * Opaque responses are cross-origin requests where the response doesn't
 * support [CORS](https://enable-cors.org/).
 *
 * If the network request fails, and there is no cache match, this will throw
 * a `WorkboxError` exception.
 *
 * @extends workbox-strategies.Strategy
 * @memberof workbox-strategies
 */
class StaleWhileRevalidate extends _Strategy_js__WEBPACK_IMPORTED_MODULE_4__.Strategy {
  /**
   * @param {Object} [options]
   * @param {string} [options.cacheName] Cache name to store and retrieve
   * requests. Defaults to cache names provided by
   * {@link workbox-core.cacheNames}.
   * @param {Array<Object>} [options.plugins] [Plugins]{@link https://developers.google.com/web/tools/workbox/guides/using-plugins}
   * to use in conjunction with this caching strategy.
   * @param {Object} [options.fetchOptions] Values passed along to the
   * [`init`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)
   * of [non-navigation](https://github.com/GoogleChrome/workbox/issues/1796)
   * `fetch()` requests made by this strategy.
   * @param {Object} [options.matchOptions] [`CacheQueryOptions`](https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions)
   */
  constructor() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    super(options);
    // If this instance contains no plugins with a 'cacheWillUpdate' callback,
    // prepend the `cacheOkAndOpaquePlugin` plugin to the plugins list.
    if (!this.plugins.some(p => 'cacheWillUpdate' in p)) {
      this.plugins.unshift(_plugins_cacheOkAndOpaquePlugin_js__WEBPACK_IMPORTED_MODULE_3__.cacheOkAndOpaquePlugin);
    }
  }
  /**
   * @private
   * @param {Request|string} request A request to run this strategy for.
   * @param {workbox-strategies.StrategyHandler} handler The event that
   *     triggered the request.
   * @return {Promise<Response>}
   */
  async _handle(request, handler) {
    const logs = [];
    if (false) {}
    const fetchAndCachePromise = handler.fetchAndCachePut(request).catch(() => {
      // Swallow this error because a 'no-response' error will be thrown in
      // main handler return flow. This will be in the `waitUntil()` flow.
    });
    void handler.waitUntil(fetchAndCachePromise);
    let response = await handler.cacheMatch(request);
    let error;
    if (response) {
      if (false) {}
    } else {
      if (false) {}
      try {
        // NOTE(philipwalton): Really annoying that we have to type cast here.
        // https://github.com/microsoft/TypeScript/issues/20006
        response = await fetchAndCachePromise;
      } catch (err) {
        if (err instanceof Error) {
          error = err;
        }
      }
    }
    if (false) {}
    if (!response) {
      throw new workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_2__.WorkboxError('no-response', {
        url: request.url,
        error
      });
    }
    return response;
  }
}


/***/ }),

/***/ "./node_modules/workbox-strategies/Strategy.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Strategy: () => (/* binding */ Strategy)
/* harmony export */ });
/* harmony import */ var workbox_core_private_cacheNames_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/cacheNames.js");
/* harmony import */ var workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_private/WorkboxError.js");
/* harmony import */ var workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-core/_private/logger.js");
/* harmony import */ var workbox_core_private_getFriendlyURL_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-core/_private/getFriendlyURL.js");
/* harmony import */ var _StrategyHandler_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./node_modules/workbox-strategies/StrategyHandler.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./node_modules/workbox-strategies/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_5__);
/*
  Copyright 2020 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/






/**
 * An abstract base class that all other strategy classes must extend from:
 *
 * @memberof workbox-strategies
 */
class Strategy {
  /**
   * Creates a new instance of the strategy and sets all documented option
   * properties as public instance properties.
   *
   * Note: if a custom strategy class extends the base Strategy class and does
   * not need more than these properties, it does not need to define its own
   * constructor.
   *
   * @param {Object} [options]
   * @param {string} [options.cacheName] Cache name to store and retrieve
   * requests. Defaults to the cache names provided by
   * {@link workbox-core.cacheNames}.
   * @param {Array<Object>} [options.plugins] [Plugins]{@link https://developers.google.com/web/tools/workbox/guides/using-plugins}
   * to use in conjunction with this caching strategy.
   * @param {Object} [options.fetchOptions] Values passed along to the
   * [`init`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)
   * of [non-navigation](https://github.com/GoogleChrome/workbox/issues/1796)
   * `fetch()` requests made by this strategy.
   * @param {Object} [options.matchOptions] The
   * [`CacheQueryOptions`]{@link https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions}
   * for any `cache.match()` or `cache.put()` calls made by this strategy.
   */
  constructor() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    /**
     * Cache name to store and retrieve
     * requests. Defaults to the cache names provided by
     * {@link workbox-core.cacheNames}.
     *
     * @type {string}
     */
    this.cacheName = workbox_core_private_cacheNames_js__WEBPACK_IMPORTED_MODULE_0__.cacheNames.getRuntimeName(options.cacheName);
    /**
     * The list
     * [Plugins]{@link https://developers.google.com/web/tools/workbox/guides/using-plugins}
     * used by this strategy.
     *
     * @type {Array<Object>}
     */
    this.plugins = options.plugins || [];
    /**
     * Values passed along to the
     * [`init`]{@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters}
     * of all fetch() requests made by this strategy.
     *
     * @type {Object}
     */
    this.fetchOptions = options.fetchOptions;
    /**
     * The
     * [`CacheQueryOptions`]{@link https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions}
     * for any `cache.match()` or `cache.put()` calls made by this strategy.
     *
     * @type {Object}
     */
    this.matchOptions = options.matchOptions;
  }
  /**
   * Perform a request strategy and returns a `Promise` that will resolve with
   * a `Response`, invoking all relevant plugin callbacks.
   *
   * When a strategy instance is registered with a Workbox
   * {@link workbox-routing.Route}, this method is automatically
   * called when the route matches.
   *
   * Alternatively, this method can be used in a standalone `FetchEvent`
   * listener by passing it to `event.respondWith()`.
   *
   * @param {FetchEvent|Object} options A `FetchEvent` or an object with the
   *     properties listed below.
   * @param {Request|string} options.request A request to run this strategy for.
   * @param {ExtendableEvent} options.event The event associated with the
   *     request.
   * @param {URL} [options.url]
   * @param {*} [options.params]
   */
  handle(options) {
    const [responseDone] = this.handleAll(options);
    return responseDone;
  }
  /**
   * Similar to {@link workbox-strategies.Strategy~handle}, but
   * instead of just returning a `Promise` that resolves to a `Response` it
   * it will return an tuple of `[response, done]` promises, where the former
   * (`response`) is equivalent to what `handle()` returns, and the latter is a
   * Promise that will resolve once any promises that were added to
   * `event.waitUntil()` as part of performing the strategy have completed.
   *
   * You can await the `done` promise to ensure any extra work performed by
   * the strategy (usually caching responses) completes successfully.
   *
   * @param {FetchEvent|Object} options A `FetchEvent` or an object with the
   *     properties listed below.
   * @param {Request|string} options.request A request to run this strategy for.
   * @param {ExtendableEvent} options.event The event associated with the
   *     request.
   * @param {URL} [options.url]
   * @param {*} [options.params]
   * @return {Array<Promise>} A tuple of [response, done]
   *     promises that can be used to determine when the response resolves as
   *     well as when the handler has completed all its work.
   */
  handleAll(options) {
    // Allow for flexible options to be passed.
    if (options instanceof FetchEvent) {
      options = {
        event: options,
        request: options.request
      };
    }
    const event = options.event;
    const request = typeof options.request === 'string' ? new Request(options.request) : options.request;
    const params = 'params' in options ? options.params : undefined;
    const handler = new _StrategyHandler_js__WEBPACK_IMPORTED_MODULE_4__.StrategyHandler(this, {
      event,
      request,
      params
    });
    const responseDone = this._getResponse(handler, request, event);
    const handlerDone = this._awaitComplete(responseDone, handler, request, event);
    // Return an array of promises, suitable for use with Promise.all().
    return [responseDone, handlerDone];
  }
  async _getResponse(handler, request, event) {
    await handler.runCallbacks('handlerWillStart', {
      event,
      request
    });
    let response = undefined;
    try {
      response = await this._handle(request, handler);
      // The "official" Strategy subclasses all throw this error automatically,
      // but in case a third-party Strategy doesn't, ensure that we have a
      // consistent failure when there's no response or an error response.
      if (!response || response.type === 'error') {
        throw new workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_1__.WorkboxError('no-response', {
          url: request.url
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        for (const callback of handler.iterateCallbacks('handlerDidError')) {
          response = await callback({
            error,
            event,
            request
          });
          if (response) {
            break;
          }
        }
      }
      if (!response) {
        throw error;
      } else if (false) {}
    }
    for (const callback of handler.iterateCallbacks('handlerWillRespond')) {
      response = await callback({
        event,
        request,
        response
      });
    }
    return response;
  }
  async _awaitComplete(responseDone, handler, request, event) {
    let response;
    let error;
    try {
      response = await responseDone;
    } catch (error) {
      // Ignore errors, as response errors should be caught via the `response`
      // promise above. The `done` promise will only throw for errors in
      // promises passed to `handler.waitUntil()`.
    }
    try {
      await handler.runCallbacks('handlerDidRespond', {
        event,
        request,
        response
      });
      await handler.doneWaiting();
    } catch (waitUntilError) {
      if (waitUntilError instanceof Error) {
        error = waitUntilError;
      }
    }
    await handler.runCallbacks('handlerDidComplete', {
      event,
      request,
      response,
      error: error
    });
    handler.destroy();
    if (error) {
      throw error;
    }
  }
}

/**
 * Classes extending the `Strategy` based class should implement this method,
 * and leverage the {@link workbox-strategies.StrategyHandler}
 * arg to perform all fetching and cache logic, which will ensure all relevant
 * cache, cache options, fetch options and plugins are used (per the current
 * strategy instance).
 *
 * @name _handle
 * @instance
 * @abstract
 * @function
 * @param {Request} request
 * @param {workbox-strategies.StrategyHandler} handler
 * @return {Promise<Response>}
 *
 * @memberof workbox-strategies.Strategy
 */

/***/ }),

/***/ "./node_modules/workbox-strategies/StrategyHandler.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StrategyHandler: () => (/* binding */ StrategyHandler)
/* harmony export */ });
/* harmony import */ var workbox_core_private_assert_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/assert.js");
/* harmony import */ var workbox_core_private_cacheMatchIgnoreParams_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_private/cacheMatchIgnoreParams.js");
/* harmony import */ var workbox_core_private_Deferred_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-core/_private/Deferred.js");
/* harmony import */ var workbox_core_private_executeQuotaErrorCallbacks_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-core/_private/executeQuotaErrorCallbacks.js");
/* harmony import */ var workbox_core_private_getFriendlyURL_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./node_modules/workbox-core/_private/getFriendlyURL.js");
/* harmony import */ var workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./node_modules/workbox-core/_private/logger.js");
/* harmony import */ var workbox_core_private_timeout_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("./node_modules/workbox-core/_private/timeout.js");
/* harmony import */ var workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__("./node_modules/workbox-core/_private/WorkboxError.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__("./node_modules/workbox-strategies/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_8__);
/*
  Copyright 2020 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/









function toRequest(input) {
  return typeof input === 'string' ? new Request(input) : input;
}
/**
 * A class created every time a Strategy instance instance calls
 * {@link workbox-strategies.Strategy~handle} or
 * {@link workbox-strategies.Strategy~handleAll} that wraps all fetch and
 * cache actions around plugin callbacks and keeps track of when the strategy
 * is "done" (i.e. all added `event.waitUntil()` promises have resolved).
 *
 * @memberof workbox-strategies
 */
class StrategyHandler {
  /**
   * Creates a new instance associated with the passed strategy and event
   * that's handling the request.
   *
   * The constructor also initializes the state that will be passed to each of
   * the plugins handling this request.
   *
   * @param {workbox-strategies.Strategy} strategy
   * @param {Object} options
   * @param {Request|string} options.request A request to run this strategy for.
   * @param {ExtendableEvent} options.event The event associated with the
   *     request.
   * @param {URL} [options.url]
   * @param {*} [options.params] The return value from the
   *     {@link workbox-routing~matchCallback} (if applicable).
   */
  constructor(strategy, options) {
    this._cacheKeys = {};
    /**
     * The request the strategy is performing (passed to the strategy's
     * `handle()` or `handleAll()` method).
     * @name request
     * @instance
     * @type {Request}
     * @memberof workbox-strategies.StrategyHandler
     */
    /**
     * The event associated with this request.
     * @name event
     * @instance
     * @type {ExtendableEvent}
     * @memberof workbox-strategies.StrategyHandler
     */
    /**
     * A `URL` instance of `request.url` (if passed to the strategy's
     * `handle()` or `handleAll()` method).
     * Note: the `url` param will be present if the strategy was invoked
     * from a workbox `Route` object.
     * @name url
     * @instance
     * @type {URL|undefined}
     * @memberof workbox-strategies.StrategyHandler
     */
    /**
     * A `param` value (if passed to the strategy's
     * `handle()` or `handleAll()` method).
     * Note: the `param` param will be present if the strategy was invoked
     * from a workbox `Route` object and the
     * {@link workbox-routing~matchCallback} returned
     * a truthy value (it will be that value).
     * @name params
     * @instance
     * @type {*|undefined}
     * @memberof workbox-strategies.StrategyHandler
     */
    if (false) {}
    Object.assign(this, options);
    this.event = options.event;
    this._strategy = strategy;
    this._handlerDeferred = new workbox_core_private_Deferred_js__WEBPACK_IMPORTED_MODULE_2__.Deferred();
    this._extendLifetimePromises = [];
    // Copy the plugins list (since it's mutable on the strategy),
    // so any mutations don't affect this handler instance.
    this._plugins = [...strategy.plugins];
    this._pluginStateMap = new Map();
    for (const plugin of this._plugins) {
      this._pluginStateMap.set(plugin, {});
    }
    this.event.waitUntil(this._handlerDeferred.promise);
  }
  /**
   * Fetches a given request (and invokes any applicable plugin callback
   * methods) using the `fetchOptions` (for non-navigation requests) and
   * `plugins` defined on the `Strategy` object.
   *
   * The following plugin lifecycle methods are invoked when using this method:
   * - `requestWillFetch()`
   * - `fetchDidSucceed()`
   * - `fetchDidFail()`
   *
   * @param {Request|string} input The URL or request to fetch.
   * @return {Promise<Response>}
   */
  async fetch(input) {
    const {
      event
    } = this;
    let request = toRequest(input);
    if (request.mode === 'navigate' && event instanceof FetchEvent && event.preloadResponse) {
      const possiblePreloadResponse = await event.preloadResponse;
      if (possiblePreloadResponse) {
        if (false) {}
        return possiblePreloadResponse;
      }
    }
    // If there is a fetchDidFail plugin, we need to save a clone of the
    // original request before it's either modified by a requestWillFetch
    // plugin or before the original request's body is consumed via fetch().
    const originalRequest = this.hasCallback('fetchDidFail') ? request.clone() : null;
    try {
      for (const cb of this.iterateCallbacks('requestWillFetch')) {
        request = await cb({
          request: request.clone(),
          event
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        throw new workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_7__.WorkboxError('plugin-error-request-will-fetch', {
          thrownErrorMessage: err.message
        });
      }
    }
    // The request can be altered by plugins with `requestWillFetch` making
    // the original request (most likely from a `fetch` event) different
    // from the Request we make. Pass both to `fetchDidFail` to aid debugging.
    const pluginFilteredRequest = request.clone();
    try {
      let fetchResponse;
      // See https://github.com/GoogleChrome/workbox/issues/1796
      fetchResponse = await fetch(request, request.mode === 'navigate' ? undefined : this._strategy.fetchOptions);
      if (false) {}
      for (const callback of this.iterateCallbacks('fetchDidSucceed')) {
        fetchResponse = await callback({
          event,
          request: pluginFilteredRequest,
          response: fetchResponse
        });
      }
      return fetchResponse;
    } catch (error) {
      if (false) {}
      // `originalRequest` will only exist if a `fetchDidFail` callback
      // is being used (see above).
      if (originalRequest) {
        await this.runCallbacks('fetchDidFail', {
          error: error,
          event,
          originalRequest: originalRequest.clone(),
          request: pluginFilteredRequest.clone()
        });
      }
      throw error;
    }
  }
  /**
   * Calls `this.fetch()` and (in the background) runs `this.cachePut()` on
   * the response generated by `this.fetch()`.
   *
   * The call to `this.cachePut()` automatically invokes `this.waitUntil()`,
   * so you do not have to manually call `waitUntil()` on the event.
   *
   * @param {Request|string} input The request or URL to fetch and cache.
   * @return {Promise<Response>}
   */
  async fetchAndCachePut(input) {
    const response = await this.fetch(input);
    const responseClone = response.clone();
    void this.waitUntil(this.cachePut(input, responseClone));
    return response;
  }
  /**
   * Matches a request from the cache (and invokes any applicable plugin
   * callback methods) using the `cacheName`, `matchOptions`, and `plugins`
   * defined on the strategy object.
   *
   * The following plugin lifecycle methods are invoked when using this method:
   * - cacheKeyWillByUsed()
   * - cachedResponseWillByUsed()
   *
   * @param {Request|string} key The Request or URL to use as the cache key.
   * @return {Promise<Response|undefined>} A matching response, if found.
   */
  async cacheMatch(key) {
    const request = toRequest(key);
    let cachedResponse;
    const {
      cacheName,
      matchOptions
    } = this._strategy;
    const effectiveRequest = await this.getCacheKey(request, 'read');
    const multiMatchOptions = Object.assign(Object.assign({}, matchOptions), {
      cacheName
    });
    cachedResponse = await caches.match(effectiveRequest, multiMatchOptions);
    if (false) {}
    for (const callback of this.iterateCallbacks('cachedResponseWillBeUsed')) {
      cachedResponse = (await callback({
        cacheName,
        matchOptions,
        cachedResponse,
        request: effectiveRequest,
        event: this.event
      })) || undefined;
    }
    return cachedResponse;
  }
  /**
   * Puts a request/response pair in the cache (and invokes any applicable
   * plugin callback methods) using the `cacheName` and `plugins` defined on
   * the strategy object.
   *
   * The following plugin lifecycle methods are invoked when using this method:
   * - cacheKeyWillByUsed()
   * - cacheWillUpdate()
   * - cacheDidUpdate()
   *
   * @param {Request|string} key The request or URL to use as the cache key.
   * @param {Response} response The response to cache.
   * @return {Promise<boolean>} `false` if a cacheWillUpdate caused the response
   * not be cached, and `true` otherwise.
   */
  async cachePut(key, response) {
    const request = toRequest(key);
    // Run in the next task to avoid blocking other cache reads.
    // https://github.com/w3c/ServiceWorker/issues/1397
    await (0,workbox_core_private_timeout_js__WEBPACK_IMPORTED_MODULE_6__.timeout)(0);
    const effectiveRequest = await this.getCacheKey(request, 'write');
    if (false) {}
    if (!response) {
      if (false) {}
      throw new workbox_core_private_WorkboxError_js__WEBPACK_IMPORTED_MODULE_7__.WorkboxError('cache-put-with-no-response', {
        url: (0,workbox_core_private_getFriendlyURL_js__WEBPACK_IMPORTED_MODULE_4__.getFriendlyURL)(effectiveRequest.url)
      });
    }
    const responseToCache = await this._ensureResponseSafeToCache(response);
    if (!responseToCache) {
      if (false) {}
      return false;
    }
    const {
      cacheName,
      matchOptions
    } = this._strategy;
    const cache = await self.caches.open(cacheName);
    const hasCacheUpdateCallback = this.hasCallback('cacheDidUpdate');
    const oldResponse = hasCacheUpdateCallback ? await (0,workbox_core_private_cacheMatchIgnoreParams_js__WEBPACK_IMPORTED_MODULE_1__.cacheMatchIgnoreParams)(
    // TODO(philipwalton): the `__WB_REVISION__` param is a precaching
    // feature. Consider into ways to only add this behavior if using
    // precaching.
    cache, effectiveRequest.clone(), ['__WB_REVISION__'], matchOptions) : null;
    if (false) {}
    try {
      await cache.put(effectiveRequest, hasCacheUpdateCallback ? responseToCache.clone() : responseToCache);
    } catch (error) {
      if (error instanceof Error) {
        // See https://developer.mozilla.org/en-US/docs/Web/API/DOMException#exception-QuotaExceededError
        if (error.name === 'QuotaExceededError') {
          await (0,workbox_core_private_executeQuotaErrorCallbacks_js__WEBPACK_IMPORTED_MODULE_3__.executeQuotaErrorCallbacks)();
        }
        throw error;
      }
    }
    for (const callback of this.iterateCallbacks('cacheDidUpdate')) {
      await callback({
        cacheName,
        oldResponse,
        newResponse: responseToCache.clone(),
        request: effectiveRequest,
        event: this.event
      });
    }
    return true;
  }
  /**
   * Checks the list of plugins for the `cacheKeyWillBeUsed` callback, and
   * executes any of those callbacks found in sequence. The final `Request`
   * object returned by the last plugin is treated as the cache key for cache
   * reads and/or writes. If no `cacheKeyWillBeUsed` plugin callbacks have
   * been registered, the passed request is returned unmodified
   *
   * @param {Request} request
   * @param {string} mode
   * @return {Promise<Request>}
   */
  async getCacheKey(request, mode) {
    const key = "".concat(request.url, " | ").concat(mode);
    if (!this._cacheKeys[key]) {
      let effectiveRequest = request;
      for (const callback of this.iterateCallbacks('cacheKeyWillBeUsed')) {
        effectiveRequest = toRequest(await callback({
          mode,
          request: effectiveRequest,
          event: this.event,
          // params has a type any can't change right now.
          params: this.params // eslint-disable-line
        }));
      }
      this._cacheKeys[key] = effectiveRequest;
    }
    return this._cacheKeys[key];
  }
  /**
   * Returns true if the strategy has at least one plugin with the given
   * callback.
   *
   * @param {string} name The name of the callback to check for.
   * @return {boolean}
   */
  hasCallback(name) {
    for (const plugin of this._strategy.plugins) {
      if (name in plugin) {
        return true;
      }
    }
    return false;
  }
  /**
   * Runs all plugin callbacks matching the given name, in order, passing the
   * given param object (merged ith the current plugin state) as the only
   * argument.
   *
   * Note: since this method runs all plugins, it's not suitable for cases
   * where the return value of a callback needs to be applied prior to calling
   * the next callback. See
   * {@link workbox-strategies.StrategyHandler#iterateCallbacks}
   * below for how to handle that case.
   *
   * @param {string} name The name of the callback to run within each plugin.
   * @param {Object} param The object to pass as the first (and only) param
   *     when executing each callback. This object will be merged with the
   *     current plugin state prior to callback execution.
   */
  async runCallbacks(name, param) {
    for (const callback of this.iterateCallbacks(name)) {
      // TODO(philipwalton): not sure why `any` is needed. It seems like
      // this should work with `as WorkboxPluginCallbackParam[C]`.
      await callback(param);
    }
  }
  /**
   * Accepts a callback and returns an iterable of matching plugin callbacks,
   * where each callback is wrapped with the current handler state (i.e. when
   * you call each callback, whatever object parameter you pass it will
   * be merged with the plugin's current state).
   *
   * @param {string} name The name fo the callback to run
   * @return {Array<Function>}
   */
  *iterateCallbacks(name) {
    for (const plugin of this._strategy.plugins) {
      if (typeof plugin[name] === 'function') {
        const state = this._pluginStateMap.get(plugin);
        const statefulCallback = param => {
          const statefulParam = Object.assign(Object.assign({}, param), {
            state
          });
          // TODO(philipwalton): not sure why `any` is needed. It seems like
          // this should work with `as WorkboxPluginCallbackParam[C]`.
          return plugin[name](statefulParam);
        };
        yield statefulCallback;
      }
    }
  }
  /**
   * Adds a promise to the
   * [extend lifetime promises]{@link https://w3c.github.io/ServiceWorker/#extendableevent-extend-lifetime-promises}
   * of the event event associated with the request being handled (usually a
   * `FetchEvent`).
   *
   * Note: you can await
   * {@link workbox-strategies.StrategyHandler~doneWaiting}
   * to know when all added promises have settled.
   *
   * @param {Promise} promise A promise to add to the extend lifetime promises
   *     of the event that triggered the request.
   */
  waitUntil(promise) {
    this._extendLifetimePromises.push(promise);
    return promise;
  }
  /**
   * Returns a promise that resolves once all promises passed to
   * {@link workbox-strategies.StrategyHandler~waitUntil}
   * have settled.
   *
   * Note: any work done after `doneWaiting()` settles should be manually
   * passed to an event's `waitUntil()` method (not this handler's
   * `waitUntil()` method), otherwise the service worker thread my be killed
   * prior to your work completing.
   */
  async doneWaiting() {
    let promise;
    while (promise = this._extendLifetimePromises.shift()) {
      await promise;
    }
  }
  /**
   * Stops running the strategy and immediately resolves any pending
   * `waitUntil()` promises.
   */
  destroy() {
    this._handlerDeferred.resolve(null);
  }
  /**
   * This method will call cacheWillUpdate on the available plugins (or use
   * status === 200) to determine if the Response is safe and valid to cache.
   *
   * @param {Request} options.request
   * @param {Response} options.response
   * @return {Promise<Response|undefined>}
   *
   * @private
   */
  async _ensureResponseSafeToCache(response) {
    let responseToCache = response;
    let pluginsUsed = false;
    for (const callback of this.iterateCallbacks('cacheWillUpdate')) {
      responseToCache = (await callback({
        request: this.request,
        response: responseToCache,
        event: this.event
      })) || undefined;
      pluginsUsed = true;
      if (!responseToCache) {
        break;
      }
    }
    if (!pluginsUsed) {
      if (responseToCache && responseToCache.status !== 200) {
        responseToCache = undefined;
      }
      if (false) {}
    }
    return responseToCache;
  }
}


/***/ }),

/***/ "./node_modules/workbox-strategies/_version.js":
/***/ (() => {



// @ts-ignore
try {
  self['workbox:strategies:6.6.0'] && _();
} catch (e) {}

/***/ }),

/***/ "./node_modules/workbox-strategies/index.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CacheFirst: () => (/* reexport safe */ _CacheFirst_js__WEBPACK_IMPORTED_MODULE_0__.CacheFirst),
/* harmony export */   CacheOnly: () => (/* reexport safe */ _CacheOnly_js__WEBPACK_IMPORTED_MODULE_1__.CacheOnly),
/* harmony export */   NetworkFirst: () => (/* reexport safe */ _NetworkFirst_js__WEBPACK_IMPORTED_MODULE_2__.NetworkFirst),
/* harmony export */   NetworkOnly: () => (/* reexport safe */ _NetworkOnly_js__WEBPACK_IMPORTED_MODULE_3__.NetworkOnly),
/* harmony export */   StaleWhileRevalidate: () => (/* reexport safe */ _StaleWhileRevalidate_js__WEBPACK_IMPORTED_MODULE_4__.StaleWhileRevalidate),
/* harmony export */   Strategy: () => (/* reexport safe */ _Strategy_js__WEBPACK_IMPORTED_MODULE_5__.Strategy),
/* harmony export */   StrategyHandler: () => (/* reexport safe */ _StrategyHandler_js__WEBPACK_IMPORTED_MODULE_6__.StrategyHandler)
/* harmony export */ });
/* harmony import */ var _CacheFirst_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-strategies/CacheFirst.js");
/* harmony import */ var _CacheOnly_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-strategies/CacheOnly.js");
/* harmony import */ var _NetworkFirst_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-strategies/NetworkFirst.js");
/* harmony import */ var _NetworkOnly_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-strategies/NetworkOnly.js");
/* harmony import */ var _StaleWhileRevalidate_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./node_modules/workbox-strategies/StaleWhileRevalidate.js");
/* harmony import */ var _Strategy_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./node_modules/workbox-strategies/Strategy.js");
/* harmony import */ var _StrategyHandler_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("./node_modules/workbox-strategies/StrategyHandler.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__("./node_modules/workbox-strategies/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_7__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/








/**
 * There are common caching strategies that most service workers will need
 * and use. This module provides simple implementations of these strategies.
 *
 * @module workbox-strategies
 */


/***/ }),

/***/ "./node_modules/workbox-strategies/plugins/cacheOkAndOpaquePlugin.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cacheOkAndOpaquePlugin: () => (/* binding */ cacheOkAndOpaquePlugin)
/* harmony export */ });
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-strategies/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_0__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

const cacheOkAndOpaquePlugin = {
  /**
   * Returns a valid response (to allow caching) if the status is 200 (OK) or
   * 0 (opaque).
   *
   * @param {Object} options
   * @param {Response} options.response
   * @return {Response|null}
   *
   * @private
   */
  cacheWillUpdate: async _ref => {
    let {
      response
    } = _ref;
    if (response.status === 200 || response.status === 0) {
      return response;
    }
    return null;
  }
};

/***/ }),

/***/ "./node_modules/workbox-strategies/utils/messages.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   messages: () => (/* binding */ messages)
/* harmony export */ });
/* harmony import */ var workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/_private/logger.js");
/* harmony import */ var workbox_core_private_getFriendlyURL_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-core/_private/getFriendlyURL.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-strategies/_version.js");
/* harmony import */ var _version_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_version_js__WEBPACK_IMPORTED_MODULE_2__);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/



const messages = {
  strategyStart: (strategyName, request) => "Using ".concat(strategyName, " to respond to '").concat((0,workbox_core_private_getFriendlyURL_js__WEBPACK_IMPORTED_MODULE_1__.getFriendlyURL)(request.url), "'"),
  printFinalResponse: response => {
    if (response) {
      workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_0__.logger.groupCollapsed("View the final response here.");
      workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_0__.logger.log(response || '[No response returned]');
      workbox_core_private_logger_js__WEBPACK_IMPORTED_MODULE_0__.logger.groupEnd();
    }
  }
};

/***/ }),

/***/ "./node_modules/idb/build/index.js":
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   deleteDB: () => (/* binding */ deleteDB),
/* harmony export */   openDB: () => (/* binding */ openDB),
/* harmony export */   unwrap: () => (/* reexport safe */ _wrap_idb_value_js__WEBPACK_IMPORTED_MODULE_0__.u),
/* harmony export */   wrap: () => (/* reexport safe */ _wrap_idb_value_js__WEBPACK_IMPORTED_MODULE_0__.w)
/* harmony export */ });
/* harmony import */ var _wrap_idb_value_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/idb/build/wrap-idb-value.js");



/**
 * Open a database.
 *
 * @param name Name of the database.
 * @param version Schema version.
 * @param callbacks Additional callbacks.
 */
function openDB(name, version) {
  let {
    blocked,
    upgrade,
    blocking,
    terminated
  } = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  const request = indexedDB.open(name, version);
  const openPromise = (0,_wrap_idb_value_js__WEBPACK_IMPORTED_MODULE_0__.w)(request);
  if (upgrade) {
    request.addEventListener('upgradeneeded', event => {
      upgrade((0,_wrap_idb_value_js__WEBPACK_IMPORTED_MODULE_0__.w)(request.result), event.oldVersion, event.newVersion, (0,_wrap_idb_value_js__WEBPACK_IMPORTED_MODULE_0__.w)(request.transaction), event);
    });
  }
  if (blocked) {
    request.addEventListener('blocked', event => blocked(
    // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
    event.oldVersion, event.newVersion, event));
  }
  openPromise.then(db => {
    if (terminated) db.addEventListener('close', () => terminated());
    if (blocking) {
      db.addEventListener('versionchange', event => blocking(event.oldVersion, event.newVersion, event));
    }
  }).catch(() => {});
  return openPromise;
}
/**
 * Delete a database.
 *
 * @param name Name of the database.
 */
function deleteDB(name) {
  let {
    blocked
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const request = indexedDB.deleteDatabase(name);
  if (blocked) {
    request.addEventListener('blocked', event => blocked(
    // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
    event.oldVersion, event));
  }
  return (0,_wrap_idb_value_js__WEBPACK_IMPORTED_MODULE_0__.w)(request).then(() => undefined);
}
const readMethods = ['get', 'getKey', 'getAll', 'getAllKeys', 'count'];
const writeMethods = ['put', 'add', 'delete', 'clear'];
const cachedMethods = new Map();
function getMethod(target, prop) {
  if (!(target instanceof IDBDatabase && !(prop in target) && typeof prop === 'string')) {
    return;
  }
  if (cachedMethods.get(prop)) return cachedMethods.get(prop);
  const targetFuncName = prop.replace(/FromIndex$/, '');
  const useIndex = prop !== targetFuncName;
  const isWrite = writeMethods.includes(targetFuncName);
  if (
  // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
  !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) || !(isWrite || readMethods.includes(targetFuncName))) {
    return;
  }
  const method = async function (storeName) {
    // isWrite ? 'readwrite' : undefined gzipps better, but fails in Edge :(
    const tx = this.transaction(storeName, isWrite ? 'readwrite' : 'readonly');
    let target = tx.store;
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    if (useIndex) target = target.index(args.shift());
    // Must reject if op rejects.
    // If it's a write operation, must reject if tx.done rejects.
    // Must reject with op rejection first.
    // Must resolve with op value.
    // Must handle both promises (no unhandled rejections)
    return (await Promise.all([target[targetFuncName](...args), isWrite && tx.done]))[0];
  };
  cachedMethods.set(prop, method);
  return method;
}
(0,_wrap_idb_value_js__WEBPACK_IMPORTED_MODULE_0__.r)(oldTraps => ({
  ...oldTraps,
  get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
  has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop)
}));


/***/ }),

/***/ "./node_modules/idb/build/wrap-idb-value.js":
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   a: () => (/* binding */ reverseTransformCache),
/* harmony export */   i: () => (/* binding */ instanceOfAny),
/* harmony export */   r: () => (/* binding */ replaceTraps),
/* harmony export */   u: () => (/* binding */ unwrap),
/* harmony export */   w: () => (/* binding */ wrap)
/* harmony export */ });
const instanceOfAny = (object, constructors) => constructors.some(c => object instanceof c);
let idbProxyableTypes;
let cursorAdvanceMethods;
// This is a function to prevent it throwing up in node environments.
function getIdbProxyableTypes() {
  return idbProxyableTypes || (idbProxyableTypes = [IDBDatabase, IDBObjectStore, IDBIndex, IDBCursor, IDBTransaction]);
}
// This is a function to prevent it throwing up in node environments.
function getCursorAdvanceMethods() {
  return cursorAdvanceMethods || (cursorAdvanceMethods = [IDBCursor.prototype.advance, IDBCursor.prototype.continue, IDBCursor.prototype.continuePrimaryKey]);
}
const cursorRequestMap = new WeakMap();
const transactionDoneMap = new WeakMap();
const transactionStoreNamesMap = new WeakMap();
const transformCache = new WeakMap();
const reverseTransformCache = new WeakMap();
function promisifyRequest(request) {
  const promise = new Promise((resolve, reject) => {
    const unlisten = () => {
      request.removeEventListener('success', success);
      request.removeEventListener('error', error);
    };
    const success = () => {
      resolve(wrap(request.result));
      unlisten();
    };
    const error = () => {
      reject(request.error);
      unlisten();
    };
    request.addEventListener('success', success);
    request.addEventListener('error', error);
  });
  promise.then(value => {
    // Since cursoring reuses the IDBRequest (*sigh*), we cache it for later retrieval
    // (see wrapFunction).
    if (value instanceof IDBCursor) {
      cursorRequestMap.set(value, request);
    }
    // Catching to avoid "Uncaught Promise exceptions"
  }).catch(() => {});
  // This mapping exists in reverseTransformCache but doesn't doesn't exist in transformCache. This
  // is because we create many promises from a single IDBRequest.
  reverseTransformCache.set(promise, request);
  return promise;
}
function cacheDonePromiseForTransaction(tx) {
  // Early bail if we've already created a done promise for this transaction.
  if (transactionDoneMap.has(tx)) return;
  const done = new Promise((resolve, reject) => {
    const unlisten = () => {
      tx.removeEventListener('complete', complete);
      tx.removeEventListener('error', error);
      tx.removeEventListener('abort', error);
    };
    const complete = () => {
      resolve();
      unlisten();
    };
    const error = () => {
      reject(tx.error || new DOMException('AbortError', 'AbortError'));
      unlisten();
    };
    tx.addEventListener('complete', complete);
    tx.addEventListener('error', error);
    tx.addEventListener('abort', error);
  });
  // Cache it for later retrieval.
  transactionDoneMap.set(tx, done);
}
let idbProxyTraps = {
  get(target, prop, receiver) {
    if (target instanceof IDBTransaction) {
      // Special handling for transaction.done.
      if (prop === 'done') return transactionDoneMap.get(target);
      // Polyfill for objectStoreNames because of Edge.
      if (prop === 'objectStoreNames') {
        return target.objectStoreNames || transactionStoreNamesMap.get(target);
      }
      // Make tx.store return the only store in the transaction, or undefined if there are many.
      if (prop === 'store') {
        return receiver.objectStoreNames[1] ? undefined : receiver.objectStore(receiver.objectStoreNames[0]);
      }
    }
    // Else transform whatever we get back.
    return wrap(target[prop]);
  },
  set(target, prop, value) {
    target[prop] = value;
    return true;
  },
  has(target, prop) {
    if (target instanceof IDBTransaction && (prop === 'done' || prop === 'store')) {
      return true;
    }
    return prop in target;
  }
};
function replaceTraps(callback) {
  idbProxyTraps = callback(idbProxyTraps);
}
function wrapFunction(func) {
  // Due to expected object equality (which is enforced by the caching in `wrap`), we
  // only create one new func per func.
  // Edge doesn't support objectStoreNames (booo), so we polyfill it here.
  if (func === IDBDatabase.prototype.transaction && !('objectStoreNames' in IDBTransaction.prototype)) {
    return function (storeNames) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      const tx = func.call(unwrap(this), storeNames, ...args);
      transactionStoreNamesMap.set(tx, storeNames.sort ? storeNames.sort() : [storeNames]);
      return wrap(tx);
    };
  }
  // Cursor methods are special, as the behaviour is a little more different to standard IDB. In
  // IDB, you advance the cursor and wait for a new 'success' on the IDBRequest that gave you the
  // cursor. It's kinda like a promise that can resolve with many values. That doesn't make sense
  // with real promises, so each advance methods returns a new promise for the cursor object, or
  // undefined if the end of the cursor has been reached.
  if (getCursorAdvanceMethods().includes(func)) {
    return function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
      // the original object.
      func.apply(unwrap(this), args);
      return wrap(cursorRequestMap.get(this));
    };
  }
  return function () {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }
    // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
    // the original object.
    return wrap(func.apply(unwrap(this), args));
  };
}
function transformCachableValue(value) {
  if (typeof value === 'function') return wrapFunction(value);
  // This doesn't return, it just creates a 'done' promise for the transaction,
  // which is later returned for transaction.done (see idbObjectHandler).
  if (value instanceof IDBTransaction) cacheDonePromiseForTransaction(value);
  if (instanceOfAny(value, getIdbProxyableTypes())) return new Proxy(value, idbProxyTraps);
  // Return the same value back if we're not going to transform it.
  return value;
}
function wrap(value) {
  // We sometimes generate multiple promises from a single IDBRequest (eg when cursoring), because
  // IDB is weird and a single IDBRequest can yield many responses, so these can't be cached.
  if (value instanceof IDBRequest) return promisifyRequest(value);
  // If we've already transformed this value before, reuse the transformed value.
  // This is faster, but it also provides object equality.
  if (transformCache.has(value)) return transformCache.get(value);
  const newValue = transformCachableValue(value);
  // Not all types are transformed.
  // These may be primitive types, so they can't be WeakMap keys.
  if (newValue !== value) {
    transformCache.set(value, newValue);
    reverseTransformCache.set(newValue, value);
  }
  return newValue;
}
const unwrap = value => reverseTransformCache.get(value);


/***/ }),

/***/ "./node_modules/workbox-core/index.mjs":
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _private: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__._private),
/* harmony export */   cacheNames: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.cacheNames),
/* harmony export */   clientsClaim: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.clientsClaim),
/* harmony export */   copyResponse: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.copyResponse),
/* harmony export */   registerQuotaErrorCallback: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.registerQuotaErrorCallback),
/* harmony export */   setCacheNameDetails: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.setCacheNameDetails),
/* harmony export */   skipWaiting: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.skipWaiting)
/* harmony export */ });
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/index.js");


/***/ }),

/***/ "./node_modules/workbox-expiration/index.mjs":
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CacheExpiration: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.CacheExpiration),
/* harmony export */   ExpirationPlugin: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.ExpirationPlugin)
/* harmony export */ });
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-expiration/index.js");


/***/ }),

/***/ "./node_modules/workbox-precaching/index.mjs":
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PrecacheController: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.PrecacheController),
/* harmony export */   PrecacheFallbackPlugin: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.PrecacheFallbackPlugin),
/* harmony export */   PrecacheRoute: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.PrecacheRoute),
/* harmony export */   PrecacheStrategy: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.PrecacheStrategy),
/* harmony export */   addPlugins: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.addPlugins),
/* harmony export */   addRoute: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.addRoute),
/* harmony export */   cleanupOutdatedCaches: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.cleanupOutdatedCaches),
/* harmony export */   createHandlerBoundToURL: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.createHandlerBoundToURL),
/* harmony export */   getCacheKeyForURL: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.getCacheKeyForURL),
/* harmony export */   matchPrecache: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.matchPrecache),
/* harmony export */   precache: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.precache),
/* harmony export */   precacheAndRoute: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.precacheAndRoute)
/* harmony export */ });
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-precaching/index.js");


/***/ }),

/***/ "./node_modules/workbox-routing/index.mjs":
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NavigationRoute: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.NavigationRoute),
/* harmony export */   RegExpRoute: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.RegExpRoute),
/* harmony export */   Route: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.Route),
/* harmony export */   Router: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.Router),
/* harmony export */   registerRoute: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.registerRoute),
/* harmony export */   setCatchHandler: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.setCatchHandler),
/* harmony export */   setDefaultHandler: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.setDefaultHandler)
/* harmony export */ });
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-routing/index.js");


/***/ }),

/***/ "./node_modules/workbox-strategies/index.mjs":
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CacheFirst: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.CacheFirst),
/* harmony export */   CacheOnly: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.CacheOnly),
/* harmony export */   NetworkFirst: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.NetworkFirst),
/* harmony export */   NetworkOnly: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.NetworkOnly),
/* harmony export */   StaleWhileRevalidate: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.StaleWhileRevalidate),
/* harmony export */   Strategy: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.Strategy),
/* harmony export */   StrategyHandler: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.StrategyHandler)
/* harmony export */ });
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-strategies/index.js");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var workbox_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/workbox-core/index.mjs");
/* harmony import */ var workbox_expiration__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/workbox-expiration/index.mjs");
/* harmony import */ var workbox_precaching__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./node_modules/workbox-precaching/index.mjs");
/* harmony import */ var workbox_routing__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./node_modules/workbox-routing/index.mjs");
/* harmony import */ var workbox_strategies__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./node_modules/workbox-strategies/index.mjs");
/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */
// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.
// You can also remove this file if you'd prefer not to use a
// service worker, and the Workbox build step will be skipped.





(0,workbox_core__WEBPACK_IMPORTED_MODULE_0__.clientsClaim)();
// Precache all of the assets generated by your build process.
// Their URLs are injected into the manifest variable below.
// This variable must be present somewhere in your service worker file,
// even if you decide not to use precaching. See https://cra.link/PWA
(0,workbox_precaching__WEBPACK_IMPORTED_MODULE_2__.precacheAndRoute)([{'revision':'5a7d1135f679c6f936d331ebe54fc87e','url':'/index.html'},{'revision':'92747f942bf866c09ffaa8f1ed359ff2','url':'/index.js'}]);
// Set up App Shell-style routing, so that all navigation requests
// are fulfilled with your index.html shell. Learn more at
// https://developers.google.com/web/fundamentals/architecture/app-shell
var fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
(0,workbox_routing__WEBPACK_IMPORTED_MODULE_3__.registerRoute)(
// Return false to exempt requests from being fulfilled by index.html.
function (_a) {
  var request = _a.request,
    url = _a.url;
  // If this isn't a navigation, skip.
  if (request.mode !== 'navigate') {
    return false;
  }
  // If this is a URL that starts with /_, skip.
  if (url.pathname.startsWith('/_')) {
    return false;
  }
  // If this looks like a URL for a resource, because it contains
  // a file extension, skip.
  if (url.pathname.match(fileExtensionRegexp)) {
    return false;
  }
  // Return true to signal that we want to use the handler.
  return true;
}, (0,workbox_precaching__WEBPACK_IMPORTED_MODULE_2__.createHandlerBoundToURL)("" + '/index.html'));
// An example runtime caching route for requests that aren't handled by the
// precache, in this case same-origin .png requests like those from in public/
(0,workbox_routing__WEBPACK_IMPORTED_MODULE_3__.registerRoute)(
// Add in any other file extensions or routing criteria as needed.
function (_a) {
  var url = _a.url;
  return url.origin === self.location.origin && url.pathname.endsWith('.png');
},
// Customize this strategy as needed, e.g., by changing to CacheFirst.
new workbox_strategies__WEBPACK_IMPORTED_MODULE_4__.StaleWhileRevalidate({
  cacheName: 'images',
  plugins: [
  // Ensure that once this runtime cache reaches a maximum size the
  // least-recently used images are removed.
  new workbox_expiration__WEBPACK_IMPORTED_MODULE_1__.ExpirationPlugin({
    maxEntries: 50
  })]
}));
// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
// Any other custom service worker logic can go here.
/******/ })()
;
//# sourceMappingURL=service-worker.js.map