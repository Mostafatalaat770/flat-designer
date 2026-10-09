import assert from 'node:assert/strict';

// The viewer retains its drawing buffer. Read that exact WebGL frame instead
// of waiting for Playwright's compositor screenshot stability checks.
export async function captureCanvasPng(canvas) {
  const frame = await canvas.evaluate(element => ({
    url: element.toDataURL('image/png'),
    width: element.width,
    height: element.height,
  }));
  assert.match(frame.url, /^data:image\/png;base64,[A-Za-z0-9+/=]+$/);
  assert.ok(frame.width > 0 && frame.height > 0, 'Empty WebGL canvas');
  const bytes = Buffer.from(frame.url.slice('data:image/png;base64,'.length), 'base64');
  assert.ok(bytes.length > 24, 'Incomplete canvas PNG');
  assert.ok(bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])), 'Invalid canvas PNG');
  assert.equal(bytes.toString('ascii', 12, 16), 'IHDR');
  assert.equal(bytes.readUInt32BE(16), frame.width, 'PNG width differs from canvas');
  assert.equal(bytes.readUInt32BE(20), frame.height, 'PNG height differs from canvas');
  return bytes;
}
