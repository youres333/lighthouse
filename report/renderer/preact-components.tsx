/**
 * @license Copyright 2023 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import {FunctionComponent, render} from 'preact';

import {type DOM, type ComponentName} from './dom.js';
import styles from '../assets/styles.js';

/* eslint-disable max-len */

const WarningsToplevel: FunctionComponent = () => {
  return <div class="lh-warnings lh-warnings--toplevel">
    <p class="lh-warnings__msg"></p>
    <ul></ul>
  </div>;
};

const Scorescale: FunctionComponent = () => {
  return <div class="lh-scorescale">
    <span class="lh-scorescale-range lh-scorescale-range--fail">0&ndash;49</span>
    <span class="lh-scorescale-range lh-scorescale-range--average">50&ndash;89</span>
    <span class="lh-scorescale-range lh-scorescale-range--pass">90&ndash;100</span>
  </div>;
};

const Chevron: FunctionComponent = () => {
  return <svg class="lh-chevron" viewBox="0 0 100 100">
    <g class="lh-chevron__lines">
      <path class="lh-chevron__line lh-chevron__line-left" d="M10 50h40"></path>
      <path class="lh-chevron__line lh-chevron__line-right" d="M90 50H50"></path>
    </g>
  </svg>;
};

const CategoryHeader: FunctionComponent = () => {
  return <div class="lh-category-header">
    <div class="lh-score__gauge" role="heading" aria-level="2"></div>
    <div class="lh-category-header__description"></div>
  </div>;
};

const Clump: FunctionComponent = () => {
  return <div class="lh-audit-group">
    <details class="lh-clump">
      <summary>
        <div class="lh-audit-group__summary">
          <div class="lh-audit-group__header">
            <span class="lh-audit-group__title"></span>
            <span class="lh-audit-group__itemcount"></span>
          </div>
          <div class="lh-clump-toggle">
            <span class="lh-clump-toggletext--show"></span>
            <span class="lh-clump-toggletext--hide"></span>
          </div>
        </div>
      </summary>
    </details>
  </div>;
};

const Audit: FunctionComponent = () => {
  return <div class="lh-audit">
    <details class="lh-expandable-details">
      <summary>
        <div class="lh-audit__header lh-expandable-details__summary">
          <span class="lh-audit__score-icon"></span>
          <span class="lh-audit__title-and-text">
            <span class="lh-audit__title"></span>
            <span class="lh-audit__display-text"></span>
          </span>
          <div class="lh-chevron-container"></div>
        </div>
      </summary>
      <div class="lh-audit__description"></div>
      <div class="lh-audit__stackpacks"></div>
    </details>
  </div>;
};

const Metric: FunctionComponent = () => {
  return <div class="lh-metric">
    <div class="lh-metric__innerwrap">
      <div class="lh-metric__icon"></div>
      <span class="lh-metric__title"></span>
      <div class="lh-metric__value"></div>
      <div class="lh-metric__description"></div>
    </div>
  </div>;
};

const ScoresWrapper: FunctionComponent = () => {
  return <>
    <style jsx>{`
      .lh-scores-container {
        display: flex;
        flex-direction: column;
        padding: var(--default-padding) 0;
        position: relative;
        width: 100%;
      }

      .lh-sticky-header {
        --gauge-circle-size: var(--gauge-circle-size-sm);
        --plugin-badge-size: 16px;
        --plugin-icon-size: 75%;
        --gauge-wrapper-width: 60px;
        --gauge-percentage-font-size: 13px;
        position: fixed;
        left: 0;
        right: 0;
        top: var(--topbar-height);
        font-weight: 500;
        display: none;
        justify-content: center;
        background-color: var(--sticky-header-background-color);
        border-bottom: 1px solid var(--color-gray-200);
        padding-top: var(--score-container-padding);
        padding-bottom: 4px;
        z-index: 1;
        pointer-events: none;
      }

      .lh-devtools .lh-sticky-header {
        /* The report within DevTools is placed in a container with overflow, which changes the placement of this header unless we change \`position\` to \`sticky.\` */
        position: sticky;
      }

      .lh-sticky-header--visible {
        display: grid;
        grid-auto-flow: column;
        pointer-events: auto;
      }

      /* Disable the gauge arc animation for the sticky header, so toggling display: none
         does not play the animation. */
      .lh-sticky-header .lh-gauge-arc {
        animation: none;
      }

      .lh-sticky-header .lh-gauge__label,
      .lh-sticky-header .lh-fraction__label {
        display: none;
      }

      .lh-highlighter {
        width: var(--gauge-wrapper-width);
        height: 1px;
        background-color: var(--highlighter-background-color);
        /* Position at bottom of first gauge in sticky header. */
        position: absolute;
        grid-column: 1;
        bottom: -1px;
        left: 0px;
        right: 0px;
      }
    `}</style>
    <div class="lh-scores-wrapper">
      <div class="lh-scores-container">
        <div class="lh-pyro">
          <div class="lh-pyro-before"></div>
          <div class="lh-pyro-after"></div>
        </div>
      </div>
    </div>
  </>;
};

const Topbar: FunctionComponent = () => {
  return <>
    <style jsx>{`
      .lh-topbar {
        position: sticky;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        height: var(--topbar-height);
        padding: var(--topbar-padding);
        font-size: var(--report-font-size-secondary);
        background-color: var(--topbar-background-color);
        border-bottom: 1px solid var(--color-gray-200);
      }

      .lh-topbar__logo {
        width: var(--topbar-logo-size);
        height: var(--topbar-logo-size);
        user-select: none;
        flex: none;
      }

      .lh-topbar__url {
        margin: var(--topbar-padding);
        text-decoration: none;
        color: var(--report-text-color);
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }

      .lh-tools {
        display: flex;
        align-items: center;
        margin-left: auto;
        will-change: transform;
        min-width: var(--report-icon-size);
      }
      .lh-tools__button {
        width: var(--report-icon-size);
        min-width: 24px;
        height: var(--report-icon-size);
        cursor: pointer;
        margin-right: 5px;
        /* This is actually a button element, but we want to style it like a transparent div. */
        display: flex;
        background: none;
        color: inherit;
        border: none;
        padding: 0;
        font: inherit;
        outline: inherit;
      }
      .lh-tools__button svg {
        fill: var(--tools-icon-color);
      }
      .lh-dark .lh-tools__button svg {
        filter: invert(1);
      }
      .lh-tools__button.lh-active + .lh-tools__dropdown {
        opacity: 1;
        clip: rect(-1px, 194px, 270px, -3px);
        visibility: visible;
      }
      .lh-tools__dropdown {
        position: absolute;
        background-color: var(--report-background-color);
        border: 1px solid var(--report-border-color);
        border-radius: 3px;
        padding: calc(var(--default-padding) / 2) 0;
        cursor: pointer;
        top: 36px;
        right: 0;
        box-shadow: 1px 1px 3px #ccc;
        min-width: 125px;
        clip: rect(0, 164px, 0, 0);
        visibility: hidden;
        opacity: 0;
        transition: all 200ms cubic-bezier(0,0,0.2,1);
      }
      .lh-tools__dropdown a {
        color: currentColor;
        text-decoration: none;
        white-space: nowrap;
        padding: 0 6px;
        line-height: 2;
      }
      .lh-tools__dropdown a:hover,
      .lh-tools__dropdown a:focus {
        background-color: var(--color-gray-200);
        outline: none;
      }
      /* save-gist option hidden in report. */
      .lh-tools__dropdown a[data-action='save-gist'] {
        display: none;
      }

      .lh-locale-selector {
        width: 100%;
        color: var(--report-text-color);
        background-color: var(--locale-selector-background-color);
        padding: 2px;
      }
      .lh-tools-locale {
        display: flex;
        align-items: center;
        flex-direction: row-reverse;
      }
      .lh-tools-locale__selector-wrapper {
        transition: opacity 0.15s;
        opacity: 0;
        max-width: 200px;
      }
      .lh-button.lh-tool-locale__button {
        height: var(--topbar-height);
        color: var(--tools-icon-color);
        padding: calc(var(--default-padding) / 2);
      }
      .lh-tool-locale__button.lh-active + .lh-tools-locale__selector-wrapper {
        opacity: 1;
        clip: rect(-1px, 194px, 242px, -3px);
        visibility: visible;
        margin: 0 4px;
      }

      @media screen and (max-width: 964px) {
        .lh-tools__dropdown {
          right: 0;
          left: initial;
        }
      }
      @media print {
        .lh-topbar {
          position: static;
          margin-left: 0;
        }

        .lh-tools__dropdown {
          display: none;
        }
      }
    `}</style>

    <div class="lh-topbar">
      <svg role="img" class="lh-topbar__logo" title="Lighthouse logo" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <path d="m14 7 10-7 10 7v10h5v7h-5l5 24H9l5-24H9v-7h5V7Z" fill="#F63"/>
        <path d="M31.561 24H14l-1.689 8.105L31.561 24ZM18.983 48H9l1.022-4.907L35.723 32.27l1.663 7.98L18.983 48Z" fill="#FFA385"/>
        <path fill="#FF3" d="M20.5 10h7v7h-7z"/>
      </svg>

      <a href="" class="lh-topbar__url" target="_blank" rel="noopener"></a>

      <div class="lh-tools">
        <div class="lh-tools-locale lh-hidden">
          <button id="lh-button__swap-locales" class="lh-button lh-tool-locale__button" title="Show Language Picker" aria-label="Toggle language picker" aria-haspopup="menu" aria-expanded="false" aria-controls="lh-tools-locale__selector-wrapper">
            <svg width="20px" height="20px" viewBox="0 0 24 24" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>
          </button>
          <div id="lh-tools-locale__selector-wrapper" class="lh-tools-locale__selector-wrapper" role="menu" aria-labelledby="lh-button__swap-locales" aria-hidden="true">
          </div>
        </div>

        <button id="lh-tools-button" class="lh-tools__button" title="Tools menu" aria-label="Toggle report tools menu" aria-haspopup="menu" aria-expanded="false" aria-controls="lh-tools-dropdown">
          <svg width="100%" height="100%" viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none"/>
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </button>
        <div id="lh-tools-dropdown" role="menu" class="lh-tools__dropdown" aria-labelledby="lh-tools-button">
          <a role="menuitem" tabIndex={-1} href="#" class="lh-report-icon lh-report-icon--print" data-i18n="dropdownPrintSummary" data-action="print-summary"></a>
          <a role="menuitem" tabIndex={-1} href="#" class="lh-report-icon lh-report-icon--print" data-i18n="dropdownPrintExpanded" data-action="print-expanded"></a>
          <a role="menuitem" tabIndex={-1} href="#" class="lh-report-icon lh-report-icon--copy" data-i18n="dropdownCopyJSON" data-action="copy"></a>
          <a role="menuitem" tabIndex={-1} href="#" class="lh-report-icon lh-report-icon--download lh-hidden" data-i18n="dropdownSaveHTML" data-action="save-html"></a>
          <a role="menuitem" tabIndex={-1} href="#" class="lh-report-icon lh-report-icon--download" data-i18n="dropdownSaveJSON" data-action="save-json"></a>
          <a role="menuitem" tabIndex={-1} href="#" class="lh-report-icon lh-report-icon--open" data-i18n="dropdownViewer" data-action="open-viewer"></a>
          <a role="menuitem" tabIndex={-1} href="#" class="lh-report-icon lh-report-icon--open" data-i18n="dropdownSaveGist" data-action="save-gist"></a>
          <a role="menuitem" tabIndex={-1} href="#" class="lh-report-icon lh-report-icon--open lh-hidden" data-i18n="dropdownViewUnthrottledTrace" data-action="view-unthrottled-trace"></a>
          <a role="menuitem" tabIndex={-1} href="#" class="lh-report-icon lh-report-icon--dark" data-i18n="dropdownDarkTheme" data-action="toggle-dark"></a>
        </div>
      </div>
    </div>
  </>;
};

const Heading: FunctionComponent = () => {
  return <>
    <style jsx>{`
      /* CSS Fireworks. Originally by Eddie Lin
       * https://codepen.io/paulirish/pen/yEVMbP
       */
      .lh-pyro {
        display: none;
        z-index: 1;
        pointer-events: none;
      }
      .lh-score100 .lh-pyro {
        display: block;
      }
      .lh-score100 .lh-lighthouse stop:first-child {
        stop-color: hsla(200, 12%, 95%, 0);
      }
      .lh-score100 .lh-lighthouse stop:last-child {
        stop-color: hsla(65, 81%, 76%, 1);
      }

      .lh-pyro > .lh-pyro-before, .lh-pyro > .lh-pyro-after {
        position: absolute;
        width: 5px;
        height: 5px;
        border-radius: 2.5px;
        box-shadow: 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff;
        animation: 1s bang ease-out infinite backwards,  1s gravity ease-in infinite backwards,  5s position linear infinite backwards;
        animation-delay: 1s, 1s, 1s;
      }

      .lh-pyro > .lh-pyro-after {
        animation-delay: 2.25s, 2.25s, 2.25s;
        animation-duration: 1.25s, 1.25s, 6.25s;
      }

      @keyframes bang {
        to {
          opacity: 1;
          box-shadow: -70px -115.67px #47ebbc, -28px -99.67px #eb47a4, 58px -31.67px #7eeb47, 13px -141.67px #eb47c5, -19px 6.33px #7347eb, -2px -74.67px #ebd247, 24px -151.67px #eb47e0, 57px -138.67px #b4eb47, -51px -104.67px #479eeb, 62px 8.33px #ebcf47, -93px 0.33px #d547eb, -16px -118.67px #47bfeb, 53px -84.67px #47eb83, 66px -57.67px #eb47bf, -93px -65.67px #91eb47, 30px -13.67px #86eb47, -2px -59.67px #83eb47, -44px 1.33px #eb47eb, 61px -58.67px #47eb73, 5px -22.67px #47e8eb, -66px -28.67px #ebe247, 42px -123.67px #eb5547, -75px 26.33px #7beb47, 15px -52.67px #a147eb, 36px -51.67px #eb8347, -38px -12.67px #eb5547, -46px -59.67px #47eb81, 78px -114.67px #eb47ba, 15px -156.67px #eb47bf, -36px 1.33px #eb4783, -72px -86.67px #eba147, 31px -46.67px #ebe247, -68px 29.33px #47e2eb, -55px 19.33px #ebe047, -56px 27.33px #4776eb, -13px -91.67px #eb5547, -47px -138.67px #47ebc7, -18px -96.67px #eb47ac, 11px -88.67px #4783eb, -67px -28.67px #47baeb, 53px 10.33px #ba47eb, 11px 19.33px #5247eb, -5px -11.67px #eb4791, -68px -4.67px #47eba7, 95px -37.67px #eb478b, -67px -162.67px #eb5d47, -54px -120.67px #eb6847, 49px -12.67px #ebe047, 88px 8.33px #47ebda, 97px 33.33px #eb8147, 6px -71.67px #ebbc47;
        }
      }
      @keyframes gravity {
        from {
          opacity: 1;
        }
        to {
          transform: translateY(80px);
          opacity: 0;
        }
      }
      @keyframes position {
        0%, 19.9% {
          margin-top: 4%;
          margin-left: 47%;
        }
        20%, 39.9% {
          margin-top: 7%;
          margin-left: 30%;
        }
        40%, 59.9% {
          margin-top: 6%;
          margin-left: 70%;
        }
        60%, 79.9% {
          margin-top: 3%;
          margin-left: 20%;
        }
        80%, 99.9% {
          margin-top: 3%;
          margin-left: 80%;
        }
      }
    `}</style>

    <div class="lh-header-container">
      <div class="lh-scores-wrapper-placeholder"></div>
    </div>
  </>;
};


const Footer: FunctionComponent = () => {
  return <>
    <style jsx>{`
      .lh-footer {
        padding: var(--footer-padding-vertical) calc(var(--default-padding) * 2);
        max-width: var(--report-content-max-width);
        margin: 0 auto;
      }
      .lh-footer .lh-generated {
        text-align: center;
      }
    `}</style>
    <footer class="lh-footer">
      <ul class="lh-meta__items">
      </ul>

      <div class="lh-generated">
      Generated by <b>Lighthouse</b> <span class="lh-footer__version"></span> |
        <a href="https://github.com/GoogleChrome/Lighthouse/issues" target="_blank" rel="noopener" class="lh-footer__version_issue">File an issue</a>
      </div>
    </footer>
  </>;
};

const Gauge: FunctionComponent = () => {
  return <a class="lh-gauge__wrapper">
    <div class="lh-gauge__svg-wrapper">
      <svg viewBox="0 0 120 120" class="lh-gauge">
        <circle class="lh-gauge-base" r="56" cx="60" cy="60" stroke-width="8"></circle>
        <circle class="lh-gauge-arc" r="56" cx="60" cy="60" stroke-width="8"></circle>
      </svg>
    </div>
    <div class="lh-gauge__percentage"></div>
    <div class="lh-gauge__label"></div>
  </a>;
};

const ExplodeyGauge: FunctionComponent = () => {
  return <div class="lh-exp-gauge-component">
    <div class="lh-exp-gauge__wrapper" target="_blank">
      <div class="lh-exp-gauge__svg-wrapper">
        <svg class="lh-exp-gauge">
          <g class="lh-exp-gauge__inner">
            <circle class="lh-exp-gauge__bg" />
            <circle class="lh-exp-gauge__base lh-exp-gauge--faded" />
            <circle class="lh-exp-gauge__arc" />
            <text class="lh-exp-gauge__percentage"></text>
          </g>
          <g class="lh-exp-gauge__outer">
            <circle class="lh-cover" />
          </g>
          <text class="lh-exp-gauge__label" text-anchor="middle" x="0" y="60"></text>
        </svg>
      </div>
    </div>
  </div>;
};

const Fraction: FunctionComponent = () => {
  return <a class="lh-fraction__wrapper">
    <div class="lh-fraction__content-wrapper">
      <div class="lh-fraction__content">
        <div class="lh-fraction__background"></div>
      </div>
    </div>
    <div class="lh-fraction__label"></div>
  </a>;
};


const GaugePwa: FunctionComponent = () => {
  return <>
    <style jsx>{`
      .lh-gauge--pwa .lh-gauge--pwa__component {
        display: none;
      }
      .lh-gauge--pwa__wrapper:not(.lh-badged--all) .lh-gauge--pwa__logo > path {
        /* Gray logo unless everything is passing. */
        fill: #B0B0B0;
      }

      .lh-gauge--pwa__disc {
        fill: var(--color-gray-200);
      }

      .lh-gauge--pwa__logo--primary-color {
        fill: #304FFE;
      }

      .lh-gauge--pwa__logo--secondary-color {
        fill: #3D3D3D;
      }
      .lh-dark .lh-gauge--pwa__logo--secondary-color {
        fill: #D8B6B6;
      }

      /* No passing groups. */
      .lh-gauge--pwa__wrapper:not([class*='lh-badged--']) .lh-gauge--pwa__na-line {
        display: inline;
      }
      /* Just optimized. Same n/a line as no passing groups. */
      .lh-gauge--pwa__wrapper.lh-badged--pwa-optimized:not(.lh-badged--pwa-installable) .lh-gauge--pwa__na-line {
        display: inline;
      }

      /* Just installable. */
      .lh-gauge--pwa__wrapper.lh-badged--pwa-installable .lh-gauge--pwa__installable-badge {
        display: inline;
      }

      /* All passing groups. */
      .lh-gauge--pwa__wrapper.lh-badged--all .lh-gauge--pwa__check-circle {
        display: inline;
      }
    `}</style>

    <a class="lh-gauge__wrapper lh-gauge--pwa__wrapper">
      <svg viewBox="0 0 60 60" class="lh-gauge lh-gauge--pwa">
        <defs>
          <linearGradient id="lh-gauge--pwa__check-circle__gradient" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop stop-color="#00C852" offset="0%"></stop>
            <stop stop-color="#009688" offset="100%"></stop>
          </linearGradient>
          <linearGradient id="lh-gauge--pwa__installable__shadow-gradient" x1="76.056%" x2="24.111%" y1="82.995%" y2="24.735%">
            <stop stop-color="#A5D6A7" offset="0%"></stop>
            <stop stop-color="#80CBC4" offset="100%"></stop>
          </linearGradient>

          <g id="lh-gauge--pwa__installable-badge">
            <circle fill="#FFFFFF" cx="10" cy="10" r="10"></circle>
            <path fill="#009688" d="M10 4.167A5.835 5.835 0 0 0 4.167 10 5.835 5.835 0 0 0 10 15.833 5.835 5.835 0 0 0 15.833 10 5.835 5.835 0 0 0 10 4.167zm2.917 6.416h-2.334v2.334H9.417v-2.334H7.083V9.417h2.334V7.083h1.166v2.334h2.334v1.166z"/>
          </g>
        </defs>

        <g stroke="none" fill-rule="nonzero">
          <circle class="lh-gauge--pwa__disc" cx="30" cy="30" r="30"></circle>
          <g class="lh-gauge--pwa__logo">
            <path class="lh-gauge--pwa__logo--secondary-color" d="M35.66 19.39l.7-1.75h2L37.4 15 38.6 12l3.4 9h-2.51l-.58-1.61z"/>
            <path class="lh-gauge--pwa__logo--primary-color" d="M33.52 21l3.65-9h-2.42l-2.5 5.82L30.5 12h-1.86l-1.9 5.82-1.35-2.65-1.21 3.72L25.4 21h2.38l1.72-5.2 1.64 5.2z"/>
            <path class="lh-gauge--pwa__logo--secondary-color" fill-rule="nonzero" d="M20.3 17.91h1.48c.45 0 .85-.05 1.2-.15l.39-1.18 1.07-3.3a2.64 2.64 0 0 0-.28-.37c-.55-.6-1.36-.91-2.42-.91H18v9h2.3V17.9zm1.96-3.84c.22.22.33.5.33.87 0 .36-.1.65-.29.87-.2.23-.59.35-1.15.35h-.86v-2.41h.87c.52 0 .89.1 1.1.32z"/>
          </g>

          <rect class="lh-gauge--pwa__component lh-gauge--pwa__na-line" fill="#FFFFFF" x="20" y="32" width="20" height="4" rx="2"></rect>

          <g class="lh-gauge--pwa__component lh-gauge--pwa__installable-badge" transform="translate(20, 29)">
            <path fill="url(#lh-gauge--pwa__installable__shadow-gradient)" d="M33.629 19.487c-4.272 5.453-10.391 9.39-17.415 10.869L3 17.142 17.142 3 33.63 19.487z"/>
            <use href="#lh-gauge--pwa__installable-badge" />
          </g>

          <g class="lh-gauge--pwa__component lh-gauge--pwa__check-circle" transform="translate(18, 28)">
            <circle fill="#FFFFFF" cx="12" cy="12" r="12"></circle>
            <path fill="url(#lh-gauge--pwa__check-circle__gradient)" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
          </g>
        </g>
      </svg>

      <div class="lh-gauge__label"></div>
    </a>
  </>;
};

const Crc: FunctionComponent = () => {
  return <div class="lh-crc-container">
    <style jsx>{`
      .lh-crc .lh-tree-marker {
        width: 12px;
        height: 26px;
        display: block;
        float: left;
        background-position: top left;
      }
      .lh-crc .lh-horiz-down {
        background: url('data:image/svg+xml;utf8,<svg width="16" height="26" viewBox="0 0 16 26" xmlns="http://www.w3.org/2000/svg"><g fill="%23D8D8D8" fill-rule="evenodd"><path d="M16 12v2H-2v-2z"/><path d="M9 12v14H7V12z"/></g></svg>');
      }
      .lh-crc .lh-right {
        background: url('data:image/svg+xml;utf8,<svg width="16" height="26" viewBox="0 0 16 26" xmlns="http://www.w3.org/2000/svg"><path d="M16 12v2H0v-2z" fill="%23D8D8D8" fill-rule="evenodd"/></svg>');
      }
      .lh-crc .lh-up-right {
        background: url('data:image/svg+xml;utf8,<svg width="16" height="26" viewBox="0 0 16 26" xmlns="http://www.w3.org/2000/svg"><path d="M7 0h2v14H7zm2 12h7v2H9z" fill="%23D8D8D8" fill-rule="evenodd"/></svg>');
      }
      .lh-crc .lh-vert-right {
        background: url('data:image/svg+xml;utf8,<svg width="16" height="26" viewBox="0 0 16 26" xmlns="http://www.w3.org/2000/svg"><path d="M7 0h2v27H7zm2 12h7v2H9z" fill="%23D8D8D8" fill-rule="evenodd"/></svg>');
      }
      .lh-crc .lh-vert {
        background: url('data:image/svg+xml;utf8,<svg width="16" height="26" viewBox="0 0 16 26" xmlns="http://www.w3.org/2000/svg"><path d="M7 0h2v26H7z" fill="%23D8D8D8" fill-rule="evenodd"/></svg>');
      }
      .lh-crc .lh-crc-tree {
        font-size: 14px;
        width: 100%;
        overflow-x: auto;
      }
      .lh-crc .lh-crc-node {
        height: 26px;
        line-height: 26px;
        white-space: nowrap;
      }
      .lh-crc .lh-crc-node__tree-value {
        margin-left: 10px;
      }
      .lh-crc .lh-crc-node__tree-value div {
        display: inline;
      }
      .lh-crc .lh-crc-node__chain-duration {
        font-weight: 700;
      }
      .lh-crc .lh-crc-initial-nav {
        color: #595959;
        font-style: italic;
      }
      .lh-crc__summary-value {
        margin-bottom: 10px;
      }
    `}</style>
    <div>
      <div class="lh-crc__summary-value">
        <span class="lh-crc__longest_duration_label"></span> <b class="lh-crc__longest_duration"></b>
      </div>
    </div>
    <div class="lh-crc">
      <div class="lh-crc-initial-nav"></div>
    </div>
  </div>;
};

const CrcChain: FunctionComponent = () => {
  return <div class="lh-crc-node">
    <span class="lh-crc-node__tree-marker"></span>
    <span class="lh-crc-node__tree-value"></span>
  </div>;
};

const ThirdPartyFilter: FunctionComponent = () => {
  return <>
    <style jsx>{`
      .lh-3p-filter {
        color: var(--color-gray-600);
        float: right;
        padding: 6px var(--stackpack-padding-horizontal);
      }
      .lh-3p-filter-label, .lh-3p-filter-input {
        vertical-align: middle;
        user-select: none;
      }
      .lh-3p-filter-input:disabled + .lh-3p-ui-string {
        text-decoration: line-through;
      }
    `}</style>
    <div class="lh-3p-filter">
      <label class="lh-3p-filter-label">
        <input type="checkbox" class="lh-3p-filter-input" checked />
        <span class="lh-3p-ui-string">Show 3rd party resources</span> (<span class="lh-3p-filter-count"></span>)
      </label>
    </div>
  </>;
};

const Snippet: FunctionComponent = () => {
  return <div class="lh-snippet">
    <style jsx>{`
      :root {
        --snippet-highlight-light: #fbf1f2;
        --snippet-highlight-dark: #ffd6d8;
      }

      .lh-snippet__header {
        position: relative;
        overflow: hidden;
        padding: 10px;
        border-bottom: none;
        color: var(--snippet-color);
        background-color: var(--snippet-background-color);
        border: 1px solid var(--report-border-color-secondary);
      }
      .lh-snippet__title {
        font-weight: bold;
        float: left;
      }
      .lh-snippet__node {
        float: left;
        margin-left: 4px;
      }
      .lh-snippet__toggle-expand {
        padding: 1px 7px;
        margin-top: -1px;
        margin-right: -7px;
        float: right;
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 14px;
        color: #0c50c7;
      }

      .lh-snippet__snippet {
        overflow: auto;
        border: 1px solid var(--report-border-color-secondary);
      }
      /* Container needed so that all children grow to the width of the scroll container */
      .lh-snippet__snippet-inner {
        display: inline-block;
        min-width: 100%;
      }

      .lh-snippet:not(.lh-snippet--expanded) .lh-snippet__show-if-expanded {
        display: none;
      }
      .lh-snippet.lh-snippet--expanded .lh-snippet__show-if-collapsed {
        display: none;
      }

      .lh-snippet__line {
        background: white;
        white-space: pre;
        display: flex;
      }
      .lh-snippet__line:not(.lh-snippet__line--message):first-child {
        padding-top: 4px;
      }
      .lh-snippet__line:not(.lh-snippet__line--message):last-child {
        padding-bottom: 4px;
      }
      .lh-snippet__line--content-highlighted {
        background: var(--snippet-highlight-dark);
      }
      .lh-snippet__line--message {
        background: var(--snippet-highlight-light);
      }
      .lh-snippet__line--message .lh-snippet__line-number {
        padding-top: 10px;
        padding-bottom: 10px;
      }
      .lh-snippet__line--message code {
        padding: 10px;
        padding-left: 5px;
        color: var(--color-fail);
        font-family: var(--report-font-family);
      }
      .lh-snippet__line--message code {
        white-space: normal;
      }
      .lh-snippet__line-icon {
        padding-top: 10px;
        display: none;
      }
      .lh-snippet__line--message .lh-snippet__line-icon {
        display: block;
      }
      .lh-snippet__line-icon:before {
        content: "";
        display: inline-block;
        vertical-align: middle;
        margin-right: 4px;
        width: var(--score-icon-size);
        height: var(--score-icon-size);
        background-image: var(--fail-icon-url);
      }
      .lh-snippet__line-number {
        flex-shrink: 0;
        width: 40px;
        text-align: right;
        font-family: monospace;
        padding-right: 5px;
        margin-right: 5px;
        color: var(--color-gray-600);
        user-select: none;
      }
    `}</style>
  </div>;
};

const SnippetHeader: FunctionComponent = () => {
  return <div class="lh-snippet__header">
    <div class="lh-snippet__title"></div>
    <div class="lh-snippet__node"></div>
    <button class="lh-snippet__toggle-expand">
      <span class="lh-snippet__btn-label-collapse lh-snippet__show-if-expanded"></span>
      <span class="lh-snippet__btn-label-expand lh-snippet__show-if-collapsed"></span>
    </button>
  </div>;
};

const SnippetContent: FunctionComponent = () => {
  return <div class="lh-snippet__snippet">
    <div class="lh-snippet__snippet-inner"></div>
  </div>;
};

const SnippetLine: FunctionComponent = () => {
  return <div class="lh-snippet__line">
    <div class="lh-snippet__line-number"></div>
    <div class="lh-snippet__line-icon"></div>
    <code></code>
  </div>;
};

const ElementScreenshot: FunctionComponent = () => {
  return <div class="lh-element-screenshot">
    <div class="lh-element-screenshot__content">
      <div class="lh-element-screenshot__image">
        <div class="lh-element-screenshot__mask">
          <svg height="0" width="0">
            <defs>
              <clipPath clipPathUnits="objectBoundingBox"></clipPath>
            </defs>
          </svg>
        </div>
        <div class="lh-element-screenshot__element-marker"></div>
      </div>
    </div>
  </div>;
};

const Styles: FunctionComponent = () => {
  return <style>{styles}</style>;
};

function renderComponent(dom: DOM, Component: FunctionComponent) {
  const documentFragment = dom.createFragment();
  render(<Component/>, documentFragment);
  return documentFragment;
}

function createComponent(dom: DOM, componentName: ComponentName): DocumentFragment {
  switch (componentName) {
    case '3pFilter': return renderComponent(dom, ThirdPartyFilter);
    case 'audit': return renderComponent(dom, Audit);
    case 'categoryHeader': return renderComponent(dom, CategoryHeader);
    case 'chevron': return renderComponent(dom, Chevron);
    case 'clump': return renderComponent(dom, Clump);
    case 'crc': return renderComponent(dom, Crc);
    case 'crcChain': return renderComponent(dom, CrcChain);
    case 'elementScreenshot': return renderComponent(dom, ElementScreenshot);
    case 'footer': return renderComponent(dom, Footer);
    case 'explodeyGauge': return renderComponent(dom, ExplodeyGauge);
    case 'fraction': return renderComponent(dom, Fraction);
    case 'gauge': return renderComponent(dom, Gauge);
    case 'gaugePwa': return renderComponent(dom, GaugePwa);
    case 'heading': return renderComponent(dom, Heading);
    case 'metric': return renderComponent(dom, Metric);
    case 'scorescale': return renderComponent(dom, Scorescale);
    case 'scoresWrapper': return renderComponent(dom, ScoresWrapper);
    case 'snippet': return renderComponent(dom, Snippet);
    case 'snippetContent': return renderComponent(dom, SnippetContent);
    case 'snippetHeader': return renderComponent(dom, SnippetHeader);
    case 'snippetLine': return renderComponent(dom, SnippetLine);
    case 'styles': return renderComponent(dom, Styles);
    case 'topbar': return renderComponent(dom, Topbar);
    case 'warningsToplevel': return renderComponent(dom, WarningsToplevel);
  }
  throw new Error('unexpected component: ' + componentName);
}

export {
  ComponentName,
  createComponent,
  WarningsToplevel,
  Scorescale,
  Chevron,
  CategoryHeader,
  Clump,
  Audit,
  Metric,
  ScoresWrapper,
  Topbar,
  Heading,
  Footer,
  Gauge,
  Fraction,
  GaugePwa,
  Crc,
  CrcChain,
  ThirdPartyFilter,
  Snippet,
  SnippetHeader,
  SnippetContent,
  SnippetLine,
  ElementScreenshot,
  Styles,
};
