import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import attachFastClick from 'fastclick';
import OnlineApp from './components/OnlineApp.js'
// ========================================

ReactDOM.render(
  <OnlineApp />,
  document.getElementById('root')
);
attachFastClick.attach(document.body);
