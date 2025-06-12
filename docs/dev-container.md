# MongoDB Development Environment Documentation

This guide explains how to run the local development MongoDB container and restore data from a dump.

## Prerequisites: Installing Docker Desktop

You must install docker and docker-compose to run this container. The easiest way to install the required packages is by installing [Docker Desktop](https://docs.docker.com/desktop/)

\[[For Mac](https://docs.docker.com/desktop/setup/install/mac-install/)\] \[[For Windows](https://docs.docker.com/desktop/setup/install/windows-install/)\]

After installation, verify Docker is running by opening a terminal/command prompt and typing:

    docker --version

## Starting the Development Environment

To start the MongoDB development environment:

    docker-compose -f docker-compose.dev.yml up -d

This will start both MongoDB and Mongo Express containers. MongoDB will be available on port 27017, and Mongo Express (a web-based MongoDB admin interface) will be available at <http://localhost:8081>.

## Restoring Data from a Dump

### 1. Copy the Dump to the Container

First, copy your MongoDB dump folder to the running MongoDB container:

    docker cp /path/to/your/dump mongodb:/dump

Replace `/path/to/your/dump` with the actual path to your dump folder on your local machine.

### 2. Restore the Data

Next, execute the mongorestore command inside the container:

    docker exec -it mongodb mongorestore --username admin --password pass /dump

For a specific database:

    docker exec -it mongodb mongorestore --username admin --password pass --db your_database_name /dump/your_database_name

## Accessing the Database

### Via Mongo Express

Access the web interface at <http://localhost:8081>

- Username: admin
- Password: pass

### Via MongoDB CLI

Connect to the MongoDB shell:

    docker exec -it mongodb mongosh --username admin --password pass

## Stopping the Environment

To stop the containers:

    docker-compose -f docker-compose.dev.yml down

To stop and remove volumes (this will delete all data):

    docker-compose -f docker-compose.dev.yml down -v

## Container Details

- MongoDB:

  - Container name: mongodb
  - Port: 27017
  - Username: admin
  - Password: pass

- Mongo Express:
  - Container name: mongo-express
  - Port: 8081
  - Username: admin
  - Password: pass
