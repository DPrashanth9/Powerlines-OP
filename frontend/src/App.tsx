import { OverlandParkMap } from './components/organisms/OverlandParkMap';
// import { TestMap } from './TestMap'; // Uncomment to test with simple map
import './App.css';

function App() {
  console.log('🔵 App component rendering...');
  return (
    <div className="App h-screen w-screen overflow-hidden" style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <OverlandParkMap className="w-full h-full" />
      {/* <TestMap /> Uncomment to test with simple map */}
    </div>
  );
}

export default App;
