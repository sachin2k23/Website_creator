/**
 * responsive.js
 *
 * Single source of truth for breakpoint definitions and per-breakpoint
 * layout resolution. Elements store their desktop layout as the base.
 * Tablet / phone / custom overrides are stored in element.breakpoints[bp].
 *
 * Structure of element.breakpoints:
 * {
 *   tablet:  { x, y, width, height },  // only the keys that differ
 *   phone:   { x, y, width, height },
 *   custom:  { x, y, width, height },
 * }
 *
 * Desktop always reads from the root x/y/width/height — never from
 * element.breakpoints.desktop — so existing data is never broken.
 */

export const BREAKPOINTS = [
  { id: 'desktop', label: 'Desktop', width: 1200 },
  { id: 'tablet',  label: 'Tablet',  width: 768  },
  { id: 'phone',   label: 'Phone',   width: 390  },
  { id: 'custom',  label: 'Custom',  width: null  },
]

/**
 * Returns the canvas width for a given breakpoint id.
 * For 'custom' the caller supplies customWidth.
 */
export function getCanvasWidth(breakpointId, canvasSettings, customWidth = 800) {
  switch (breakpointId) {
    case 'desktop': return canvasSettings?.width  || 1200
    case 'tablet':  return 768
    case 'phone':   return 390
    case 'custom':  return customWidth
    default:        return canvasSettings?.width  || 1200
  }
}

/**
 * Read the effective layout for an element at a given breakpoint.
 * Falls through: phone → tablet → desktop (root).
 *
 * Returns { x, y, width, height } — always fully resolved.
 */
export function getElementLayout(element, breakpointId) {
  const base = {
    x:      element.x      ?? 0,
    y:      element.y      ?? 0,
    width:  element.width  ?? 200,
    height: element.height ?? 100,
  }

  if (breakpointId === 'desktop') return base

  const bpOverrides = element.breakpoints ?? {}

  // Fall-through chain: phone → tablet → desktop
  if (breakpointId === 'phone') {
    return {
      ...base,
      ...(bpOverrides.tablet ?? {}),
      ...(bpOverrides.phone  ?? {}),
    }
  }

  if (breakpointId === 'tablet') {
    return {
      ...base,
      ...(bpOverrides.tablet ?? {}),
    }
  }

  // custom: use custom override if present, otherwise inherit tablet.
  return {
    ...base,
    ...(bpOverrides.tablet ?? {}),
    ...(bpOverrides.custom ?? {}),
  }
}

export function getResponsiveValue(element, breakpointId, key, fallback) {
  const baseValue = element[key] ?? fallback
  const bpOverrides = element.breakpoints ?? {}

  if (breakpointId === 'desktop') return baseValue

  if (breakpointId === 'phone') {
    return bpOverrides.phone?.[key] ?? bpOverrides.tablet?.[key] ?? baseValue
  }

  if (breakpointId === 'tablet') {
    return bpOverrides.tablet?.[key] ?? baseValue
  }

  return bpOverrides.custom?.[key] ?? bpOverrides.tablet?.[key] ?? baseValue
}

/**
 * Produce an updated element after a layout change at a given breakpoint.
 * Desktop edits go to root keys. Other breakpoints write into element.breakpoints[bp].
 */
export function setElementLayout(element, breakpointId, changes) {
  if (breakpointId === 'desktop') {
    return { ...element, ...changes }
  }

  return {
    ...element,
    breakpoints: {
      ...(element.breakpoints ?? {}),
      [breakpointId]: {
        ...(element.breakpoints?.[breakpointId] ?? {}),
        ...changes,
      },
    },
  }
}

/**
 * Auto-generate sensible tablet / phone defaults for a freshly inserted
 * element based on its desktop layout and the canvas width.
 *
 * Rules:
 *   Tablet  — if element right-edge exceeds tablet canvas, clamp width and
 *             reposition to stay in-bounds. Maintain y.
 *   Phone   — full-width minus 24 px margin on each side, stack vertically
 *             preserving relative order (y is kept so order is implicit).
 */
export function generateResponsiveDefaults(element, desktopCanvasWidth = 1200) {
  const tabletWidth  = 768
  const phoneWidth   = 390
  const phoneMargin  = 24

  const deskX = element.x      ?? 0
  const deskY = element.y      ?? 0
  const deskW = element.width  ?? 200
  const deskH = element.height ?? 100

  // ── Tablet ─────────────────────────────────────────────────────────────────
  // Scale x proportionally, clamp width if it overflows
  const tabletScale = tabletWidth / desktopCanvasWidth
  let tabX = Math.round(deskX * tabletScale)
  let tabW = Math.round(deskW * tabletScale)

  // Don't let element overflow tablet canvas
  if (tabX + tabW > tabletWidth - 16) {
    tabW = Math.max(40, tabletWidth - tabX - 16)
  }
  if (tabX < 0) tabX = 0

  // ── Phone ──────────────────────────────────────────────────────────────────
  // Most elements go full-width with side margins.
  // Very small elements (buttons, checkboxes, inputs < 200px) keep their size
  // but are left-aligned within the margin.
  const isNarrow = deskW < 200
  const phoneX   = phoneMargin
  const phoneW   = isNarrow
    ? Math.min(deskW, phoneWidth - phoneMargin * 2)
    : phoneWidth - phoneMargin * 2

  return {
    ...element,
    breakpoints: {
      ...(element.breakpoints ?? {}),
      tablet: element.breakpoints?.tablet ?? { x: tabX, y: deskY, width: tabW, height: deskH },
      phone:  element.breakpoints?.phone  ?? { x: phoneX, y: deskY, width: phoneW, height: deskH },
      custom: element.breakpoints?.custom ?? { x: tabX, y: deskY, width: tabW, height: deskH },
    },
  }
}

/**
 * Apply generateResponsiveDefaults to a full tree of elements.
 * Skips elements that already have breakpoint overrides set.
 */
export function applyResponsiveDefaultsToTree(tree, desktopCanvasWidth = 1200) {
  return tree.map(el => {
    const hasOverrides =
      el.breakpoints?.tablet || el.breakpoints?.phone
    if (hasOverrides) return el
    return generateResponsiveDefaults(el, desktopCanvasWidth)
  })
}
