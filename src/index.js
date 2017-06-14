import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import attachFastClick from 'fastclick';
import OnlineApp from './components/OnlineApp.js';
import OfflineApp from './components/OfflineApp.js';
// ========================================


if (window.location.pathname === '/')
  ReactDOM.render(
    <OfflineApp />,
    document.getElementById('root')
  );
else
  ReactDOM.render(
    <OnlineApp />,
    document.getElementById('root')
  );

attachFastClick.attach(document.body);
