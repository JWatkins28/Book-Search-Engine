import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// CHANGED THIS added: (createHttpLink)
import { ApolloClient, ApolloProvider, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
// ---
import SearchBooks from './pages/SearchBooks';
import SavedBooks from './pages/SavedBooks';
import Navbar from './components/Navbar';

// ADDED THIS
const httpLink = createHttpLink({
  uri: '/graphql',
});

// AND THIS
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// EDITED THIS
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  request: (operation) => {
    const token = localStorage.getItem('id_token')

    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      }
    })
  },
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
    <Router>
      <>
        <Navbar />
        <Routes>
          <Route 
            exact path='/' 
            element={<SearchBooks />} 
          />
          <Route 
            exact path='/saved' 
            element={<SavedBooks />} 
          />
          <Route 
            path='*'
            element={<h1 className='display-2'>Wrong page!</h1>}
          />
        </Routes>
      </>
    </Router>
    </ApolloProvider>
  );
}

export default App;
