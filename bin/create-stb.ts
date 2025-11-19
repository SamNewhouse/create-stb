#!/usr/bin/env node
import path from "path";
import fs from "fs";
import { execSync, execFileSync } from "child_process";
import os from "os";

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

// Check if git is installed
export function checkGitInstalled(): void {
  try {
    execFileSync("git", ["--version"], { stdio: "ignore" });
  } catch {
    throw new Error("Git is not installed. Please install git and try again.");
  }
}

// Clone the repo to a temp directory and extract the serverless folder
export function cloneBoilerplate(tempDir: string): string {
  const repoUrl = "https://github.com/SamNewhouse/create-stb.git";
  const clonePath = path.join(tempDir, "create-stb-temp");

  execFileSync(
    "git",
    ["clone", "--depth", "1", "--filter=blob:none", "--sparse", repoUrl, clonePath],
    { stdio: "ignore" },
  );

  execFileSync("git", ["sparse-checkout", "set", "serverless"], {
    cwd: clonePath,
    stdio: "ignore",
  });

  return path.join(clonePath, "serverless");
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

// Clean up temporary directory
export function cleanupTemp(tempDir: string): void {
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
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
  const tempDir = path.join(os.tmpdir(), `create-stb-${Date.now()}`);

  try {
    step("Checking Node version");
    checkNodeVersion();
    doneStep();

    step("Checking Git installation");
    checkGitInstalled();
    doneStep();

    step("Creating project directory");
    createProjectDirectory(projectPath);
    doneStep();

    step("Downloading boilerplate template");
    const boilerplateSrc = cloneBoilerplate(tempDir);
    doneStep();

    step("Copying boilerplate files");
    copyDir(boilerplateSrc, projectPath);
    doneStep();

    step("Cleaning up temporary files");
    cleanupTemp(tempDir);
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
  } catch (error) {
    cleanupTemp(tempDir);
    throw error;
  }
}

export default {
  checkNodeVersion,
  checkGitInstalled,
  cloneBoilerplate,
  createProjectDirectory,
  copyDir,
  cleanupTemp,
  updatePackageJson,
  updateServerlessYml,
  main,
};

if (require.main === module) {
  main().catch((err) => {
    clearLine();
    console.error("Error:", err.message);
    process.exit(1);
  });
}
