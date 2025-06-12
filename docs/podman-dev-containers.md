# MongoDB Development Environment Documentation using Podman

This guide explains how to run a local development MongoDB container using Podman and restore data from a dump.

## Prerequisites: 
### Installing Podman

You must install Podman and `podman-compose` to run this container. The easiest way to get started is by installing [Podman Desktop](https://podman-desktop.io/), which includes Podman and supports Compose-like functionality.

- **[For Mac](https://podman-desktop.io/downloads)**  
- **[For Windows](https://podman-desktop.io/downloads)**  
- **For Linux**: Install via your package manager (e.g., `sudo apt install podman podman-compose` on Ubuntu, or `sudo dnf install podman podman-compose` on Fedora)

After installation, verify Podman is running by opening a terminal and typing:

    podman --version

This should return something like `podman version 5.2.2`. Then, verify `podman-compose`:

    podman-compose --version

Expect a response like `podman-compose version 1.0.6`.


### .env.local. file
 Ensure you have env file in the format:
 ```env
 AUTH_SECRET="" # Auth secret
MONGODB_URI=mongodb://yourUsername:yourPassword@localhost:27017/test?authSource=admin
AWS_ACCESS_KEY_ID="" # Access key
AWS_SECRET_ACCESS_KEY="" # Access key secret
AWS_REGION="eu-west-1"
```
With the correct parameters
## Starting the Development Environment

To start the MongoDB development environment:

    podman-compose -f podman-compose.dev.yml up -d

This will start both MongoDB and Mongo Express containers. MongoDB will be available on port 27017, and Mongo Express (a web-based MongoDB admin interface) will be available at http://localhost:8081.

Ensure your `podman-compose.dev.yml` matches this configuration:

**Note: Using podman the volumes must be adjusted from the original .yml file**

```yaml
version: "3.7"
services:
  db:
    container_name: mongodb
    image: mongo:6
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=pass
      - MONGO_INITDB_DATABASE=auth
    networks:
      - mongo-compose-network
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
  mongo-express:
    container_name: mongo-express
    image: mongo-express
    depends_on:
      - db
    networks:
      - mongo-compose-network
    environment:
      - ME_CONFIG_MONGODB_SERVER=mongodb
      - ME_CONFIG_MONGODB_ADMINUSERNAME=admin
      - ME_CONFIG_MONGODB_ADMINPASSWORD=pass
      - ME_CONFIG_BASICAUTH_USERNAME=admin
      - ME_CONFIG_BASICAUTH_PASSWORD=pass
    ports:
      - "8081:8081"
volumes:
  mongo_data:
networks:
  mongo-compose-network:
    driver: bridge
```

## Restoring Data from a Dump

### 1. Copy the Dump to the Container

First, copy your MongoDB dump folder to the running MongoDB container:

    podman cp /path/to/your/dump mongodb:/dump

Replace `/path/to/your/dump` with the actual path to your dump folder on your local machine. The dump file can be found on discord 

### 2. Restore the Data

Execute the `mongorestore` command inside the container:

    podman exec -it mongodb mongorestore --username admin --password pass /dump

## Accessing the Database

Using npm run dev, the website should now allow you to connect to the database

### Via Mongo Express

Access the web interface at <http://localhost:8081>:

- **Username**: `admin`
- **Password**: `pass`


## Stopping the Environment

To stop the containers:

    podman-compose -f podman-compose.dev.yml down

## Container Details

- **MongoDB**:
  - **Container Name**: `mongodb`
  - **Port**: `27017`
  - **Username**: `admin`
  - **Password**: `pass`

- **Mongo Express**:
  - **Container Name**: `mongo-express`
  - **Port**: `8081`
  - **Username**: `admin`
  - **Password**: `pass`

---

### Key Differences from Docker
- **Podman Instead of Docker**: Commands use `podman` and `podman-compose` instead of `docker` and `docker-compose`.
- **Named Volume**: Uses `mongo_data` instead of a host bind mount (`./data:/data/db`) to avoid permission issues in Podman.
- **Verification**: Added `podman-compose --version` to ensure the Compose tool is installed.

### Usage Notes
- Run all commands from the directory containing `podman-compose.dev.yml` (e.g., `~/Documents/Year3/CS3099/podman`).
- If `mongodb` doesn’t start, check logs with `podman logs mongodb` and ensure port `27017` isn’t in use (`netstat -tuln | grep 27017`).