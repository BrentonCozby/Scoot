import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import App from './App';

describe('App', () => {
  beforeEach(() => {
    window.localStorage = {
      storage: {},
      setItem: function (key, value) {
        this.storage[key] = value
      },
      getItem: function (key, value) {
        return this.storage[key]
      }
    }
  })

  it('renders without crashing', () => {
    const history = createMemoryHistory()
    const div = document.createElement('div');

    ReactDOM.render(
      <Router history={history}>
        <App />
      </Router>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
})
