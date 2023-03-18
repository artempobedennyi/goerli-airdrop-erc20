import { ChakraProvider } from "@chakra-ui/react";
import React, { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorker from './serviceWorker';
import Web3 from 'web3';
import { Web3ReactProvider } from "@web3-react/core";
import theme from "./theme";

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

const getLibrary = (provider) => {
  const library = new Web3(provider);
  library.pollingInterval = 8000; // frequency provider is polling
  return library;
};

root.render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <App />
      </Web3ReactProvider>
    </ChakraProvider>
  </StrictMode>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
