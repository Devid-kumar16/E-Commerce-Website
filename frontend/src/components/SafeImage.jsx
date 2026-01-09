import React, { useEffect, useState } from 'react';


export default function SafeImage({ candidates = [], alt = '', className = '', width, height, ...rest }) {
    const [idx, setIdx] = useState(0);
    const list = Array.isArray(candidates) ? candidates : [candidates];
    const src = list[idx] || '';
    useEffect(() => setIdx(0), [candidates]);
    return (
        <img
            src={encodeURI(src || '')}
            alt={alt}
            className={className}
            width={width}
            height={height}
            onError={() => { if (idx < list.length - 1) setIdx(i => i + 1); }}
            {...rest}
        />
    );
}

