/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import EventEmitter from 'events';

import {LighthouseError} from '../lib/lh-error.js';

// Controls how long to wait for a response after sending a DevTools protocol command.
const DEFAULT_PROTOCOL_TIMEOUT = 30000;

/** @typedef {LH.Protocol.StrictEventEmitterClass<LH.CrdpEvents>} CrdpEventMessageEmitter */
const CrdpEventEmitter = /** @type {CrdpEventMessageEmitter} */ (EventEmitter);

/** @implements {LH.Gatherer.ProtocolSession} */
class ProtocolSession extends CrdpEventEmitter {
  /**
   * @param {LH.Puppeteer.CDPSession} cdpSession
   */
  constructor(cdpSession) {
    super();

    this._cdpSession = cdpSession;
    /** @type {LH.Crdp.Target.TargetInfo|undefined} */
    this._targetInfo = undefined;
    /** @type {number|undefined} */
    this._nextProtocolTimeout = undefined;

    this._handleProtocolEvent = this._handleProtocolEvent.bind(this);
    // @ts-expect-error Puppeteer expects the handler params to be type `unknown`
    this._cdpSession.on('*', this._handleProtocolEvent);
  }

  id() {
    return this._cdpSession.id();
  }

  /**
   * Re-emit protocol events from the underlying CDPSession.
   * @template {keyof LH.CrdpEvents} E
   * @param {E} method
   * @param {LH.CrdpEvents[E]} params
   */
  _handleProtocolEvent(method, ...params) {
    this.emit(method, ...params);
  }

  /** @param {LH.Crdp.Target.TargetInfo} targetInfo */
  setTargetInfo(targetInfo) {
    this._targetInfo = targetInfo;
  }

  /**
   * @return {boolean}
   */
  hasNextProtocolTimeout() {
    return this._nextProtocolTimeout !== undefined;
  }

  /**
   * @return {number}
   */
  getNextProtocolTimeout() {
    return this._nextProtocolTimeout || DEFAULT_PROTOCOL_TIMEOUT;
  }

  /**
   * @param {number} ms
   */
  setNextProtocolTimeout(ms) {
    this._nextProtocolTimeout = ms;
  }

  /**
   * @template {keyof LH.CrdpCommands} C
   * @param {C} method
   * @param {LH.CrdpCommands[C]['paramsType']} params
   * @return {Promise<LH.CrdpCommands[C]['returnType']>}
   */
  sendCommand(method, ...params) {
    const timeoutMs = this.getNextProtocolTimeout();
    this._nextProtocolTimeout = undefined;

    /** @type {NodeJS.Timer|undefined} */
    let timeout;
    const timeoutPromise = new Promise((resolve, reject) => {
      if (timeoutMs === Infinity) return;

      // eslint-disable-next-line max-len
      timeout = setTimeout(reject, timeoutMs, new LighthouseError(LighthouseError.errors.PROTOCOL_TIMEOUT, {
        protocolMethod: method,
      }));
    });

    const resultPromise = this._cdpSession.send(method, ...params);
    const resultWithTimeoutPromise = Promise.race([resultPromise, timeoutPromise]);

    return resultWithTimeoutPromise.finally(() => {
      if (timeout) clearTimeout(timeout);
    });
  }

  /**
   * Disposes of a session so that it can no longer talk to Chrome.
   * @return {Promise<void>}
   */
  async dispose() {
    // @ts-expect-error Puppeteer expects the handler params to be type `unknown`
    this._cdpSession.off('*', this._handleProtocolEvent);
    await this._cdpSession.detach();
  }
}

export {ProtocolSession};
