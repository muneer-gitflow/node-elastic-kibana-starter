const express = require('express');
const winston = require('winston');
const ecsFormat = require('@elastic/ecs-winston-format');
const { v4: uuidv4 } = require('uuid');
const http = require('http');

const app = express();
const port = 3000;

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    ecsFormat({ convertReqRes: true }),
    winston.format.metadata()
  ),
  defaultMeta: { service: 'user-service', application: 'elk-logging-app' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.Http({
      host: 'logstash',
      port: 5000,
      path: '/',
      onError: (error) => {
        console.error('Error sending log to Logstash:', error);
      }
    })
  ]
});

// Middleware to add correlation ID and log all requests
app.use((req, res, next) => {
  const correlationId = uuidv4();
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);

  // Capture the original res.json function
  const originalJson = res.json;
  res.json = function(...args) {
    // Log the response status
    logger.info('Response sent', { 
      method: req.method, 
      path: req.path, 
      statusCode: res.statusCode,
      correlationId 
    });
    originalJson.apply(this, args);
  };

  next();
});

// Define a route
app.get('/', (req, res) => {
  res.json({ hello: 'world', correlationId: req.correlationId });
});

// Define an error route
app.get('/error', (req, res, next) => {
  const errorTypes = ['ValidationError', 'AuthenticationError', 'DatabaseError', 'NetworkError'];
  const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
  
  logger.error('An error occurred', { 
    path: '/error', 
    correlationId: req.correlationId,
    errorType: randomError,
    errorMessage: `This is a test ${randomError}`
  });
  next(new Error(`This is a test ${randomError}`));
});

// Echo endpoint
app.get('/echo', (req, res) => {
  const params = req.query;
  logger.info('Echo request received', { 
    params: JSON.stringify(params),  // Stringify the params object
    correlationId: req.correlationId 
  });
  res.json({ echo: params, correlationId: req.correlationId });
});

// New endpoint to simulate 400 errors
app.get('/bad-request', (req, res) => {
  res.status(400).json({ error: 'Bad Request', correlationId: req.correlationId });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error caught in middleware', { 
    error: err.message, 
    correlationId: req.correlationId 
  });
  res.status(500).json({ 
    error: 'Internal Server Error', 
    correlationId: req.correlationId 
  });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  logger.info('Server started', { port: port });
});

// Add this function at the end of the file
setInterval(() => {
  const options = {
    hostname: 'logstash',
    port: 5000,
    path: '/',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Logstash health check status: ${res.statusCode}`);
  });

  req.on('error', (error) => {
    console.error('Error checking Logstash health:', error);
  });

  req.end();
}, 5000);