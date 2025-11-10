import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [status, setStatus] = useState<string>('Unknown');

  useEffect(() => {
    fetch('/api/status')
      .then(response => response.json())
      .then(data => setStatus(data.status))
      .catch(error => {
        console.error('Error fetching status:', error);
        setStatus('Error');
      });
  }, []);

  return (
    <div>
      <h1>Server Status: {status}</h1>
    </div>
  );
}

export default App
