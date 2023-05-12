import * as fs from 'fs';

import glob from 'glob';

import {getMetrics} from './lantern/collect/common.js';

const inputDirMobile = 'timings-data/motopower';
const inputDirDesktop = 'timings-data/desktop';
const outputDir = 'lantern-data';

fs.rmSync(outputDir, {force: true, recursive: true});

const sites = [];
for (const subDir of glob.sync('*/*/', {cwd: inputDirMobile})) {
  const mobileDir = `${inputDirMobile}/${subDir}`;
  const desktopDir = mobileDir.replace(inputDirMobile, inputDirDesktop);
  const tracePath = `${desktopDir}/defaultPass.trace.json`;
  const devtoolsLogPath = `${desktopDir}/defaultPass.devtoolslog.json`;
  const mobileArtifacts = JSON.parse(fs.readFileSync(`${mobileDir}artifacts.json`, 'utf8'));
  const moibleLhr =
    JSON.parse(fs.readFileSync(`${mobileDir}/lhr.report.json`, 'utf8'));
  const url = mobileArtifacts.URL.requestedUrl;
  if (sites.find(s => s.url === url)) continue;

  const metrics = getMetrics(moibleLhr);
  if (!metrics) throw new Error();

  sites.push({
    url,
    wpt3g: {
      firstContentfulPaint: metrics.firstContentfulPaint,
      firstMeaningfulPaint: metrics.firstMeaningfulPaint,
      timeToConsistentlyInteractive: metrics.interactive,
      speedIndex: metrics.speedIndex,
      largestContentfulPaint: metrics.largestContentfulPaint,
      timeToFirstByte: metrics.timeToFirstByte,
      lcpLoadStart: metrics.lcpLoadStart,
      lcpLoadEnd: metrics.lcpLoadEnd,
    },
    unthrottled: {
      tracePath: `${subDir}defaultPass.trace.json`,
      devtoolsLogPath: `${subDir}defaultPass.devtoolslog.json`,
    },
  });

  fs.mkdirSync(`${outputDir}/${subDir}`, {recursive: true});
  fs.copyFileSync(tracePath, `${outputDir}/${subDir}defaultPass.trace.json`);
  fs.copyFileSync(devtoolsLogPath, `${outputDir}/${subDir}defaultPass.devtoolslog.json`);
}

fs.writeFileSync(`${outputDir}/site-index-plus-golden-expectations.json`,
  JSON.stringify({sites}, null, 2));
