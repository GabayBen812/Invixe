import React from 'react';
import Svg, { Path, Circle, Rect, Ellipse, Line, Polygon } from 'react-native-svg';

// Simple SVG parser that can handle basic SVG elements
// This is a basic implementation - for production use, consider using a more robust parser
export function parseSVGCode(svgCode: string): React.ReactElement | null {
  try {
    // Remove XML declaration and comments
    const cleanCode = svgCode
      .replace(/<\?xml[^>]*\?>/g, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .trim();

    // Extract viewBox
    const viewBoxMatch = cleanCode.match(/viewBox="([^"]*)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 100 100';

    // Extract width and height
    const widthMatch = cleanCode.match(/width="([^"]*)"/);
    const heightMatch = cleanCode.match(/height="([^"]*)"/);
    const width = widthMatch ? widthMatch[1] : '100';
    const height = heightMatch ? heightMatch[1] : '100';

    // Parse and render basic SVG elements
    const elements = parseSVGElements(cleanCode);
    
    // Use viewBox for proper scaling, width/height will be controlled by parent container
    return (
      <Svg width="100%" height="100%" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
        {elements}
      </Svg>
    );
  } catch (error) {
    console.error('Error parsing SVG:', error);
    return null;
  }
}

// Parse SVG elements from the code
function parseSVGElements(svgCode: string): React.ReactElement[] {
  const elements: React.ReactElement[] = [];
  
  // Parse rect elements
  const rectMatches = Array.from(svgCode.matchAll(/<rect[^>]*\/?>/g));
  for (const match of rectMatches) {
    const rectProps = parseAttributes(match[0]);
    elements.push(
      <Rect
        key={`rect-${elements.length}`}
        x={rectProps.x || '0'}
        y={rectProps.y || '0'}
        width={rectProps.width || '10'}
        height={rectProps.height || '10'}
        fill={rectProps.fill || '#000000'}
        stroke={rectProps.stroke}
        strokeWidth={rectProps['stroke-width'] || rectProps.strokeWidth}
        rx={rectProps.rx}
        ry={rectProps.ry}
      />
    );
  }

  // Parse circle elements
  const circleMatches = Array.from(svgCode.matchAll(/<circle[^>]*>/g));
  for (const match of circleMatches) {
    const circleProps = parseAttributes(match[0]);
    elements.push(
      <Circle
        key={`circle-${elements.length}`}
        cx={circleProps.cx || '0'}
        cy={circleProps.cy || '0'}
        r={circleProps.r || '5'}
        fill={circleProps.fill || '#000000'}
        stroke={circleProps.stroke}
        strokeWidth={circleProps['stroke-width'] || circleProps.strokeWidth}
      />
    );
  }

  // Parse line elements
  const lineMatches = Array.from(svgCode.matchAll(/<line[^>]*\/?>/g));
  for (const match of lineMatches) {
    const lineProps = parseAttributes(match[0]);
    elements.push(
      <Line
        key={`line-${elements.length}`}
        x1={lineProps.x1 || '0'}
        y1={lineProps.y1 || '0'}
        x2={lineProps.x2 || '10'}
        y2={lineProps.y2 || '10'}
        stroke={lineProps.stroke || '#000000'}
        strokeWidth={lineProps['stroke-width'] || lineProps.strokeWidth || '1'}
      />
    );
  }

  // Parse path elements
  const pathMatches = Array.from(svgCode.matchAll(/<path[^>]*>/g));
  for (const match of pathMatches) {
    const pathProps = parseAttributes(match[0]);
    elements.push(
      <Path
        key={`path-${elements.length}`}
        d={pathProps.d || ''}
        fill={pathProps.fill}
        stroke={pathProps.stroke}
        strokeWidth={pathProps['stroke-width'] || pathProps.strokeWidth}
      />
    );
  }

  // Parse polygon elements
  const polygonMatches = Array.from(svgCode.matchAll(/<polygon[^>]*>/g));
  for (const match of polygonMatches) {
    const polygonProps = parseAttributes(match[0]);
    elements.push(
      <Polygon
        key={`polygon-${elements.length}`}
        points={polygonProps.points || ''}
        fill={polygonProps.fill || '#000000'}
        stroke={polygonProps.stroke}
        strokeWidth={polygonProps['stroke-width'] || polygonProps.strokeWidth}
      />
    );
  }

  // Parse ellipse elements
  const ellipseMatches = Array.from(svgCode.matchAll(/<ellipse[^>]*>/g));
  for (const match of ellipseMatches) {
    const ellipseProps = parseAttributes(match[0]);
    elements.push(
      <Ellipse
        key={`ellipse-${elements.length}`}
        cx={ellipseProps.cx || '0'}
        cy={ellipseProps.cy || '0'}
        rx={ellipseProps.rx || '5'}
        ry={ellipseProps.ry || '5'}
        fill={ellipseProps.fill || '#000000'}
        stroke={ellipseProps.stroke}
        strokeWidth={ellipseProps['stroke-width'] || ellipseProps.strokeWidth}
      />
    );
  }

  return elements;
}

// Parse attributes from an SVG element string
function parseAttributes(elementString: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  
  const attrMatches = Array.from(elementString.matchAll(/(\w+(?:-\w+)*)="([^"]*)"/g));
  for (const match of attrMatches) {
    const key = match[1];
    const value = match[2];
    attributes[key] = value;
  }
  
  return attributes;
}

