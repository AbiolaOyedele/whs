/**
 * Types for `wawoff2`, which ships none.
 *
 * Declared rather than `@ts-ignore`d at the import: this way the two functions
 * are actually typed at every call site, and a wrong argument is still an
 * error. `decompress` takes a woff2 buffer and resolves to TTF bytes.
 */
declare module 'wawoff2' {
  export function decompress(input: Uint8Array | Buffer): Promise<Uint8Array>
  export function compress(input: Uint8Array | Buffer): Promise<Uint8Array>
}
