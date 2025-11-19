#!/usr/bin/env node
import path from "path";
import fs from "fs";
import { execSync, execFileSync } from "child_process";
import os from "os";

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

/**
 * Sanitizes a file path to prevent command injection attacks.
 * Validates input, blocks dangerous characters, and returns normalized absolute path.
 * @param inputPath - The path to sanitize
 * @returns Sanitized absolute path
 * @throws Error if path is invalid or contains dangerous characters
 */
export function sanitizePath(inputPath: string): string {
  if (typeof inputPath !== "string" || !inputPath.trim()) {
    throw new Error("Path must be a non-empty string");
  }

  const trimmed = inputPath.trim();

  if (trimmed.startsWith("-") || /[`$|;&<>\0]/.test(trimmed)) {
    throw new Error("Invalid path: contains dangerous characters");
  }

  return path.normalize(path.resolve(trimmed));
}

/**
 * Checks if the current Node.js version meets the minimum required version.
 * @param minMajor - Minimum required major version (default: 20)
 * @throws Error if Node.js version is below the minimum required
 */
export function checkNodeVersion(minMajor: number = 20): void {
  const [major] = process.version.replace("v", "").split(".");
  if (Number(major) < minMajor) throw new Error(`Node.js v${minMajor}+ required`);
}

/**
 * Verifies that Git is installed and available on the system.
 * @throws Error if Git is not installed or cannot be executed
 */
export function checkGitInstalled(): void {
  try {
    execFileSync("git", ["--version"], { stdio: "ignore" });
  } catch {
    throw new Error("Git is not installed. Please install git and try again.");
  }
}

/**
 * Clones the create-stb repository to a temporary directory using sparse checkout
 * to retrieve only the serverless template folder.
 * @param tempDir - Temporary directory path for cloning
 * @returns Path to the cloned serverless template directory
 * @throws Error if git clone fails or serverless folder is not found
 */
export function cloneBoilerplate(tempDir: string): string {
  const repoUrl = "https://github.com/SamNewhouse/create-stb.git";

  const safeTempDir = sanitizePath(tempDir);
  const clonePath = path.join(safeTempDir, "create-stb-temp");
  const safeClonePath = sanitizePath(clonePath);

  execFileSync(
    "git",
    ["clone", "--depth", "1", "--filter=blob:none", "--sparse", repoUrl, safeClonePath],
    { stdio: "ignore" },
  );

  execFileSync("git", ["sparse-checkout", "set", "serverless"], {
    cwd: safeClonePath,
    stdio: "ignore",
  });

  return path.join(safeClonePath, "serverless");
}

/**
 * Creates a new project directory, ensuring it doesn't exist or is empty.
 * @param projectPath - Path to the project directory to create
 * @throws Error if directory exists and is not empty
 */
export function createProjectDirectory(projectPath: string): void {
  if (fs.existsSync(projectPath)) {
    if (fs.readdirSync(projectPath).length === 0) return;
    throw new Error(`Directory "${projectPath}" exists and is not empty.`);
  }
  fs.mkdirSync(projectPath, { recursive: true });
}

/**
 * Recursively copies all files and directories from source to destination,
 * including dotfiles and nested directories.
 * @param src - Source directory path
 * @param dest - Destination directory path
 */
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

/**
 * Removes a temporary directory and all its contents.
 * Does not throw if directory doesn't exist.
 * @param tempDir - Path to temporary directory to remove
 */
export function cleanupTemp(tempDir: string): void {
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

/**
 * Updates the package.json file with the new project name and description.
 * @param projectPath - Path to the project directory
 * @param projectName - Name for the new project
 */
export function updatePackageJson(projectPath: string, projectName: string): void {
  const file = path.join(projectPath, "package.json");
  if (!fs.existsSync(file)) return;
  const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
  pkg.name = projectName;
  pkg.description = `${projectName} app description`;
  fs.writeFileSync(file, JSON.stringify(pkg, null, 2));
}

/**
 * Updates the serverless.yml file with the new service name.
 * @param projectPath - Path to the project directory
 * @param projectName - Name for the new service
 */
export function updateServerlessYml(projectPath: string, projectName: string): void {
  const serverlessPath = path.join(projectPath, "serverless.yml");
  if (!fs.existsSync(serverlessPath)) return;
  let content = fs.readFileSync(serverlessPath, "utf8");
  content = content.replace(/^service:.*$/m, `service: ${projectName}`);
  fs.writeFileSync(serverlessPath, content);
}

/**
 * Main CLI entry point. Orchestrates the entire project scaffolding process.
 * @throws Error if any step fails during project creation
 */
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
    console.log(`\n✅ Installation complete!\n\nNext steps:\n\n  cd ${name}\n  npm run offline\n`);
  } catch (error) {
    cleanupTemp(tempDir);
    throw error;
  }
}

export default {
  checkNodeVersion,
  checkGitInstalled,
  sanitizePath,
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
    console.error("\n❌ Error:", err.message);
    process.exit(1);
  });
}
