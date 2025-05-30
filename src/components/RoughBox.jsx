import React, { useState, useEffect, useRef } from 'react';
import rough from 'roughjs/bundled/rough.esm';

const RoughBox = ({ children, style, className }) => {
    const svgRef = useRef(null);
    const contentRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (contentRef.current) {
            const { width, height } = contentRef.current.getBoundingClientRect();
            setDimensions({ width: width + 40, height: height + 40 });
        }
    }, [children]);

    useEffect(() => {
        if (svgRef.current && dimensions.width > 0) {
            const rc = rough.svg(svgRef.current);
            svgRef.current.innerHTML = '';

            const rect = rc.rectangle(5, 5, dimensions.width - 10, dimensions.height - 10, {
                stroke: '#5C4033',
                strokeWidth: 2,
                roughness: 1.5,
                fill: 'rgba(245, 235, 220, 0.9)',
                fillStyle: 'solid',
            });

            svgRef.current.appendChild(rect);
        }
    }, [dimensions]);

    return (
        <div style={{ position: 'relative', ...style }} className={className}>
            <svg
                ref={svgRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: dimensions.width,
                    height: dimensions.height,
                    pointerEvents: 'none',
                }}
            />
            <div ref={contentRef} style={{ position: 'relative', padding: '20px', zIndex: 1 }}>
                {children}
            </div>
        </div>
    );
};

export { RoughBox }