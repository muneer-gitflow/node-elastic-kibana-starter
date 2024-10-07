# ELK Stack Logging App

This project demonstrates a simple Node.js application using Express and Winston for logging, integrated with the ELK (Elasticsearch, Logstash, Kibana) stack for log management and visualization. It includes a correlation ID for each request to facilitate log tracing and features auto-reloading for development.

## Prerequisites

- Docker
- Docker Compose

## Getting Started

1. Clone this repository:
   ```
   git clone <repository-url>
   cd elk-logging-app
   ```

2. Build and start the containers:
   ```
   docker-compose up --build
   ```

3. The application and ELK stack will start. You can access:
   - The Node.js app at `http://localhost:3000`
   - Kibana at `http://localhost:5601`
   - Elasticsearch at `http://localhost:9200`

## Development with Auto-Reloading

The application is set up to auto-reload when changes are made to the source files. This means you can edit the files in the `src` directory, and the changes will be immediately reflected in the running application without needing to rebuild or restart the containers.

To see this in action:
1. Make a change to `src/app.js`
2. Save the file
3. The application will automatically restart with your changes

This feature significantly speeds up the development process.

## Testing the Application

1. To test the default route, visit `http://localhost:3000` in your browser or use curl:
   ```
   curl -i http://localhost:3000
   ```

2. To test the error route, visit `http://localhost:3000/error` or use curl:
   ```
   curl -i http://localhost:3000/error
   ```

3. To test the echo endpoint, use curl with some URL parameters:
   ```
   curl -i "http://localhost:3000/echo?param1=value1&param2=value2"
   ```
   This will return the parameters as JSON and log them to the ELK stack.

Note: The `-i` flag in curl commands will show the response headers, including the `X-Correlation-ID`.

## Configuring Kibana

1. Open Kibana by navigating to `http://localhost:5601` in your web browser.

2. In Kibana, go to "Management" > "Stack Management" > "Index Patterns".

3. Click "Create index pattern".

4. Enter `app-logs-*` as the index pattern name and click "Next step".

5. Select `@timestamp` as the Time field and click "Create index pattern".

6. Go to the "Discover" page in the main Kibana menu to view your logs.

## Viewing Logs

1. In Kibana, go to the "Discover" page.

2. Select the `app-logs-*` index pattern if it's not already selected.

3. You should see the logs from your application, including the echo endpoint logs. You can use Kibana's search and filter capabilities to analyze your logs.

4. To find logs for a specific request, you can use the search bar in Kibana and enter: `fields.correlationId: "<correlation-id-value>"`

## Project Structure

- `src/app.js`: The main application file containing the Express server and Winston logger configuration.
- `Dockerfile`: Defines the Docker image for the Node.js application.
- `docker-compose.yml`: Orchestrates the entire stack, including the app, Elasticsearch, Logstash, and Kibana.
- `logstash.conf`: Configuration file for Logstash, defining how logs are processed and sent to Elasticsearch.
- `.gitignore`: Specifies intentionally untracked files to ignore.

## Customizing the Application

To add new routes or modify existing ones, edit the `src/app.js` file. The changes will be automatically applied due to the auto-reloading feature. If you need to add new dependencies or make changes that require a rebuild:

```
docker-compose down
docker-compose up --build
```

## Troubleshooting

If you're having issues with the index pattern not showing up in Kibana, try the following steps:

1. Ensure all services are running:
   ```
   docker-compose ps
   ```

2. Check Elasticsearch is receiving data:
   ```
   curl http://localhost:9200/_cat/indices
   ```
   You should see indices starting with "app-logs-".

3. If no indices are present, check Logstash logs:
   ```
   docker-compose logs logstash
   ```
   Look for any error messages or confirmation that logs are being processed.

4. Test the application by making a few requests:
   ```
   curl http://localhost:3000
   curl http://localhost:3000/error
   ```

5. Wait a few moments and check Elasticsearch indices again.

6. If indices are present but not showing in Kibana, try refreshing the page or restarting Kibana:
   ```
   docker-compose restart kibana
   ```

7. If issues persist, check the logs of all services:
   ```
   docker-compose logs
   ```
# node-elastic-kibana-starter
