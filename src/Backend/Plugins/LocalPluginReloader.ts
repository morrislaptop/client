import { PluginProcess } from "./PluginProcess";

/**
 * This interface represents a local plugin, which is stored in local_plugins/src.
 */
export interface HMRPlugin {
  id: string;
  name: string;
  code: string;
}

/**
 * Load all of the local plugins in the dist directory of the local_plugins project
 * as Plain Text files. We don't want to load them as modules. This allows users to
 * edit local plugins after they imported them into the browser.
 */
let pluginsContext = require.context(
  "raw-loader!../../../local_plugins/",
  false,
  /\.jsx?$/
);

function cleanFilename(filename: string) {
  return filename
    .replace(/^\.\//, "")
    .replace(/[_-]/g, " ")
    .replace(/\.[jt]sx?$/, "");
}

export function getHmrPlugins() {
  return pluginsContext.keys().map((filename) => {
    return {
      id: filename,
      name: cleanFilename(filename),
      code: pluginsContext<{ default: string }>(filename).default,
    };
  });
}

export function loadLocalPlugin(
  filename: string
): Promise<{ default: PluginProcess }> {
  return pluginsContext(filename);
}
