# Wish Genie

It's live! [wish-genie.fly.dev](https://wish-genie.fly.dev/)

## What is the project?

Wish Genie is a web app where you can share a list of items that you have been wishing for, so that people can gift the item for you 🎁

## What is the tech stack?

This project is built using Typescript, EJS, Express, MongoDB.

## How do I set it up locally?

### Prerequisites

#### Install [Node](https://nodejs.org/en/).

If the installation was successful, you should see the installed version with this command:

    $ node -v
    v18.15.0

    $ npm -v
    9.5.0

#### Install [pnpm](https://pnpm.io/installation)

Install pnpm using npm

    $ npm install -g pnpm

If the installation was successful, you should see the installed version with this command:

    $ pnpm -v
    8.1.1

### Installation

    $ git clone https://github.com/nadinda/wish-genie
    $ cd wish-genie
    $ pnpm install

### Environment Variables

Create .env file in the `root` folder

    DEV_HOST=localhost
    DEV_PORT=3000
    APP_URL=http://localhost:3000
    MONGO_USER=
    MONGO_PASS=
    MONGO_URL=MONGO_URL=mongodb+srv://<yourusername>:<yourpassword>@cluster.server.mongodb.net/?retryWrites=true&w=majority
    SESSION_SECRET= #put any random string
    NEW_USER_DEFAULT_PASSWORD= #another random string

### Running the project

    $ pnpm run dev:server
