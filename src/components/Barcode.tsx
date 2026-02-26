import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeProps {
  value: string;
  height?: number;
  displayValue?: boolean;
}

export default function Barcode({ value, height = 60, displayValue = false }: BarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;
    JsBarcode(svgRef.current, value, {
      format: 'CODE128',
      height,
      displayValue,
      margin: 0,
      background: 'transparent',
      lineColor: '#ffffff',
    });
  }, [value, height, displayValue]);

  return <svg ref={svgRef} />;
}
