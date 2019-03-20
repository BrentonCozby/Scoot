# Scoot

A single-page application for renting scooters. Built with React, Redux, NodeJS, Express, Postgres and uses the AWS S3 JavaScript SDK and the Google Maps API.

### Features

* 3 different user roles (admin, manager, user), each with different permissions levels
* Custom authentication using NodeJS, bcrypt, jsonwebtoken, and Postgres
* Can use the map to find available scooters within the map bounds
* Admin and manager roles can edit the scooter details through CRUD operations that interact with Postgres through an independent API
* Can filter list of scooters by details such as color and dates available
* Admin users can perform CRUD operations on users

### Technology used

* API created with NodeJS, Express, SQL
* Authentication with bcrypt, and jsonwebtoken (jwt saved in browser local storage)
* PostgreSQL database
* UI created with React; Redux for shared state; React-table for tables
* Google Maps API
* AWS S3 SDK for storing scooter images

### How to start the app

1) Start the PostgreSQL database
2) `node api/index.js` for the API
3) `yarn start` for the UI
4) `yarn test` for the unit tests
