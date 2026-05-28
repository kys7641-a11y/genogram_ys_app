/**
 * Export the given <svg> element as a downloadable PNG.
 * Computes tight bounding box around content and rasterizes via Canvas.
 */
export const downloadSvgAsPng = async (svgEl, filename = 'genogram.png') => {
  if (!svgEl) throw new Error('SVG element is required');

  const contentGroup = svgEl.querySelector('g');
  const bbox = contentGroup ? contentGroup.getBBox() : svgEl.getBBox();
  const padding = 40;
  const width = Math.max(100, Math.ceil(bbox.width + padding * 2));
  const height = Math.max(100, Math.ceil(bbox.height + padding * 2));

  // Clone SVG so we can normalize viewBox without mutating the live canvas.
  const clone = svgEl.cloneNode(true);
  
  // Embed a styles block inside the cloned SVG so CSS variables and fonts resolve properly in stand-alone export.
  const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  styleEl.textContent = `
    svg {
      --canvas-bg: #f8fafc;
      --node-stroke: #1e293b;
      --node-fill: #ffffff;
      --node-text: #1e293b;
      --node-text-index: #2563eb;
      --grid-color: #cbd5e1;
      --primary-color: #6366f1;
    }
    text {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    /* Hide active selections and bend handles on image export */
    .animate-spin-slow, .bend-handle {
      display: none !important;
    }
  `;
  clone.insertBefore(styleEl, clone.firstChild);

  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', width);
  clone.setAttribute('height', height);
  clone.setAttribute(
    'viewBox',
    `${bbox.x - padding} ${bbox.y - padding} ${width} ${height}`
  );

  // Reset the inner transform so exported image isn't affected by pan/zoom.
  const innerG = clone.querySelector('g');
  if (innerG) innerG.setAttribute('transform', '');

  const svgString = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgString], {
    type: 'image/svg+xml;charset=utf-8',
  });
  const url = URL.createObjectURL(svgBlob);

  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });

    const scale = 2; // retina
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, width, height);

    const pngUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = filename;
    a.click();
  } finally {
    URL.revokeObjectURL(url);
  }
};
