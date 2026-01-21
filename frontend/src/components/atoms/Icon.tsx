/**
 * Icon - Atomic component
 * SVG icons for component types
 */

import React from 'react';
import { ComponentType } from '../../types';

interface IconProps {
  type: ComponentType | string;
  size?: number;
  className?: string;
}

const iconMap: Record<string, string> = {
  PowerGeneration: '⚡',
  StepUpSubstation: '🔌',
  TransmissionLine: '📡',
  TransmissionSubstation: '🏭',
  DistributionSubstation: '⚙️',
  DistributionLine: '📶',
  LocalTransformer: '🔧',
  ServiceDrop: '🔗',
  Building: '🏠',
};

export const Icon: React.FC<IconProps> = ({ type, size = 24, className = '' }) => {
  const icon = iconMap[type] || '⚫';

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ fontSize: `${size}px`, width: `${size}px`, height: `${size}px` }}
      title={type}
    >
      {icon}
    </span>
  );
};
