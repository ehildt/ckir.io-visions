import {
  getEvent,
  getRequestId,
  getRoom,
  getStream,
  getTask,
  isAborted,
  isDone,
  isPending,
} from './message-data.helper';

describe('getRoom', () => {
  it('returns roomId when present', () => {
    expect(getRoom({ roomId: 'r1' })).toBe('r1');
  });
  it('returns undefined for non-object', () => {
    expect(getRoom(null)).toBeUndefined();
    expect(getRoom('str')).toBeUndefined();
  });
});

describe('getEvent', () => {
  it('returns event when present', () => {
    expect(getEvent({ event: 'e1' })).toBe('e1');
  });
  it('returns undefined for missing event', () => {
    expect(getEvent({})).toBeUndefined();
  });
});

describe('getRequestId', () => {
  it('returns requestId when present', () => {
    expect(getRequestId({ requestId: 'id1' })).toBe('id1');
  });
});

describe('getTask', () => {
  it('returns task when present', () => {
    expect(getTask({ task: 'ocr' })).toBe('ocr');
  });
});

describe('getStream', () => {
  it('returns stream boolean', () => {
    expect(getStream({ stream: true })).toBe(true);
    expect(getStream({ stream: false })).toBe(false);
  });
  it('returns undefined when absent', () => {
    expect(getStream({})).toBeUndefined();
  });
});

describe('isPending', () => {
  it('returns true when pending is true', () => {
    expect(isPending({ pending: true })).toBe(true);
  });
  it('returns false when pending is not true', () => {
    expect(isPending({ pending: false })).toBe(false);
    expect(isPending({})).toBe(false);
    expect(isPending(null)).toBe(false);
  });
});

describe('isAborted', () => {
  it('returns true when aborted is true', () => {
    expect(isAborted({ aborted: true })).toBe(true);
  });
  it('returns false otherwise', () => {
    expect(isAborted({ aborted: false })).toBe(false);
    expect(isAborted({})).toBe(false);
  });
});

describe('isDone', () => {
  it('returns true when done is true', () => {
    expect(isDone({ done: true })).toBe(true);
  });
  it('returns false otherwise', () => {
    expect(isDone({ done: false })).toBe(false);
    expect(isDone({})).toBe(false);
  });
});
