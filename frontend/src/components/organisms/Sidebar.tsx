/**
 * Sidebar - Organism component
 * Sidebar showing component details and path
 */

import React from 'react';
import { ComponentCard } from '../molecules/ComponentCard';
import { PathStep } from '../molecules/PathStep';
import { Button } from '../atoms/Button';
import type { Component, PathToSource } from '../../types';

interface SidebarProps {
  components: Component[];
  selectedComponent: Component | null;
  path: PathToSource | null;
  loading: boolean;
  onComponentSelect: (component: Component | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  components,
  selectedComponent,
  path,
  loading,
  onComponentSelect,
}) => {
  return (
    <div className="w-80 bg-white shadow-lg flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold text-gray-900">Power Grid Components</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading components...</div>
        ) : (
          <div className="space-y-2">
            {components.map((component) => (
              <ComponentCard
                key={component.id}
                component={component}
                selected={selectedComponent?.id === component.id}
                onClick={() => onComponentSelect(component)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedComponent && (
        <div className="border-t p-4 bg-gray-50">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Selected Component</h3>
            <Button variant="secondary" onClick={() => onComponentSelect(null)}>
              Clear
            </Button>
          </div>
          <ComponentCard component={selectedComponent} />
        </div>
      )}

      {path && path.path.length > 0 && (
        <div className="border-t p-4 bg-blue-50 max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-3">Path to Source</h3>
          <div className="space-y-2">
            {path.path.map((node, index) => (
              <PathStep
                key={node.id}
                node={node}
                index={index}
                isLast={index === path.path.length - 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
