export type SqueezeCard = { key: number; slide: number };
export type SqueezeWindow = {
  cards: SqueezeCard[];
  column: number;
  slid: number;
  still: boolean;
};
export const wrapSlide = (index: number, count: number) =>
  count ? ((index % count) + count) % count : 0;
export const visiblePanels = (count: number) => Math.min(count, 7);
export function createSqueezeWindow(count: number, index = 0): SqueezeWindow {
  const start = wrapSlide(index, count);
  return {
    cards: Array.from({ length: visiblePanels(count) }, (_, i) => ({
      key: start + i,
      slide: wrapSlide(start + i, count),
    })),
    column: 0,
    slid: 0,
    still: false,
  };
}
export function stepSqueezeWindow(
  state: SqueezeWindow,
  by: number,
  count: number,
  currentShift = state.slid,
): SqueezeWindow {
  if (count < 2 || !by) return state;
  if (by > 0) {
    const last = state.cards.at(-1)!.key;
    const column = state.column - by;
    return {
      cards: [
        ...state.cards,
        ...Array.from({ length: by }, (_, i) => ({
          key: last + i + 1,
          slide: wrapSlide(last + i + 1, count),
        })),
      ],
      column,
      slid: column,
      still: false,
    };
  }
  const first = state.cards[0].key;
  return {
    cards: [
      ...Array.from({ length: -by }, (_, i) => ({
        key: first + by + i,
        slide: wrapSlide(first + by + i, count),
      })),
      ...state.cards,
    ],
    column: state.column,
    slid: currentShift + by,
    still: true,
  };
}
export function settleSqueezeWindow(
  state: SqueezeWindow,
  count: number,
): SqueezeWindow {
  return {
    cards: state.cards.slice(
      -state.column,
      -state.column + visiblePanels(count),
    ),
    column: 0,
    slid: 0,
    still: true,
  };
}
