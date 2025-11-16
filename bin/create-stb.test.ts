import {
  checkNodeVersion,
  createProjectDirectory,
  copyDir,
  updatePackageJson,
  updateServerlessYml,
} from "./create-stb";
import fs from "fs";
import path from "path";

// Temporary test folder structure
const testRoot = path.join(__dirname, "..", "test-tmp");
const templateDir = path.join(testRoot, "template");
const targetDir = path.join(testRoot, "target");

beforeAll(() => {
  // Clean up old test dirs
  if (fs.existsSync(testRoot)) fs.rmSync(testRoot, { recursive: true });
  fs.mkdirSync(testRoot);
});

afterAll(() => {
  // Remove test dirs after all tests
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
      // Create template with files and subdirs + dotfile
      fs.mkdirSync(templateDir);
      fs.writeFileSync(path.join(templateDir, "file.txt"), "hello world");
      fs.writeFileSync(path.join(templateDir, ".dotfile"), "dotfile");
      fs.mkdirSync(path.join(templateDir, "sub"));
      fs.writeFileSync(path.join(templateDir, "sub", "nested.txt"), "nested");
    });

    it("should copy files, subdirectories, and dotfiles", () => {
      copyDir(templateDir, targetDir);
      expect(fs.existsSync(path.join(targetDir, "file.txt"))).toBe(true);
      expect(fs.existsSync(path.join(targetDir, ".dotfile"))).toBe(true);
      expect(fs.existsSync(path.join(targetDir, "sub", "nested.txt"))).toBe(true);
      // Cleanup
      fs.rmSync(targetDir, { recursive: true });
    });
  });

  describe("updatePackageJson", () => {
    const pkgPath = path.join(testRoot, "package.json");

    beforeEach(() => {
      // Fresh dummy package.json for each test
      fs.writeFileSync(pkgPath, JSON.stringify({ name: "old", description: "desc" }, null, 2));
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
