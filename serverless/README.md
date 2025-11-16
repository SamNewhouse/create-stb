# Serverless Typescript Boilerplate

Minimalist project template to jump start a Serverless application in TypeScript.

## Keys features

The current Serverless Starter Kit adds a light layer on top of the Serverless framework with modern JavaScript tools:

- **TypeScript** Support.
- **Offline** mode
- Formatting with Prettier to enforce a consistent code style.

## Services

Currently, the boilerplate is built and tested on AWS using the following services.

- AWS Lambda

## Quick start

```
npm install
npm run offline
```

### Deployment

Make sure you have AWS Cli configured

```bash
npm run deploy
```

## Serverless plugins

- [serverless-offline](https://github.com/dherault/serverless-offline): run your services offline for e.g. testing
