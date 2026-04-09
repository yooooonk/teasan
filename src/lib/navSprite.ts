import type { CSSProperties } from "react";

/** public/icons/nav-sprite.png — 1402×1122, 가로 5칸 × 1줄 */
export const NAV_SPRITE_PATH = "/icons/nav-sprite.png";

const SPRITE_W = 1402;
const SPRITE_H = 1122;

const COLS = 5;
const ROWS = 1;

// 1402/5 = 280.4 처럼 소수 폭이면 배경 위치가 서브픽셀로 떨어져
// 인접 칸(그림자)이 살짝 비칠 수 있습니다. 칸 폭/오프셋을 정수로 스냅합니다.
const cellW = Math.round(SPRITE_W / COLS); // 280
const cellH = SPRITE_H / ROWS;
const EFFECTIVE_SPRITE_W = cellW * COLS; // 1400 (정수 기준)

export type NavSpriteCell = {
  col: number;
  row: number;
  dx?: number;
  dy?: number;
};

/**
 * 탭 순서 (왼쪽→오른쪽): 대시보드, 추이, 스냅샷, 종목 관리, 기록
 * 스프라이트: 분홍 꽃, 하늘 꽃, 노랑 꽃, 흰 꽃, 새싹
 */
export const NAV_SPRITE_CELLS: NavSpriteCell[] = [
  // dx/dy는 px 단위(표시 크기 기준) 미세 이동. (+)면 오른쪽/아래로 이동합니다.
  { col: 0, row: 0, dx: -3, dy: 5 },
  { col: 1, row: 0, dx: -3, dy: 5 },
  { col: 4, row: 0, dx: 2, dy: 5 },
  { col: 3, row: 0, dx: 1, dy: 5 },
  { col: 2, row: 0, dx: -2, dy: 5 },
];

export function navSpriteStyle(
  cell: NavSpriteCell,
  sizePx: number,
): CSSProperties {
  const scale = sizePx / cellW;
  const scaledH = SPRITE_H * scale;
  const rawOffsetX = -cell.col * cellW * scale;
  const rawOffsetY =
    ROWS === 1 ? -(scaledH - sizePx) / 2 : -cell.row * cellH * scale;

  // 픽셀 스냅(브라우저 렌더러가 소수 픽셀로 보간하며 이웃 칸이 보이는 현상 방지)
  const offsetX = Math.round(rawOffsetX + (cell.dx ?? 0));
  const offsetY = Math.round(rawOffsetY + (cell.dy ?? 0));

  return {
    width: sizePx,
    height: sizePx,
    backgroundImage: `url(${NAV_SPRITE_PATH})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${EFFECTIVE_SPRITE_W * scale}px ${scaledH}px`,
    backgroundPosition: `${offsetX}px ${offsetY}px`,
    flexShrink: 0,
  };
}
