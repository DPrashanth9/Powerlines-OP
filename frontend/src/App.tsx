import { useState } from 'react';
import { MapView } from './components/organisms/MapView';
import { Sidebar } from './components/organisms/Sidebar';
import { useComponents, useComponent, usePathToSource } from './hooks/useComponents';
import type { Component } from './types';
import './App.css';

function App() {
  const { components, loading: componentsLoading } = useComponents();
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  
  const { component: selectedComponent } = useComponent(selectedComponentId);
  const { path, loading: pathLoading } = usePathToSource(selectedComponentId);

  const handleComponentClick = (component: Component) => {
    setSelectedComponentId(component.id);
  };

  const handleComponentSelect = (component: Component | null) => {
    setSelectedComponentId(component?.id || null);
  };

  return (
    <div className="App h-screen flex overflow-hidden">
      <Sidebar
        components={components}
        selectedComponent={selectedComponent || null}
        path={path}
        loading={componentsLoading || pathLoading}
        onComponentSelect={handleComponentSelect}
      />
      <div className="flex-1 relative">
        <MapView
          components={components}
          selectedComponent={selectedComponent || null}
          path={path}
          onComponentClick={handleComponentClick}
        />
      </div>
    </div>
  );
}

export default App;
