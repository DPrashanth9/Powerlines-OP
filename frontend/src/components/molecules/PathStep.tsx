/**
 * PathStep - Molecule component
 * Displays a single step in the path visualization
 */

import React from 'react';
import { Icon } from '../atoms/Icon';
import type { PathNode } from '../../types';

interface PathStepProps {
  node: PathNode;
  index: number;
  isLast: boolean;
  onClick?: () => void;
}

export const PathStep: React.FC<PathStepProps> = ({
  node,
  index,
  isLast,
  onClick,
}) => {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-500">
          <span className="text-sm font-bold text-blue-700">{index + 1}</span>
        </div>
        {!isLast && <div className="w-0.5 h-8 bg-blue-300 my-1" />}
      </div>
      <div
        className={`flex-1 pb-4 ${!isLast ? 'border-b border-gray-200' : ''}`}
        onClick={onClick}
      >
        <div className="flex items-center gap-2 mb-1">
          <Icon type={node.type} size={20} />
          <h4 className="font-medium text-gray-900">{node.name}</h4>
        </div>
        <p className="text-sm text-gray-600">{node.type}</p>
        <p className="text-xs text-gray-500 mt-1">ID: {node.id}</p>
      </div>
    </div>
  );
};
