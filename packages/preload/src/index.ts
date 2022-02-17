/**
 * @module preload
 */

import {contextBridge,ipcRenderer} from 'electron';
import {sha256sum} from '/@/sha256sum';

/**
 * The "Main World" is the JavaScript context that your main renderer code runs in.
 * By default, the page you load in your renderer executes code in this world.
 *
 * @see https://www.electronjs.org/docs/api/context-bridge
 */

/**
 * After analyzing the `exposeInMainWorld` calls,
 * `packages/preload/exposedInMainWorld.d.ts` file will be generated.
 * It contains all interfaces.
 * `packages/preload/exposedInMainWorld.d.ts` file is required for TS is `renderer`
 *
 * @see https://github.com/cawa-93/dts-for-context-bridge
 */

/**
 * Expose Environment versions.
 * @example
 * console.log( window.versions )
 */
contextBridge.exposeInMainWorld('versions', process.versions);

/**
 * Safe expose node.js API
 * @example
 * window.nodeCrypto('data')
 */
contextBridge.exposeInMainWorld('nodeCrypto', {sha256sum});





contextBridge.exposeInMainWorld('api',{
    send: (channel:string, data?:any) => {
        // whitelist channels
        // let validChannels = ["toMain"];
        // if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        // }
    },
    receive: (channel:string, func:() =>void) => {
        // let validChannels = ["fromMain"];
        // if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender` 
            // ipcRenderer.on(channel, (event, ...args) => func(...args));
                ipcRenderer.on(channel, func);
        // }
    },

});