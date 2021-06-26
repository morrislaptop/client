import React from 'react';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import GameLandingPage from './GameLandingPage';
import dfstyles from '../Styles/dfstyles';
import { createGlobalStyle } from 'styled-components';

function App() {
  return (
    <>
      <GlobalStyle />
      <Router>
        <Switch>
          <Route path='/' component={GameLandingPage} />
        </Switch>
      </Router>
    </>
  );
}

const GlobalStyle = createGlobalStyle`
@import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@300&display=swap');

body {
  color: ${dfstyles.colors.text};
  width: 100vw;
  min-height: 100vh;
  background-color: ${dfstyles.colors.backgrounddark};
  font-family: 'Inconsolata', monospace;
  font-weight: 300;
}
`;

export default App;
