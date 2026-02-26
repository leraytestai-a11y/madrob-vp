import JsBarcode from 'jsbarcode';

const LABEL_WIDTH_MM = 62;
const LABEL_HEIGHT_MM = 29;

function generateBarcodeSvg(value: string): string {
  const svgNs = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNs, 'svg');
  JsBarcode(svg, value, {
    format: 'CODE128',
    height: 48,
    displayValue: false,
    margin: 0,
    background: '#ffffff',
    lineColor: '#000000',
    width: 1.5,
  });
  svg.setAttribute('xmlns', svgNs);
  const serialized = new XMLSerializer().serializeToString(svg);
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(serialized)))}`;
}

function buildLabelHtml(sku: string, serial: string, barcodeDataUrl: string): string {
  const leftLabel = buildSingleLabel(sku, serial, 'LEFT', barcodeDataUrl);
  const rightLabel = buildSingleLabel(sku, serial, 'RIGHT', barcodeDataUrl);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${LABEL_WIDTH_MM}mm;
    background: #fff;
  }
  @page {
    size: ${LABEL_WIDTH_MM}mm ${LABEL_HEIGHT_MM}mm;
    margin: 0;
  }
  .label {
    width: ${LABEL_WIDTH_MM}mm;
    height: ${LABEL_HEIGHT_MM}mm;
    display: flex;
    align-items: center;
    padding: 1.5mm 2mm;
    page-break-after: always;
    overflow: hidden;
  }
  .label:last-child {
    page-break-after: auto;
  }
  .barcode-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5mm;
    min-width: 0;
  }
  .sku-text {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 6pt;
    font-weight: bold;
    letter-spacing: 0.5px;
    color: #000;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  .barcode-img {
    width: 100%;
    max-width: 44mm;
    height: 14mm;
    object-fit: fill;
  }
  .serial-text {
    font-family: 'Courier New', Courier, monospace;
    font-size: 5.5pt;
    color: #000;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  .divider {
    width: 0.3mm;
    background: #000;
    height: 20mm;
    margin: 0 2mm;
    flex-shrink: 0;
  }
  .side-col {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 10mm;
    flex-shrink: 0;
  }
  .side-text {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 14pt;
    font-weight: 900;
    color: #000;
    letter-spacing: 1px;
  }
  @media print {
    html, body {
      width: ${LABEL_WIDTH_MM}mm;
    }
  }
</style>
</head>
<body>
${leftLabel}
${rightLabel}
</body>
</html>`;
}

function buildSingleLabel(sku: string, serial: string, side: string, barcodeDataUrl: string): string {
  return `<div class="label">
  <div class="barcode-col">
    <span class="sku-text">${escapeHtml(sku)}</span>
    <img class="barcode-img" src="${barcodeDataUrl}" alt="barcode" />
    <span class="serial-text">${escapeHtml(serial)}</span>
  </div>
  <div class="divider"></div>
  <div class="side-col">
    <span class="side-text">${side[0]}</span>
  </div>
</div>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function printLabels(sku: string, serial: string): Promise<void> {
  return new Promise((resolve) => {
    const barcodeDataUrl = generateBarcodeSvg(serial);
    const html = buildLabelHtml(sku, serial, barcodeDataUrl);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = `${LABEL_WIDTH_MM}mm`;
    iframe.style.height = `${LABEL_HEIGHT_MM * 2}mm`;
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      resolve();
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
          resolve();
        }, 2000);
      }, 300);
    };
  });
}

export function getLabelPreviewHtml(sku: string, serial: string): string {
  const barcodeDataUrl = generateBarcodeSvg(serial);
  return buildLabelHtml(sku, serial, barcodeDataUrl);
}
