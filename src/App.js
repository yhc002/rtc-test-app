import { HashRouter, Route} from 'react-router-dom'
import { Home, Test } from './pages';
import './App.css';

function App() {
  return (
    <HashRouter basename="/" hashType="noslash">
      <Route exact path="/" component={Home}/>
      <Route exact path="/test" component={Test}/>
    </HashRouter>
  );
}

export default App;