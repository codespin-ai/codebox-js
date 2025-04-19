// src/test/integration/config/projectConfig.test.ts
import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import {
  getConfig,
  saveConfig,
  getProjectByName,
  validateProjectName,
  validateProject,
  getConfigFilePath,
  isDebugEnabled,
} from "../../../config/projectConfig.js";
import { setupTestEnvironment, createTestConfig } from "../setup.js";

describe("Project Configuration", function () {
  let testDir: string;
  let configDir: string;
  let projectDir: string;
  let cleanup: () => void;

  beforeEach(function () {
    // Setup test environment
    const env = setupTestEnvironment();
    testDir = env.testDir;
    configDir = env.configDir;
    projectDir = env.projectDir;
    cleanup = env.cleanup;
  });

  afterEach(function () {
    // Clean up test environment
    cleanup();
  });

  describe("getConfig and saveConfig", function () {
    it("should return an empty config when no config file exists", function () {
      const config = getConfig();
      expect(config).to.deep.equal({ projects: [] });
    });

    it("should save and read the config file correctly", function () {
      const testConfig = {
        projects: [
          {
            name: "test-project",
            hostPath: projectDir,
            dockerImage: "node:18",
          },
        ],
        debug: true,
      };

      saveConfig(testConfig);

      // Verify file was created
      const configFile = getConfigFilePath();
      expect(fs.existsSync(configFile)).to.be.true;

      // Read back the config
      const readConfig = getConfig();
      expect(readConfig).to.deep.equal(testConfig);
    });
  });

  describe("Project Management", function () {
    it("should find a project by name", function () {
      // Create test config with a project
      const testConfig = {
        projects: [
          {
            name: "test-project",
            hostPath: projectDir,
            dockerImage: "node:18",
          },
        ],
      };
      saveConfig(testConfig);

      // Test getProjectByName
      const project = getProjectByName("test-project");
      expect(project).to.not.be.null;
      expect(project?.name).to.equal("test-project");

      // Test non-existent project
      const nonExistent = getProjectByName("non-existent");
      expect(nonExistent).to.be.null;
    });

    it("should validate project names", function () {
      // Create test config with a project
      const testConfig = {
        projects: [
          {
            name: "test-project",
            hostPath: projectDir,
            dockerImage: "node:18",
          },
        ],
      };
      saveConfig(testConfig);

      // Test validateProjectName
      expect(validateProjectName("test-project")).to.be.true;
      expect(validateProjectName("non-existent")).to.be.false;
    });

    it("should validate project directories", function () {
      // Create test config with a project
      const testConfig = {
        projects: [
          {
            name: "test-project",
            hostPath: projectDir,
            dockerImage: "node:18",
          },
        ],
      };
      saveConfig(testConfig);

      // Create a file in the project directory
      const nestedPath = path.join(projectDir, "nested");
      fs.mkdirSync(nestedPath, { recursive: true });

      // Test validateProject with various paths
      expect(validateProject(projectDir)).to.be.true;
      expect(validateProject(nestedPath)).to.be.true;
      expect(validateProject(testDir)).to.be.false;
    });
  });

  describe("Debug Mode", function () {
    it("should detect debug mode from config", function () {
      // Initially, debug should be off
      expect(isDebugEnabled()).to.be.false;

      // Create config with debug: true
      const testConfig = {
        projects: [],
        debug: true,
      };
      saveConfig(testConfig);

      // Now debug should be detected as enabled
      expect(isDebugEnabled()).to.be.true;
    });
  });
});
