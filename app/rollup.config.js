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
		file: 'pages/__app/album-app.js'
	},
	plugins: [
		svelte({ compilerOptions: { dev: !production } }),
		css({ output: 'bundle.css' }),
		resolve({ browser: true, dedupe: ['svelte'] }),
		commonjs(),
		copy({ targets: [
			{ src: 'base/global.css', dest: 'pages/__app/' }
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
		file: 'pages/__app/album-basic.js'
	},
	plugins: [
		svelte({ compilerOptions: { dev: !production } }),
		css({ output: 'bundle-basic.css' }),
		resolve({ browser: true, dedupe: ['svelte'] }),
		commonjs(),
		copy({ targets: [
			{ src: 'base/global-basic.css', dest: 'pages/__app/' }
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
		        __app_file_name__: '__app/album-basic.js',
		        __css_global_file_name__: '',
		        __css_bundle_file_name__: '__app/bundle-basic.css',
		        __css_nav_file_name__: '../bundle-nav.css',
		        __html_bundle_output__: 'basic.html'
			}
		}),
		concatHTML({
			replacements: {
		        __app_file_name__: '__app/album-app.js',
		        __css_global_file_name__: '__app/global.css',
		        __css_bundle_file_name__: '__app/bundle.css',
		        __css_nav_file_name__: '../bundle-nav.css',
		        __html_bundle_output__: 'index.html'
			}
		}),
		!production && serve(),
		!production && livereload('pages'),
		production && terser()
	],
	watch: { clearScreen: false }
};

export default [ rollupApp, rollupBasic, rollupNav ];
