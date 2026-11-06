import { describe, expect, test } from "vitest";
import { clear, enqueue, pending, takeIfFresh } from "./clockQueue";

function memoryStorage() {
  const items = new Map();

  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => items.set(key, String(value)),
    removeItem: (key) => items.delete(key),
  };
}

const tappedAt = new Date("2026-11-04T09:00:00+01:00");
const minutesLater = (minutes) => new Date(tappedAt.getTime() + minutes * 60_000);

describe("the clock queue", () => {
  test("keeps the action with its tap time", () => {
    const storage = memoryStorage();

    expect(enqueue(storage, { type: "checkin", checkin_id: null }, tappedAt)).toBe(true);

    expect(pending(storage)).toEqual({ type: "checkin", checkin_id: null, tapped_at: "2026-11-04T08:00:00.000Z" });
  });

  test("holds one action at most", () => {
    const storage = memoryStorage();
    enqueue(storage, { type: "checkin", checkin_id: null }, tappedAt);

    expect(enqueue(storage, { type: "checkout", checkin_id: 1 }, minutesLater(1))).toBe(false);
    expect(pending(storage).type).toBe("checkin");
  });

  test("sends an action up to 15 minutes old and no older", () => {
    const storage = memoryStorage();
    enqueue(storage, { type: "checkout", checkin_id: 7 }, tappedAt);

    expect(takeIfFresh(storage, minutesLater(14))).toMatchObject({ type: "checkout", checkin_id: 7 });
    expect(takeIfFresh(storage, minutesLater(16))).toBe("expired");
  });

  test("keeps the action until it's cleared", () => {
    const storage = memoryStorage();
    enqueue(storage, { type: "checkin", checkin_id: null }, tappedAt);
    takeIfFresh(storage, minutesLater(1));
    expect(pending(storage)).not.toBeNull();

    clear(storage);

    expect(pending(storage)).toBeNull();
    expect(takeIfFresh(storage, minutesLater(1))).toBeNull();
  });
});
