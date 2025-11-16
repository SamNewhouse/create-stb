#!/usr/bin/env node
import path from "path";
import fs from "fs";
import { execSync } from "child_process";

// Progress display helpers
function writeLine(msg: string): void {
  const width = process.stdout.columns || 80;
  process.stdout.write(`\r${" ".repeat(width)}\r${msg}`);
}
function clearLine(): void {
  const width = process.stdout.columns || 80;
  process.stdout.write(`\r${" ".repeat(width)}\r`);
}
function step(label: string): void {
  writeLine(label + "...");
}
function doneStep(): void {
  clearLine();
}

// Ensure required Node version
export function checkNodeVersion(minMajor: number = 20): void {
  const [major] = process.version.replace("v", "").split(".");
  if (Number(major) < minMajor) throw new Error(`Node.js v${minMajor}+ required`);
}

// Create an empty directory (or error if not empty)
export function createProjectDirectory(projectPath: string): void {
  if (fs.existsSync(projectPath)) {
    if (fs.readdirSync(projectPath).length === 0) return;
    throw new Error(`Directory "${projectPath}" exists and is not empty.`);
  }
  fs.mkdirSync(projectPath, { recursive: true });
}

// Recursively copy everything, including dotfiles and subfolders
export function copyDir(src: string, dest: string): void {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Only update basic project info in package.json
export function updatePackageJson(projectPath: string, projectName: string): void {
  const file = path.join(projectPath, "package.json");
  if (!fs.existsSync(file)) return;
  const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
  pkg.name = projectName;
  pkg.description = `${projectName} app description`;
  fs.writeFileSync(file, JSON.stringify(pkg, null, 2));
}

export function updateServerlessYml(projectPath: string, projectName: string): void {
  const serverlessPath = path.join(projectPath, "serverless.yml");
  if (!fs.existsSync(serverlessPath)) return;
  let content = fs.readFileSync(serverlessPath, "utf8");
  content = content.replace(/^service:.*$/m, `service: ${projectName}`);
  fs.writeFileSync(serverlessPath, content);
}

// Main CLI flow
export async function main(): Promise<void> {
  const name = process.argv[2];
  if (!name) {
    console.error("Please provide a project name.");
    process.exit(1);
  }
  const projectPath = path.resolve(process.cwd(), name);
  const boilerplateSrc = path.resolve(__dirname, "..", "serverless");

  step("Checking Node version");
  checkNodeVersion();
  doneStep();

  step("Creating project directory");
  createProjectDirectory(projectPath);
  doneStep();

  step("Copying boilerplate files");
  copyDir(boilerplateSrc, projectPath);
  doneStep();

  step("Updating package.json");
  updatePackageJson(projectPath, name);
  doneStep();

  step("Updating serverless.yml");
  updateServerlessYml(projectPath, name);
  doneStep();

  step("Installing packages");
  execSync("npm install --silent", { cwd: projectPath, stdio: "inherit" });
  doneStep();

  clearLine();
  console.log(`\nInstallation complete\n\nNext steps:\n\n  cd ${name}\n  npm run offline\n`);
}

export default {
  checkNodeVersion,
  createProjectDirectory,
  copyDir,
  updatePackageJson,
  main,
};

if (require.main === module) {
  main().catch((err) => {
    clearLine();
    console.error("Error:", err.message);
    process.exit(1);
  });
}
