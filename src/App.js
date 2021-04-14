import { BrowserRouter, Route} from 'react-router-dom'
import { Home, Test } from './pages';

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Route exact path="/" component={Home}/>
      <Route exact path="/test" component={Test}/>
    </BrowserRouter>
  );
}

export default App;