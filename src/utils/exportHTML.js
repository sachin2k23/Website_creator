function elementToCSS(el) {
  const radius = el.radius || 0
  const border = el.borderColor ? `1.5px solid ${el.borderColor}` : 'none'
  const shadow = el.shadowColor ? `0 4px 24px ${el.shadowColor}` : 'none'
  const opacity = (el.opacity ?? 100) / 100

  return `
    position: absolute;
    left: ${el.x}px;
    top: ${el.y}px;
    width: ${el.width || 200}px;
    opacity: ${opacity};
    border-radius: ${radius}px;
    border: ${border};
    box-shadow: ${shadow};
  `
}

function elementToHTML(el) {
  const base = elementToCSS(el)
  const h = el.height || 100

  switch (el.type) {
    case 'heading':
      return `
        <h1 style="
          ${base}
          color: ${el.textColor || '#111827'};
          font-size: ${el.fontSize || 32}px;
          font-weight: ${el.fontWeight || 700};
          font-style: ${el.italic ? 'italic' : 'normal'};
          text-decoration: ${el.underline ? 'underline' : 'none'};
          text-align: ${el.textAlign || 'left'};
          line-height: ${el.lineHeight || 1.2};
          margin: 0;
        ">${el.content || 'Your Heading'}</h1>
      `

    case 'paragraph':
      return `
        <p style="
          ${base}
          color: ${el.textColor || '#4b5563'};
          font-size: ${el.fontSize || 16}px;
          font-weight: ${el.fontWeight || 400};
          font-style: ${el.italic ? 'italic' : 'normal'};
          text-decoration: ${el.underline ? 'underline' : 'none'};
          text-align: ${el.textAlign || 'left'};
          line-height: ${el.lineHeight || 1.6};
          margin: 0;
        ">${el.content || 'Your text goes here'}</p>
      `

    case 'link':
      return `
        <a href="#" style="
          ${base}
          color: ${el.textColor || '#2348D7'};
          font-size: ${el.fontSize || 16}px;
          text-decoration: underline;
          text-align: ${el.textAlign || 'left'};
        ">${el.content || 'Click here'}</a>
      `

    case 'button':
      return `
        <button style="
          ${base}
          height: ${h}px;
          background-color: ${el.fill || '#2348D7'};
          color: ${el.textColor || '#ffffff'};
          font-size: ${el.fontSize || 14}px;
          font-weight: ${el.fontWeight || 500};
          cursor: pointer;
          border: none;
          border-radius: ${el.radius || 8}px;
        ">${el.content || 'Click me'}</button>
      `

    case 'image':
      return el.src
        ? `<img src="${el.src}" style="${base} height: ${h}px; object-fit: cover;" />`
        : `
          <div style="
            ${base}
            height: ${h}px;
            background-color: ${el.fill || '#F3F6FB'};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
          ">🖼</div>
        `

    case 'container':
    case 'section':
      return `
        <div style="
          ${base}
          height: ${h}px;
          background-color: ${el.fill || 'transparent'};
        "></div>
      `

    case 'divider':
      return `
        <div style="
          ${base}
          height: 2px;
          background-color: ${el.fill || '#E2E8F4'};
        "></div>
      `

    case 'video':
      return `
        <div style="
          ${base}
          height: ${h}px;
          background-color: #0F1A2E;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 32px;
        ">▶</div>
      `

    case 'input':
      return `
        <input
          type="text"
          placeholder="${el.content || 'Placeholder...'}"
          style="
            ${base}
            height: ${h}px;
            background-color: ${el.fill || '#ffffff'};
            padding: 0 12px;
            font-size: 14px;
            color: ${el.textColor || '#111827'};
            outline: none;
            box-sizing: border-box;
          "
        />
      `

    case 'checkbox':
      return `
        <label style="${base} display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input type="checkbox" style="width: 16px; height: 16px; accent-color: #2348D7;" />
          <span style="font-size: 14px; color: ${el.textColor || '#111827'};">
            ${el.content || 'Option'}
          </span>
        </label>
      `

    default:
      return ''
  }
}

export function exportToHTML(elements, canvasSettings, projectName = 'My Project') {
  const bodyHTML = elements.map(elementToHTML).join('\n')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${projectName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background-color: ${canvasSettings.fill || '#ffffff'};
    }
    .canvas {
      position: relative;
      width: ${canvasSettings.width || 1200}px;
      min-height: ${canvasSettings.height || 900}px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="canvas">
    ${bodyHTML}
  </div>
</body>
</html>`

  // Trigger download
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${projectName.replace(/\s+g/, '-').toLowerCase()}.html`
  a.click()
  URL.revokeObjectURL(url)
}
