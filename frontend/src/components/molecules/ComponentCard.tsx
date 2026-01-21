/**
 * ComponentCard - Molecule component
 * Displays component information
 */

import React from 'react';
import { Icon } from '../atoms/Icon';
import { Badge } from '../atoms/Badge';
import type { Component } from '../../types';

interface ComponentCardProps {
  component: Component;
  onClick?: () => void;
  selected?: boolean;
}

export const ComponentCard: React.FC<ComponentCardProps> = ({
  component,
  onClick,
  selected = false,
}) => {
  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <Icon type={component.type} size={32} />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{component.name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <Badge>{component.type}</Badge>
            <span className="text-xs text-gray-500">ID: {component.id}</span>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            📍 {component.longitude.toFixed(4)}, {component.latitude.toFixed(4)}
          </div>
        </div>
      </div>
    </div>
  );
};
