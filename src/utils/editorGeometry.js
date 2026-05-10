import { getElementLayout } from './responsive'

export const CANVAS_PADDING_BOTTOM = 80
export const SNAP_THRESHOLD = 6

export function getElementBox(element, breakpointId = 'desktop') {
  const layout = getElementLayout(element, breakpointId)
  return {
    id: element.id,
    x: layout.x || 0,
    y: layout.y || 0,
    width: layout.width || 200,
    height: layout.height || 100,
  }
}

export function getBoxEdges(box) {
  return {
    left: box.x,
    centerX: box.x + box.width / 2,
    right: box.x + box.width,
    top: box.y,
    centerY: box.y + box.height / 2,
    bottom: box.y + box.height,
  }
}

export function isContainerElement(element) {
  return ['container', 'section', 'frame', 'card'].includes(element?.type)
}

export function containsBox(parent, child, tolerance = 2) {
  if (!parent || !child) return false
  if (parent.width * parent.height <= child.width * child.height) return false

  return (
    child.x >= parent.x - tolerance &&
    child.y >= parent.y - tolerance &&
    child.x + child.width <= parent.x + parent.width + tolerance &&
    child.y + child.height <= parent.y + parent.height + tolerance
  )
}

export function getContainedElements(containerElement, elements, breakpointId = 'desktop') {
  if (!isContainerElement(containerElement)) return []

  const parentBox = getElementBox(containerElement, breakpointId)
  return elements.filter(element => {
    if (element.id === containerElement.id) return false
    const childBox = getElementBox(element, breakpointId)
    return containsBox(parentBox, childBox)
  })
}

export function getCanvasHeight(elements, canvasSettings, breakpointId = 'desktop') {
  return canvasSettings?.height || getContentHeight(elements, breakpointId)
}

export function getContentHeight(elements, breakpointId = 'desktop', minHeight = 900) {
  if (!elements?.length) return minHeight

  const maxBottom = elements.reduce((acc, element) => {
    const box = getElementBox(element, breakpointId)
    return Math.max(acc, box.y + box.height)
  }, 0)

  return Math.max(minHeight, maxBottom + CANVAS_PADDING_BOTTOM)
}

export function clampBoxToCanvas(box, canvasWidth, canvasHeight) {
  const width = Math.min(box.width, canvasWidth)
  const height = Math.min(box.height, canvasHeight)

  return {
    ...box,
    width,
    height,
    x: Math.min(Math.max(0, box.x), Math.max(0, canvasWidth - width)),
    y: Math.min(Math.max(0, box.y), Math.max(0, canvasHeight - height)),
  }
}

export function getSnapResult({
  movingBox,
  elements,
  activeId,
  ignoredIds = [],
  canvasWidth,
  canvasHeight,
  breakpointId = 'desktop',
  threshold = SNAP_THRESHOLD,
}) {
  const movingEdges = getBoxEdges(movingBox)
  const verticalTargets = [
    { value: 0, guide: 0, label: 'canvas-left' },
    { value: canvasWidth / 2, guide: canvasWidth / 2, label: 'canvas-center' },
    { value: canvasWidth, guide: canvasWidth, label: 'canvas-right' },
  ]
  const horizontalTargets = [
    { value: 0, guide: 0, label: 'canvas-top' },
    { value: canvasHeight / 2, guide: canvasHeight / 2, label: 'canvas-middle' },
    { value: canvasHeight, guide: canvasHeight, label: 'canvas-bottom' },
  ]

  const ignored = new Set([activeId, ...ignoredIds])

  elements
    .filter(element => !ignored.has(element.id))
    .forEach(element => {
      const box = getElementBox(element, breakpointId)
      const edges = getBoxEdges(box)
      verticalTargets.push(
        { value: edges.left, guide: edges.left, label: element.id },
        { value: edges.centerX, guide: edges.centerX, label: element.id },
        { value: edges.right, guide: edges.right, label: element.id },
      )
      horizontalTargets.push(
        { value: edges.top, guide: edges.top, label: element.id },
        { value: edges.centerY, guide: edges.centerY, label: element.id },
        { value: edges.bottom, guide: edges.bottom, label: element.id },
      )
    })

  const xCandidates = [
    { edge: 'left', value: movingEdges.left, offset: 0 },
    { edge: 'centerX', value: movingEdges.centerX, offset: movingBox.width / 2 },
    { edge: 'right', value: movingEdges.right, offset: movingBox.width },
  ]
  const yCandidates = [
    { edge: 'top', value: movingEdges.top, offset: 0 },
    { edge: 'centerY', value: movingEdges.centerY, offset: movingBox.height / 2 },
    { edge: 'bottom', value: movingEdges.bottom, offset: movingBox.height },
  ]

  const bestX = findBestSnap(xCandidates, verticalTargets, threshold)
  const bestY = findBestSnap(yCandidates, horizontalTargets, threshold)

  return {
    x: bestX ? Math.round(bestX.target.value - bestX.candidate.offset) : Math.round(movingBox.x),
    y: bestY ? Math.round(bestY.target.value - bestY.candidate.offset) : Math.round(movingBox.y),
    guides: {
      vertical: bestX ? [{ x: Math.round(bestX.target.guide), label: bestX.target.label }] : [],
      horizontal: bestY ? [{ y: Math.round(bestY.target.guide), label: bestY.target.label }] : [],
    },
  }
}

function findBestSnap(candidates, targets, threshold) {
  let best = null

  candidates.forEach(candidate => {
    targets.forEach(target => {
      const distance = Math.abs(candidate.value - target.value)
      if (distance > threshold) return
      if (!best || distance < best.distance) {
        best = { candidate, target, distance }
      }
    })
  })

  return best
}
