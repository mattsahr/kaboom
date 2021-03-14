import svelte from 'rollup-plugin-svelte';
import copy from 'rollup-plugin-copy';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import concatHTML from './rollup-kaboom/concat-html.js';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

const rollupApp = {
	input: 'templates/album.js',
	output: {
		sourcemap: !production, format: 'iife', name: 'app',
		file: 'pages/++app/album-app.js'
	},
	plugins: [
		svelte({ compilerOptions: { dev: !production } }),
		css({ output: 'bundle.css' }),
		resolve({ 
			browser: true, 
			dedupe: ['svelte', 'svelte/transition', 'svelte/internal'] 
		}),
		commonjs(),
		copy({ targets: [
			{ src: 'base/global.css', dest: 'pages/++app/' }
		] }),
		!production && livereload('pages'),
		production && terser()
	],
	watch: { clearScreen: false }
};

const rollupBasic = {
	input: 'templates/album-basic.js',
	output: { 
		sourcemap: !production, format: 'iife', name: 'basic',
		file: 'pages/++app/album-basic.js'
	},
	plugins: [
		svelte({ compilerOptions: { dev: !production } }),
		css({ output: 'bundle-basic.css' }),
		resolve({ browser: true, dedupe: ['svelte'] }),
		commonjs(),
		copy({ targets: [
			{ src: 'base/global-basic.css', dest: 'pages/++app/' }
		] }),
		!production && livereload('pages'),
		production && terser()
	],
	watch: { clearScreen: false }
};

const rollupNav = {
	input: 'templates/nav-app.js',
	output: { 
		sourcemap: !production, format: 'iife', name: 'nav',
		file: 'pages/nav-app.js'
	},
	plugins: [
		svelte({ compilerOptions: { dev: !production } }),
		css({ output: 'bundle-nav.css' }),
		resolve({ browser: true, dedupe: ['svelte'] }),
		commonjs(),
		concatHTML({
			replacements: {
		        __html_bundle_output__: 'basic.html',

		        // basic files
		        __app_file_name__: '++app/album-basic.js',
		        __css_global_file_name__: '',
		        __css_bundle_file_name__: '++app/bundle-basic.css',

		        // child-page specific locations
		        __favicon_file_name__: '../favicon.png',
		        __css_nav_file_name__: '../bundle-nav.css',
		        __nav_app_file_name__: '../nav-app.js',
		        __nav_meta_file_name__: '../nav-meta.json',
		        __nav_root_url__: '../'
			}
		}),
		concatHTML({
			replacements: {
		        __html_bundle_output__: 'home-basic.html',

		        // basic files
		        __app_file_name__: '++app/album-basic.js',
		        __css_global_file_name__: '',
		        __css_bundle_file_name__: '++app/bundle-basic.css',

		        // home-page specific locations
		        __favicon_file_name__: 'favicon.png',
		        __nav_app_file_name__: 'nav-app.js',
		        __nav_meta_file_name__: 'nav-meta.json',
		        __css_nav_file_name__: 'bundle-nav.css',
		        __nav_root_url__: ''
			}
		}),
		concatHTML({
			replacements: {
		        __html_bundle_output__: 'index.html',

		        // active (full-edit app) files
				__app_file_name__: '++app/album-app.js',
		        __css_global_file_name__: '++app/global.css',
		        __css_bundle_file_name__: '++app/bundle.css',

		        // child-page specific locations
		        __favicon_file_name__: '../favicon.png',
		        __nav_app_file_name__: '../nav-app.js',
		        __nav_meta_file_name__: '../nav-meta.json',
		        __css_nav_file_name__: '../bundle-nav.css',
		        __nav_root_url__: '../'
			}
		}),
		concatHTML({
			replacements: {  
				__html_bundle_output__: 'home.html',

		        // active (full-edit app) files
		        __app_file_name__: '++app/album-app.js',
		        __css_global_file_name__: '++app/global.css',
		        __css_bundle_file_name__: '++app/bundle.css',

		        // home-page specific locations
		        __favicon_file_name__: 'favicon.png',
		        __nav_app_file_name__: 'nav-app.js',
		        __nav_meta_file_name__: 'nav-meta.json',
		        __css_nav_file_name__: 'bundle-nav.css',
		        __nav_root_url__: ''
			}
		}),
		!production && serve(),
		!production && livereload('pages'),
		production && terser()
	],
	watch: { clearScreen: false }
};

export default [ rollupApp, rollupBasic, rollupNav ];
