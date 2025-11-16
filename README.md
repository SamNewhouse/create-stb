# create-stb

**A CLI to instantly scaffold a production-ready Serverless TypeScript Boilerplate.**

---

## 🚀 Features

- Scaffolds a serverless app with TypeScript, AWS, and DynamoDB.
- Copies all template files, including configs and sample code.
- Automatically updates project name in `package.json` and `serverless.yml`.
- Installs dependencies for you.
- Simple and fast—no extra configuration.

---

## 📦 Installation

**Recommended: Use npx**

```bash
npx create-stb my-app
```

Or install globally:

```bash
npm install -g create-stb
create-stb my-app
```

---

## 🛠 Usage

```bash
npx create-stb <project-name>
```

This creates a directory `<project-name>` in your current folder.

Example:

```bash
npx create-stb pineapple-api
cd pineapple-api
npm run offline
```

---

## 🧩 What You Get

- Preconfigured `serverless.yml` for AWS and Node.js 20.x
- TypeScript-ready project
- Local DynamoDB scripts and sample handlers
- Scripts: `offline`, `deploy`, `build`, etc.
- Clean codebase, ready for development

---

## 🔗 Links

- [GitHub repository](https://github.com/SamNewhouse/create-stb)
- [Report issues](https://github.com/SamNewhouse/create-stb/issues)
- [NPM page](https://www.npmjs.com/package/create-stb)

---

## 🤝 Contributing

Pull requests, suggestions, and issues are welcome!  
See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📄 License

MIT © [Sam Newhouse](https://github.com/SamNewhouse)
