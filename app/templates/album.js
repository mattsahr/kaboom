import Album from './Album.svelte';
import startup from './album-shared';
import network from './network/network-api.js';

window.StartApp = startup(Album);
window.Network = network;
