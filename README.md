# MOHO SolidJS frontend server

## Usage

Those templates dependencies are maintained via [pnpm](https://pnpm.io) via `pnpm up -Lri`.

This is the reason you see a `pnpm-lock.yaml`. That being said, any package manager will work. This file can be safely be removed once you clone a template.

```bash
$ npm install # or pnpm install or yarn install
```

Learn more on the [Solid Website](https://solidjs.com) and come chat with us on our [Discord](https://discord.com/invite/solidjs)

## Available Scripts

In the project directory, you can run:

`npm run dev` or `npm start`

To set the websocket backend url:

`VITE_WEBSOCKET_URL=ws://your-aws-eks-endpoint:8080/ws npm run dev`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>

`npm run build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

You can deploy the `dist` folder to any static host provider (netlify, surge, now, etc.)

## Docker

Build

```
docker build -t moho-fe .
```

Run & stop (locally)

```
# replace 'your-aws-eks-endpoint'
docker run -p 3000:3000 -e VITE_WEBSOCKET_URL=ws://your-aws-eks-endpoint:8080/ws moho-fe

# List running containers
docker ps
# Stop by container id
docker stop abc123def456
```

Initialize Amazon ECR

```
aws ecr create-repository --repository-name moho-fe

# Authenticate Docker to ECR
aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 680324637652.dkr.ecr.eu-central-1.amazonaws.com
```

Push to Amazon ECR

```
docker tag moho-fe:latest 680324637652.dkr.ecr.eu-central-1.amazonaws.com/moho-fe:latest
docker push 680324637652.dkr.ecr.eu-central-1.amazonaws.com/moho-fe:latest
```

Delete Amazon ECR

```
aws ecr delete-repository --repository-name moho-fe --force
aws ecr describe-repositories
```

## Useful links

- [Solid Docs](https://docs.solidjs.com/guides/routing-and-navigation) - routing and navigation page