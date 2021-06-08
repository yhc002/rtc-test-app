import React from 'react';
import { HashRouter, Route} from 'react-router-dom'
import { render, screen, getRoles } from '@testing-library/react';
import App from './App';
import { Home, Test } from './pages';
import './App.css';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from './modules';


const store = createStore(
  rootReducer,
);

// test('renders learn react link', () => {
//   render(<App />);
//   const linkElement = screen.getByText(/learn react/i);
//   expect(linkElement).toBeInTheDocument();
// });


test('render Home', () => {
  render(
  <Provider store={store}>
    <HashRouter basename="/" hashType="noslash">
      <Route exact path="/" component={Home}/>
    </HashRouter>
  </Provider>
  );
  const plusButton = screen.getByRole("button",{name:'+'});
  const minusButton = screen.getByRole("button",{name:'-'});

  expect(plusButton).toBeInTheDocument();
  expect(minusButton).toBeInTheDocument();
});

test('render Test', () => {
  render(
  <Provider store={store}>
    <HashRouter basename="/" hashType="noslash">
      <Route exact path="/" component={Test}/>
    </HashRouter>
  </Provider>
  );

  const buttons = screen.getAllByRole("button");

  for(let i=0; i<buttons.length; i++) {
    expect(buttons[i]).toBeInTheDocument();
  }
});