import React, { useState } from 'react';

/**
 * Tooltip 컴포넌트
 *
 * 사용법:
 *   <Tooltip label="버튼 이름" position="right">
 *     <button>...</button>
 *   </Tooltip>
 *
 * position: "right" | "left" | "top" | "bottom"  (기본값: "right")
 */
export const Tooltip = ({ label, children, position = 'right' }) => {
  const [visible, setVisible] = useState(false);

  const positionClasses = {
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  };

  const arrowClasses = {
    right:  'right-full top-1/2 -translate-y-1/2 border-r-slate-800 border-y-transparent border-l-transparent border-4',
    left:   'left-full top-1/2 -translate-y-1/2 border-l-slate-800 border-y-transparent border-r-transparent border-4',
    top:    'top-full left-1/2 -translate-x-1/2 border-t-slate-800 border-x-transparent border-b-transparent border-4',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 border-x-transparent border-t-transparent border-4',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && label && (
        <div
          className={`absolute z-50 pointer-events-none ${positionClasses[position]}`}
        >
          {/* 화살표 */}
          <span
            className={`absolute border ${arrowClasses[position]}`}
            style={{ borderStyle: 'solid' }}
          />
          {/* 라벨 박스 */}
          <span className="whitespace-nowrap bg-slate-800 text-white text-xs font-medium px-2 py-1 rounded-md shadow-lg">
            {label}
          </span>
        </div>
      )}
    </div>
  );
};
