Messaging Microservice
A scalable messaging microservice built with NestJS, MongoDB, Kafka, and Elasticsearch for real-time message ingestion, indexing, and full-text search.

Features
Persist messages in MongoDB with optimized indexes

Publish message events to Kafka for asynchronous processing

Consume Kafka events to index messages into Elasticsearch

Full-text search on messages with fast retrieval

Docker Compose for easy local development environment setup

Follows SOLID principles and clean architecture patterns

Tech Stack
Backend: NestJS (TypeScript)

Database: MongoDB

Messaging: Apache Kafka + Zookeeper

Search: Elasticsearch

Containerization: Docker, Docker Compose

Getting Started
Prerequisites
Docker & Docker Compose

Node.js (v16+) & npm/yarn

vm.max_map_count ≥ 262144 (Linux/macOS)

bash
Copy
Edit
sudo sysctl -w vm.max_map_count=262144
Clone & Install
bash
Copy
Edit
git clone https://github.com/your-org/messaging-service.git
cd messaging-service
npm install
Environment Variables
Create .env with:

env
Copy
Edit
KAFKA_BROKER=localhost:9092
KAFKA_CONSUMER_GROUP=message-indexer
KAFKA_TOPIC=message_created
MONGODB_URI=mongodb://localhost:27017/messaging
ELASTICSEARCH_NODE=http://localhost:9200
Run Services
bash
Copy
Edit
docker-compose up -d
Start Application
bash
Copy
Edit
npm run start:dev
Architecture Overview
mermaid
Copy
Edit
flowchart LR
  A[Client/API] --> B[MongoDB]
  B -->|Publish message| C[Kafka Topic: message_created]
  C --> D[Kafka Consumer (NestJS)]
  D --> E[Elasticsearch Indexing]
  E -->|Full-text Search| A
Usage
Messages saved via API are stored in MongoDB

Kafka publishes message creation events

Kafka consumer indexes messages to Elasticsearch for search

Search queries hit Elasticsearch for fast, scalable results

MongoDB Indexes
js
Copy
Edit
db.messages.createIndex({ conversationId: 1, timestamp: -1 });
db.messages.createIndex({ content: "text" });
Testing
Run unit and integration tests with:

bash
Copy
Edit
npm run test
Security & Validation
Input sanitization with sanitize-html

Basic authentication can be added as needed

Secure Kafka & Elasticsearch in production environments

Troubleshooting
Ensure Elasticsearch vm.max_map_count is set properly

Start Zookeeper before Kafka

Check container logs with docker-compose logs [service]

