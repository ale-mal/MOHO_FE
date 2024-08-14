/* @refresh reload */
import { lazy } from 'solid-js';
import { render } from 'solid-js/web';
import { Router, Route } from "@solidjs/router";

import './index.css';
const Home = lazy(() => import('./pages/Home'));
const Game = lazy(() => import('./pages/Game'));
const NotFound = lazy(() => import('./pages/NotFound'));

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => (
  <Router>
    <Route path="/" component={Home} />
    <Route path="/game" component={Game} />
    <Route path="*paramName" component={NotFound} />
  </Router>
), root!);
