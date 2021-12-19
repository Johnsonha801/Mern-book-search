const express = require('express');
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');

// Import schemas 
const { typeDefs, resolvers } = require('./schemas');

// Import ApolloServer - addition
const { ApolloServer } = require('apollo-server-express');

// Imprt Auth Middleware for ApolloServer - addition
const { authMiddleware } = require('./utils/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Apollo server - addition
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
});

// Use app as middleware in ApolloServer - addition
server.applyMiddleware({ app });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Send all routes to index.html - addition
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Comment out routes
// app.use(routes);

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});
