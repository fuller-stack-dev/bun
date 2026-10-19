// Node transport envelopes are collected by the native serialization walk.
// The aliased Buffer views are restored only after the envelope is decoded.

const { Buffer } = require("node:buffer");
const { isUint8Array } = require("node:util/types");
const BufferPrototype = Buffer.prototype;
const ObjectSetPrototypeOf = Object.setPrototypeOf;

/**
 * Receive side: restore the Buffer prototype on the envelope's aliased views
 * and hand back the value. The envelope came off a wire or byte blob, so its
 * shape is validated before it is trusted.
 */
function restoreBuffers(envelope: unknown): unknown {
  if (!$isJSArray(envelope) || (envelope as unknown[]).length !== 2 || !$isJSArray((envelope as unknown[])[1])) {
    throw new Error("failed to parse serialized buffer envelope");
  }
  const buffers = (envelope as unknown[])[1] as unknown[];
  // Only a Uint8Array may become a Buffer; the sender tags Buffers and nothing else.
  for (let i = 0; i < buffers.length; i++) {
    if (!isUint8Array(buffers[i])) throw new Error("failed to parse serialized buffer envelope");
  }
  for (let i = 0; i < buffers.length; i++) {
    ObjectSetPrototypeOf(buffers[i], BufferPrototype);
  }
  return (envelope as unknown[])[0];
}

export default { restoreBuffers };
