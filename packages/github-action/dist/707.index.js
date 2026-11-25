export const id = 707;
export const ids = [707];
export const modules = {

/***/ 20823:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var __webpack_unused_export__;
// @ts-check
const path = __webpack_require__(16928);
const fs = __webpack_require__(79896);
const os = __webpack_require__(70857);
const url = __webpack_require__(87016);

const fsReadFileAsync = fs.promises.readFile;

/** @type {(name: string, sync: boolean) => string[]} */
function getDefaultSearchPlaces(name, sync) {
	return [
		'package.json',
		`.${name}rc.json`,
		`.${name}rc.js`,
		`.${name}rc.cjs`,
		...(sync ? [] : [`.${name}rc.mjs`]),
		`.config/${name}rc`,
		`.config/${name}rc.json`,
		`.config/${name}rc.js`,
		`.config/${name}rc.cjs`,
		...(sync ? [] : [`.config/${name}rc.mjs`]),
		`${name}.config.js`,
		`${name}.config.cjs`,
		...(sync ? [] : [`${name}.config.mjs`]),
	];
}

/**
 * @type {(p: string) => string}
 *
 * see #17
 * On *nix, if cwd is not under homedir,
 * the last path will be '', ('/build' -> '')
 * but it should be '/' actually.
 * And on Windows, this will never happen. ('C:\build' -> 'C:')
 */
function parentDir(p) {
	return path.dirname(p) || path.sep;
}

/** @type {import('./index').LoaderSync} */
const jsonLoader = (_, content) => JSON.parse(content.replace(/^\uFEFF/, ''));
// Use plain require in webpack context for dynamic import
const requireFunc =
	 true ? eval("require") : 0;
/** @type {import('./index').LoadersSync} */
const defaultLoadersSync = Object.freeze({
	'.js': requireFunc,
	'.json': requireFunc,
	'.cjs': requireFunc,
	noExt: jsonLoader,
});
__webpack_unused_export__ = defaultLoadersSync;

/** @type {import('./index').Loader} */
const dynamicImport = async id => {
	try {
		const fileUrl = url.pathToFileURL(id).href;
		const mod = await import(/* webpackIgnore: true */ fileUrl);

		return mod.default;
	} catch (e) {
		try {
			return requireFunc(id);
		} catch (/** @type {any} */ requireE) {
			if (
				requireE.code === 'ERR_REQUIRE_ESM' ||
				(requireE instanceof SyntaxError &&
					requireE
						.toString()
						.includes('Cannot use import statement outside a module'))
			) {
				throw e;
			}
			throw requireE;
		}
	}
};

/** @type {import('./index').Loaders} */
const defaultLoaders = Object.freeze({
	'.js': dynamicImport,
	'.mjs': dynamicImport,
	'.cjs': dynamicImport,
	'.json': jsonLoader,
	noExt: jsonLoader,
});
__webpack_unused_export__ = defaultLoaders;

/**
 * @param {string} name
 * @param {import('./index').Options | import('./index').OptionsSync} options
 * @param {boolean} sync
 * @returns {Required<import('./index').Options | import('./index').OptionsSync>}
 */
function getOptions(name, options, sync) {
	/** @type {Required<import('./index').Options>} */
	const conf = {
		stopDir: os.homedir(),
		searchPlaces: getDefaultSearchPlaces(name, sync),
		ignoreEmptySearchPlaces: true,
		cache: true,
		transform: x => x,
		packageProp: [name],
		...options,
		loaders: {
			...(sync ? defaultLoadersSync : defaultLoaders),
			...options.loaders,
		},
	};
	conf.stopDir = path.resolve(conf.stopDir);

	conf.searchPlaces.forEach(place => {
		const key = path.extname(place) || 'noExt';
		const loader = conf.loaders[key];
		if (!loader) {
			throw new Error(`Missing loader for extension "${place}"`);
		}

		if (typeof loader !== 'function') {
			throw new Error(
				`Loader for extension "${place}" is not a function: Received ${typeof loader}.`,
			);
		}
	});

	return conf;
}

/** @type {(props: string | string[], obj: Record<string, any>) => unknown} */
function getPackageProp(props, obj) {
	if (typeof props === 'string' && props in obj) return obj[props];
	return (
		(Array.isArray(props) ? props : props.split('.')).reduce(
			(acc, prop) => (acc === undefined ? acc : acc[prop]),
			obj,
		) || null
	);
}

/** @param {string} filepath */
function validateFilePath(filepath) {
	if (!filepath) throw new Error('load must pass a non-empty string');
}

/** @type {(loader: import('./index').Loader, ext: string) => void} */
function validateLoader(loader, ext) {
	if (!loader) throw new Error(`No loader specified for extension "${ext}"`);
	if (typeof loader !== 'function') throw new Error('loader is not a function');
}

/** @type {(enableCache: boolean) => <T>(c: Map<string, T>, filepath: string, res: T) => T} */
const makeEmplace = enableCache => (c, filepath, res) => {
	if (enableCache) c.set(filepath, res);
	return res;
};

/** @type {import('./index').lilconfig} */
module.exports._U = function lilconfig(name, options) {
	const {
		ignoreEmptySearchPlaces,
		loaders,
		packageProp,
		searchPlaces,
		stopDir,
		transform,
		cache,
	} = getOptions(name, options ?? {}, false);
	const searchCache = new Map();
	const loadCache = new Map();
	const emplace = makeEmplace(cache);

	return {
		async search(searchFrom = process.cwd()) {
			/** @type {import('./index').LilconfigResult} */
			const result = {
				config: null,
				filepath: '',
			};

			/** @type {Set<string>} */
			const visited = new Set();
			let dir = path.resolve(searchFrom);
			dirLoop: while (true) {
				if (cache) {
					const r = searchCache.get(dir);
					if (r !== undefined) {
						for (const p of visited) searchCache.set(p, r);
						return r;
					}
					visited.add(dir);
				}

				for (const searchPlace of searchPlaces) {
					const filepath = path.join(dir, searchPlace);
					try {
						await fs.promises.access(filepath);
					} catch {
						continue;
					}
					const content = String(await fsReadFileAsync(filepath));
					const loaderKey = path.extname(searchPlace) || 'noExt';
					const loader = loaders[loaderKey];

					// handle package.json
					if (searchPlace === 'package.json') {
						const pkg = await loader(filepath, content);
						const maybeConfig = getPackageProp(packageProp, pkg);
						if (maybeConfig != null) {
							result.config = maybeConfig;
							result.filepath = filepath;
							break dirLoop;
						}

						continue;
					}

					// handle other type of configs
					const isEmpty = content.trim() === '';
					if (isEmpty && ignoreEmptySearchPlaces) continue;

					if (isEmpty) {
						result.isEmpty = true;
						result.config = undefined;
					} else {
						validateLoader(loader, loaderKey);
						result.config = await loader(filepath, content);
					}
					result.filepath = filepath;
					break dirLoop;
				}
				if (dir === stopDir || dir === parentDir(dir)) break dirLoop;
				dir = parentDir(dir);
			}

			const transformed =
				// not found
				result.filepath === '' && result.config === null
					? transform(null)
					: transform(result);

			if (cache) {
				for (const p of visited) searchCache.set(p, transformed);
			}

			return transformed;
		},
		async load(filepath) {
			validateFilePath(filepath);
			const absPath = path.resolve(process.cwd(), filepath);
			if (cache && loadCache.has(absPath)) {
				return loadCache.get(absPath);
			}
			const {base, ext} = path.parse(absPath);
			const loaderKey = ext || 'noExt';
			const loader = loaders[loaderKey];
			validateLoader(loader, loaderKey);
			const content = String(await fsReadFileAsync(absPath));

			if (base === 'package.json') {
				const pkg = await loader(absPath, content);
				return emplace(
					loadCache,
					absPath,
					transform({
						config: getPackageProp(packageProp, pkg),
						filepath: absPath,
					}),
				);
			}
			/** @type {import('./index').LilconfigResult} */
			const result = {
				config: null,
				filepath: absPath,
			};
			// handle other type of configs
			const isEmpty = content.trim() === '';
			if (isEmpty && ignoreEmptySearchPlaces)
				return emplace(
					loadCache,
					absPath,
					transform({
						config: undefined,
						filepath: absPath,
						isEmpty: true,
					}),
				);

			// cosmiconfig returns undefined for empty files
			result.config = isEmpty ? undefined : await loader(absPath, content);

			return emplace(
				loadCache,
				absPath,
				transform(isEmpty ? {...result, isEmpty, config: undefined} : result),
			);
		},
		clearLoadCache() {
			if (cache) loadCache.clear();
		},
		clearSearchCache() {
			if (cache) searchCache.clear();
		},
		clearCaches() {
			if (cache) {
				loadCache.clear();
				searchCache.clear();
			}
		},
	};
};

/** @type {import('./index').lilconfigSync} */
__webpack_unused_export__ = function lilconfigSync(name, options) {
	const {
		ignoreEmptySearchPlaces,
		loaders,
		packageProp,
		searchPlaces,
		stopDir,
		transform,
		cache,
	} = getOptions(name, options ?? {}, true);
	const searchCache = new Map();
	const loadCache = new Map();
	const emplace = makeEmplace(cache);

	return {
		search(searchFrom = process.cwd()) {
			/** @type {import('./index').LilconfigResult} */
			const result = {
				config: null,
				filepath: '',
			};

			/** @type {Set<string>} */
			const visited = new Set();
			let dir = path.resolve(searchFrom);
			dirLoop: while (true) {
				if (cache) {
					const r = searchCache.get(dir);
					if (r !== undefined) {
						for (const p of visited) searchCache.set(p, r);
						return r;
					}
					visited.add(dir);
				}

				for (const searchPlace of searchPlaces) {
					const filepath = path.join(dir, searchPlace);
					try {
						fs.accessSync(filepath);
					} catch {
						continue;
					}
					const loaderKey = path.extname(searchPlace) || 'noExt';
					const loader = loaders[loaderKey];
					const content = String(fs.readFileSync(filepath));

					// handle package.json
					if (searchPlace === 'package.json') {
						const pkg = loader(filepath, content);
						const maybeConfig = getPackageProp(packageProp, pkg);
						if (maybeConfig != null) {
							result.config = maybeConfig;
							result.filepath = filepath;
							break dirLoop;
						}

						continue;
					}

					// handle other type of configs
					const isEmpty = content.trim() === '';
					if (isEmpty && ignoreEmptySearchPlaces) continue;

					if (isEmpty) {
						result.isEmpty = true;
						result.config = undefined;
					} else {
						validateLoader(loader, loaderKey);
						result.config = loader(filepath, content);
					}
					result.filepath = filepath;
					break dirLoop;
				}
				if (dir === stopDir || dir === parentDir(dir)) break dirLoop;
				dir = parentDir(dir);
			}

			const transformed =
				// not found
				result.filepath === '' && result.config === null
					? transform(null)
					: transform(result);

			if (cache) {
				for (const p of visited) searchCache.set(p, transformed);
			}

			return transformed;
		},
		load(filepath) {
			validateFilePath(filepath);
			const absPath = path.resolve(process.cwd(), filepath);
			if (cache && loadCache.has(absPath)) {
				return loadCache.get(absPath);
			}
			const {base, ext} = path.parse(absPath);
			const loaderKey = ext || 'noExt';
			const loader = loaders[loaderKey];
			validateLoader(loader, loaderKey);

			const content = String(fs.readFileSync(absPath));

			if (base === 'package.json') {
				const pkg = loader(absPath, content);
				return transform({
					config: getPackageProp(packageProp, pkg),
					filepath: absPath,
				});
			}
			const result = {
				config: null,
				filepath: absPath,
			};
			// handle other type of configs
			const isEmpty = content.trim() === '';
			if (isEmpty && ignoreEmptySearchPlaces)
				return emplace(
					loadCache,
					absPath,
					transform({
						filepath: absPath,
						config: undefined,
						isEmpty: true,
					}),
				);

			// cosmiconfig returns undefined for empty files
			result.config = isEmpty ? undefined : loader(absPath, content);

			return emplace(
				loadCache,
				absPath,
				transform(isEmpty ? {...result, isEmpty, config: undefined} : result),
			);
		},
		clearLoadCache() {
			if (cache) loadCache.clear();
		},
		clearSearchCache() {
			if (cache) searchCache.clear();
		},
		clearCaches() {
			if (cache) {
				loadCache.clear();
				searchCache.clear();
			}
		},
	};
};


/***/ }),

/***/ 81507:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   D: () => (/* binding */ getConfiguration)
/* harmony export */ });
/* unused harmony export getBrowserSetting */
/* harmony import */ var node_os__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(48161);
/* harmony import */ var node_path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(76760);
/* harmony import */ var lilconfig__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(20823);
/**
 * @license
 * Copyright 2023 Google Inc.
 * SPDX-License-Identifier: Apache-2.0
 */



function getBooleanEnvVar(name) {
    const env = process.env[name];
    if (env === undefined) {
        return;
    }
    switch (env.toLowerCase()) {
        case '':
        case '0':
        case 'false':
        case 'off':
            return false;
        default:
            return true;
    }
}
/**
 * @internal
 */
function isSupportedBrowser(product) {
    switch (product) {
        case 'chrome':
        case 'firefox':
            return true;
        default:
            return false;
    }
}
/**
 * @internal
 */
function getDefaultBrowser(browser) {
    if (!browser) {
        return 'chrome';
    }
    if (!isSupportedBrowser(browser)) {
        throw new Error(`Unsupported browser ${browser}`);
    }
    return browser;
}
/**
 * @internal
 */
function getLogLevel(logLevel) {
    switch (logLevel) {
        case 'silent':
            return 'silent';
        case 'error':
            return 'error';
        default:
            return 'warn';
    }
}
/**
 * @internal
 */
function getBrowserSetting(browser, configuration, defaultConfig = {}) {
    const browserSetting = {};
    const browserEnvName = browser.replaceAll('-', '_').toUpperCase();
    browserSetting.version =
        process.env[`PUPPETEER_${browserEnvName}_VERSION`] ??
            configuration[browser]?.version ??
            defaultConfig.version;
    browserSetting.downloadBaseUrl =
        process.env[`PUPPETEER_${browserEnvName}_DOWNLOAD_BASE_URL`] ??
            configuration[browser]?.downloadBaseUrl ??
            defaultConfig.downloadBaseUrl;
    browserSetting.skipDownload =
        getBooleanEnvVar(`PUPPETEER_${browserEnvName}_SKIP_DOWNLOAD`) ??
            getBooleanEnvVar(`PUPPETEER_SKIP_${browserEnvName}_DOWNLOAD`) ??
            configuration[browser]?.skipDownload ??
            configuration.skipDownload ??
            defaultConfig.skipDownload;
    return browserSetting;
}
/**
 * @internal
 */
const getConfiguration = async () => {
    const result = await (0,lilconfig__WEBPACK_IMPORTED_MODULE_2__/* .lilconfig */ ._U)('puppeteer', {
        searchPlaces: [
            'package.json',
            '.config/puppeteer.config.cjs',
            '.config/puppeteer.config.js',
            '.config/puppeteerrc.cjs',
            '.config/puppeteerrc.js',
            '.config/puppeteerrc.json',
            '.config/puppeteerrc',
            '.puppeteerrc.cjs',
            '.puppeteerrc.js',
            '.puppeteerrc.json',
            '.puppeteerrc',
            'puppeteer.config.cjs',
            'puppeteer.config.js',
        ],
    }).search();
    const configuration = result ? { ...result.config } : {};
    configuration.logLevel = getLogLevel(process.env['PUPPETEER_LOGLEVEL'] ?? configuration.logLevel);
    // Merging environment variables.
    configuration.defaultBrowser = getDefaultBrowser(process.env['PUPPETEER_BROWSER'] ?? configuration.defaultBrowser);
    configuration.executablePath =
        process.env['PUPPETEER_EXECUTABLE_PATH'] ?? configuration.executablePath;
    // Default to skipDownload if executablePath is set
    if (configuration.executablePath) {
        configuration.skipDownload = true;
    }
    // Set skipDownload explicitly or from default
    configuration.skipDownload =
        getBooleanEnvVar('PUPPETEER_SKIP_DOWNLOAD') ?? configuration.skipDownload;
    // Prepare variables used in browser downloading
    configuration.chrome = getBrowserSetting('chrome', configuration);
    configuration['chrome-headless-shell'] = getBrowserSetting('chrome-headless-shell', configuration);
    configuration.firefox = getBrowserSetting('firefox', configuration, {
        skipDownload: true,
    });
    configuration.cacheDirectory =
        process.env['PUPPETEER_CACHE_DIR'] ??
            configuration.cacheDirectory ??
            (0,node_path__WEBPACK_IMPORTED_MODULE_1__.join)((0,node_os__WEBPACK_IMPORTED_MODULE_0__.homedir)(), '.cache', 'puppeteer');
    configuration.temporaryDirectory =
        process.env['PUPPETEER_TMP_DIR'] ?? configuration.temporaryDirectory;
    configuration.experiments ??= {};
    return configuration;
};
//# sourceMappingURL=getConfiguration.js.map

/***/ }),

/***/ 18707:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   connect: () => (/* binding */ connect),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   defaultArgs: () => (/* binding */ defaultArgs),
/* harmony export */   executablePath: () => (/* binding */ executablePath),
/* harmony export */   launch: () => (/* binding */ launch),
/* harmony export */   setFollowSymlinks: () => (/* binding */ setFollowSymlinks),
/* harmony export */   trimCache: () => (/* binding */ trimCache)
/* harmony export */ });
/* harmony import */ var puppeteer_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8856);
/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};
/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in puppeteer_core__WEBPACK_IMPORTED_MODULE_0__) if(["default","connect","defaultArgs","executablePath","launch","trimCache","setFollowSymlinks"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => puppeteer_core__WEBPACK_IMPORTED_MODULE_0__[__WEBPACK_IMPORT_KEY__]
/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);
/* harmony import */ var _getConfiguration_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(81507);
/**
 * @license
 * Copyright 2017 Google Inc.
 * SPDX-License-Identifier: Apache-2.0
 */



/**
 * @public
 */
// @ts-expect-error using internal API.
const puppeteer = new puppeteer_core__WEBPACK_IMPORTED_MODULE_0__.PuppeteerNode({
    isPuppeteerCore: false,
    configuration: _getConfiguration_js__WEBPACK_IMPORTED_MODULE_1__/* .getConfiguration */ .D,
});
const { 
/**
 * @public
 */
connect, 
/**
 * @public
 */
defaultArgs, 
/**
 * @public
 */
executablePath, 
/**
 * @public
 */
launch, 
/**
 * @public
 */
trimCache, 
/**
 * @public
 */
setFollowSymlinks, } = puppeteer;
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (puppeteer);
//# sourceMappingURL=puppeteer.js.map

/***/ })

};
