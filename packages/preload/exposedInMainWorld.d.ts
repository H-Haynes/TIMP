interface Window {
    /**
     * Expose Environment versions.
     * @example
     * console.log( window.versions )
     */
    readonly versions: NodeJS.ProcessVersions;
    /**
     * Safe expose node.js API
     * @example
     * window.nodeCrypto('data')
     */
    readonly nodeCrypto: { sha256sum: any; };
    readonly api: { send: (channel: string, data?: any) => void; receive: (channel: string, func: () => void) => void; };
}
