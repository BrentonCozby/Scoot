jest.mock('react-router-dom')

import React from 'react';
import ReactDOM from 'react-dom';
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
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
})
