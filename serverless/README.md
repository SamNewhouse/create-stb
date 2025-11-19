# create-ntb

## Serverless TypeScript Boilerplate by Sam Newhouse

A production-ready serverless application template using TypeScript, AWS Lambda, and DynamoDB.

## Features

- **TypeScript** - Full TypeScript support with strict type checking
- **Local Development** - Run and test locally with serverless-offline and local DynamoDB
- **AWS Integration** - Pre-configured for AWS Lambda and DynamoDB
- **Code Quality** - Prettier formatting for consistent code style
- **Docker Support** - Local DynamoDB via Docker Compose
- **Environment Configuration** - Environment variables with .env support

## Tech Stack

- **Runtime**: Node.js 20.x
- **Language**: TypeScript
- **Cloud Provider**: AWS
- **Services**: Lambda, DynamoDB, API Gateway
- **Framework**: Serverless Framework

## Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker (for local DynamoDB)
- AWS CLI (configured for deployment)

## Quick Start

### Install Dependencies

```bash
npm install
```

### Start Local Development

```bash
# Start local DynamoDB
docker-compose up -d

# Run serverless offline
npm run offline
```

Your API will be available at `http://localhost:3000`

### Environment Setup

Copy the example environment file and configure:

```bash
cp .env.example .env
```

## Available Scripts

- `npm run offline` - Start local development server with serverless-offline
- `npm run build` - Compile TypeScript to JavaScript
- `npm run deploy` - Deploy to AWS
- `npm run format` - Format code with Prettier

## Project Structure

```bash
src/
├── handlers/       \# Lambda handlers
└── utils/          \# Utility functions
serverless.yml      \# Serverless configuration
tsconfig.json       \# TypeScript configuration
docker-compose.yml  \# Local DynamoDB setup
.env.example        \# Environment variables template
```

## Deployment

Ensure your AWS CLI is configured with appropriate credentials:

```bash
aws configure
```

Deploy to AWS:

```bash
npm run deploy
```

Deploy to specific stage:

```bash
npm run deploy -- --stage production
```

## Serverless Plugins

- **[serverless-offline](https://github.com/dherault/serverless-offline)** - Emulate AWS Lambda and API Gateway locally

## Local DynamoDB

The project includes Docker Compose configuration for local DynamoDB:

```bash
# Start
docker-compose up -d

# Stop
docker-compose down
```

DynamoDB Admin UI available at: `http://localhost:8001`

## Contributing

Contributions are welcome! Please follow the existing code style and run Prettier before submitting.

## License

MIT

---

**Thank you for using [create-stb](https://github.com/SamNewhouse/create-stb)!** 🚀

If you find this template helpful, please consider giving it a star on GitHub.
