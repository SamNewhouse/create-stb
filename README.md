# create-ntb

## Serverless TypeScript Boilerplate by Sam Newhouse

**A CLI to instantly scaffold a production-ready Serverless TypeScript Boilerplate.**

[![npm version](https://img.shields.io/npm/v/create-stb.svg)](https://www.npmjs.com/package/create-stb)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Features

- **Fast Setup** - Scaffold a complete serverless app in seconds
- **TypeScript Ready** - Full TypeScript support with AWS Lambda and DynamoDB
- **Zero Config** - Automatically updates project name and installs dependencies
- **Production Ready** - Includes all configs, sample handlers, and best practices
- **Local Development** - Docker Compose setup for local DynamoDB testing
- **Modern Stack** - Node.js 20.x, Serverless Framework, and AWS services

---

## 📦 Quick Start

### Using npx (Recommended)

```bash
npx create-stb my-app
```

### Global Installation

```bash
npm install -g create-stb
create-stb my-app
```

---

## 🛠 Usage

```bash
npx create-stb <project-name>
```

This creates a new directory with your project name in the current folder.

### Example

```bash
npx create-stb <project-name>
cd pineapple-api
npm run offline
```

Your serverless API will be running at `http://localhost:3000`

---

## 🧩 What's Included

### Project Structure

- ✅ **Serverless Configuration** - Pre-configured `serverless.yml` for AWS Lambda
- ✅ **TypeScript Setup** - Ready-to-use TypeScript configuration
- ✅ **DynamoDB Integration** - Local DynamoDB with Docker Compose
- ✅ **Sample Handlers** - Example Lambda functions to get started
- ✅ **Development Scripts** - `offline`, `build`, `deploy` commands
- ✅ **Code Quality** - Prettier configuration for consistent formatting
- ✅ **Environment Config** - `.env.example` for environment variables

### Tech Stack

- **Runtime**: Node.js 20.x
- **Language**: TypeScript
- **Framework**: Serverless Framework
- **Cloud**: AWS (Lambda, DynamoDB, API Gateway)
- **Local Dev**: serverless-offline, Docker

---

## 📋 Requirements

- Node.js >= 20.0.0
- npm >= 10.0.0
- Git (for cloning the template)

---

## 🔗 Links

- **[GitHub Repository](https://github.com/SamNewhouse/create-stb)**
- **[NPM Package](https://www.npmjs.com/package/create-stb)**
- **[Report Issues](https://github.com/SamNewhouse/create-stb/issues)**
- **[Template Repository](https://github.com/SamNewhouse/create-stb/tree/main/serverless)**

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📄 License

MIT © [Sam Newhouse](https://github.com/SamNewhouse)

---

## 💖 Support

If you find this tool helpful, please consider:

- ⭐ Starring the [repository](https://github.com/SamNewhouse/create-stb)
- 🐛 [Reporting issues](https://github.com/SamNewhouse/create-stb/issues)
- 💬 Sharing feedback and suggestions

**Thank you for using create-stb!** 🚀
