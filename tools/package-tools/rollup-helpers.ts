import {buildConfig} from './build-config';
import {rollupRemoveLicensesPlugin} from './rollup-remove-licenses';

// There are no type definitions available for these imports.
const rollup = require('rollup');
const rollupNodeResolutionPlugin = require('rollup-plugin-node-resolve');
const ROLLUP_GLOBALS = require('./rollup-globals.json');

export type BundleConfig = {
  entry: string;
  dest: string;
  format: string;
  moduleName: string;
};

/** Creates a rollup bundle of a specified JavaScript file.*/
export function createRollupBundle(config: BundleConfig): Promise<any> {
  const bundleOptions = {
    context: 'this',
    external: Object.keys(ROLLUP_GLOBALS),
    entry: config.entry,
    plugins: [rollupRemoveLicensesPlugin]
  };

  const writeOptions = {
    // Keep the moduleId empty because we don't want to force developers to a specific moduleId.
    moduleId: '',
    moduleName: config.moduleName || 'ng.material',
    banner: buildConfig.licenseBanner,
    format: config.format,
    dest: config.dest,
    globals: ROLLUP_GLOBALS,
    sourceMap: true
  };

  // When creating a UMD, we want to exclude tslib from the `external` bundle option so that it
  // is inlined into the bundle.
  if (config.format === 'umd') {
    bundleOptions.plugins.push(rollupNodeResolutionPlugin());

    const external = Object.keys(ROLLUP_GLOBALS);
    external.splice(external.indexOf('tslib'), 1);
    bundleOptions.external = external;
  }

  return rollup.rollup(bundleOptions).then((bundle: any) => bundle.write(writeOptions));
}
