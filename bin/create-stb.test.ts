import {
  checkNodeVersion,
  checkGitInstalled,
  cloneBoilerplate,
  createProjectDirectory,
  copyDir,
  cleanupTemp,
  updatePackageJson,
  updateServerlessYml,
} from "./create-stb";
import fs from "fs";
import path from "path";
import os from "os";
import { execFileSync } from "child_process";

jest.mock("child_process");

const testRoot = path.join(__dirname, "..", "test-tmp");
const templateDir = path.join(testRoot, "template");
const targetDir = path.join(testRoot, "target");

beforeAll(() => {
  if (fs.existsSync(testRoot)) fs.rmSync(testRoot, { recursive: true });
  fs.mkdirSync(testRoot);
});

afterAll(() => {
  if (fs.existsSync(testRoot)) fs.rmSync(testRoot, { recursive: true });
});

describe("CLI Utility Functions", () => {
  describe("checkNodeVersion", () => {
    it("should not throw when node version is sufficient", () => {
      expect(() => checkNodeVersion(10)).not.toThrow();
    });

    it("should throw when node version is too low", () => {
      expect(() => checkNodeVersion(99)).toThrow(/required/);
    });
  });

  describe("checkGitInstalled", () => {
    const mockExecFileSync = execFileSync as jest.MockedFunction<typeof execFileSync>;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should not throw when git is installed", () => {
      mockExecFileSync.mockReturnValue(Buffer.from("git version 2.39.0"));
      expect(() => checkGitInstalled()).not.toThrow();
      expect(mockExecFileSync).toHaveBeenCalledWith("git", ["--version"], { stdio: "ignore" });
    });

    it("should throw when git command fails", () => {
      mockExecFileSync.mockImplementation(() => {
        throw new Error("command not found");
      });

      expect(() => checkGitInstalled()).toThrow(/Git is not installed/);
    });
  });

  describe("cloneBoilerplate", () => {
    const mockExecFileSync = execFileSync as jest.MockedFunction<typeof execFileSync>;

    beforeEach(() => {
      jest.clearAllMocks();
      mockExecFileSync.mockRestore();
    });

    it("should clone the serverless folder from the repo", () => {
      jest.unmock("child_process");
      const { execFileSync: realExecFileSync } = jest.requireActual("child_process");
      mockExecFileSync.mockImplementation(realExecFileSync);

      const tempDir = path.join(os.tmpdir(), `test-clone-${Date.now()}`);
      fs.mkdirSync(tempDir, { recursive: true });

      try {
        const boilerplatePath = cloneBoilerplate(tempDir);
        expect(fs.existsSync(boilerplatePath)).toBe(true);
        expect(fs.existsSync(path.join(boilerplatePath, "package.json"))).toBe(true);
        expect(fs.existsSync(path.join(boilerplatePath, "serverless.yml"))).toBe(true);
      } finally {
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
        }
      }
    }, 30000);
  });

  describe("cleanupTemp", () => {
    it("should remove temporary directory", () => {
      const tempDir = path.join(testRoot, "temp-cleanup-test");
      fs.mkdirSync(tempDir, { recursive: true });
      fs.writeFileSync(path.join(tempDir, "test.txt"), "test");

      cleanupTemp(tempDir);
      expect(fs.existsSync(tempDir)).toBe(false);
    });

    it("should not throw if directory does not exist", () => {
      const nonExistent = path.join(testRoot, "does-not-exist");
      expect(() => cleanupTemp(nonExistent)).not.toThrow();
    });
  });

  describe("createProjectDirectory", () => {
    it("should create a new directory", () => {
      const dir = path.join(testRoot, "new-dir");
      if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });
      createProjectDirectory(dir);
      expect(fs.existsSync(dir)).toBe(true);
      fs.rmSync(dir, { recursive: true });
    });

    it("should throw error when directory exists and is not empty", () => {
      const dir = path.join(testRoot, "not-empty-dir");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      fs.writeFileSync(path.join(dir, "test.txt"), "hello");
      expect(() => createProjectDirectory(dir)).toThrow(/not empty/);
      fs.rmSync(dir, { recursive: true });
    });

    it("should not throw when directory exists and is empty", () => {
      const dir = path.join(testRoot, "empty-dir");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      expect(() => createProjectDirectory(dir)).not.toThrow();
      fs.rmSync(dir, { recursive: true });
    });
  });

  describe("copyDir", () => {
    beforeAll(() => {
      if (!fs.existsSync(templateDir)) fs.mkdirSync(templateDir, { recursive: true });
      fs.writeFileSync(path.join(templateDir, "file.txt"), "hello world");
      fs.writeFileSync(path.join(templateDir, ".dotfile"), "dotfile");
      const subDir = path.join(templateDir, "sub");
      if (!fs.existsSync(subDir)) fs.mkdirSync(subDir);
      fs.writeFileSync(path.join(templateDir, "sub", "nested.txt"), "nested");
    });

    afterAll(() => {
      if (fs.existsSync(templateDir)) fs.rmSync(templateDir, { recursive: true });
    });

    it("should copy files, subdirectories, and dotfiles", () => {
      if (fs.existsSync(targetDir)) fs.rmSync(targetDir, { recursive: true });
      copyDir(templateDir, targetDir);
      expect(fs.existsSync(path.join(targetDir, "file.txt"))).toBe(true);
      expect(fs.existsSync(path.join(targetDir, ".dotfile"))).toBe(true);
      expect(fs.existsSync(path.join(targetDir, "sub", "nested.txt"))).toBe(true);
      fs.rmSync(targetDir, { recursive: true });
    });
  });

  describe("updatePackageJson", () => {
    const pkgPath = path.join(testRoot, "package.json");

    beforeEach(() => {
      fs.writeFileSync(pkgPath, JSON.stringify({ name: "old", description: "desc" }, null, 2));
    });

    afterEach(() => {
      if (fs.existsSync(pkgPath)) fs.rmSync(pkgPath);
    });

    it("should update name and description", () => {
      updatePackageJson(testRoot, "new-name");
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      expect(pkg.name).toBe("new-name");
      expect(pkg.description).toBe("new-name app description");
    });

    it("should do nothing if package.json does not exist", () => {
      fs.rmSync(pkgPath);
      expect(() => updatePackageJson(testRoot, "test")).not.toThrow();
    });
  });

  describe("updateServerlessYml", () => {
    const ymlPath = path.join(testRoot, "serverless.yml");
    const sampleYML = `service: starter-name\nprovider:\n  name: aws\n`;

    beforeEach(() => {
      fs.writeFileSync(ymlPath, sampleYML, "utf8");
    });

    afterEach(() => {
      if (fs.existsSync(ymlPath)) fs.rmSync(ymlPath);
    });

    it("should update service name in serverless.yml", () => {
      updateServerlessYml(testRoot, "my-service");
      const content = fs.readFileSync(ymlPath, "utf8");
      expect(content).toMatch(/^service: my-service$/m);
    });

    it("should do nothing if serverless.yml does not exist", () => {
      fs.rmSync(ymlPath);
      expect(() => updateServerlessYml(testRoot, "other")).not.toThrow();
    });
  });
});
