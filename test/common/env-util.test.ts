import {
  getCanaryStage,
  getDockerTag,
  getWatermark,
  getTtlTimestamp,
  TalisDeploymentEnvironment,
} from "../../lib";

describe("env-util", () => {
  const PROCESS_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...PROCESS_ENV };
  });

  afterEach(() => {
    process.env = PROCESS_ENV;
  });

  describe("getWatermark", () => {
    test("Gets a watermark", () => {
      process.env.WATERMARK = "my-test";
      expect(getWatermark()).toBe("my-test");
    });

    test("Gets a watermark from custom env var", () => {
      process.env.MARCA_DE_AGUA = "mi-prueba";
      expect(getWatermark({ envVarName: "MARCA_DE_AGUA" })).toBe("mi-prueba");
    });

    test("Returns the default watermark", () => {
      expect(getWatermark({ defaultValue: "ondemand" })).toBe("ondemand");
    });

    test("Returns the default if env var is empty", () => {
      process.env.WATERMARKO = "";
      expect(
        getWatermark({
          envVarName: "WATERMARKO",
          defaultValue: "defaulto",
        }),
      ).toBe("defaulto");
    });

    test("Throws if env var is unset", () => {
      expect(() => getWatermark()).toThrowErrorMatchingSnapshot();
    });

    test("Throws if env var is empty", () => {
      process.env.WATERMARK = "";
      expect(() => getWatermark()).toThrowErrorMatchingSnapshot();
    });

    test("Throws if value is too long", () => {
      process.env.WATERMARK = "a".repeat(64);
      expect(() => getWatermark()).toThrowErrorMatchingSnapshot();
    });

    ["-test", "test-", "Foo", "foo_bar"].forEach((watermark) => {
      test("Throws if value is not valid", () => {
        process.env.WATERMARK = watermark;
        expect(() => getWatermark()).toThrowErrorMatchingSnapshot();
      });
    });
  });

  describe("getTtlTimestamp", () => {
    test("Gets TTL", () => {
      process.env.TTL = "1650172800";
      expect(getTtlTimestamp()).toBe(1650172800);
    });

    test("Returns undefined if no TTL is set", () => {
      expect(getTtlTimestamp()).toBeUndefined();
    });

    test("Gets TTL from custom env var", () => {
      process.env.EXPIRY_DATE = "2147483647";
      expect(getTtlTimestamp({ envVarName: "EXPIRY_DATE" })).toBe(2147483647);
    });

    test("Returns undefined if no custom env var is set", () => {
      expect(getTtlTimestamp({ envVarName: "EXPIRY_DATE" })).toBeUndefined();
    });

    [
      "1234567890.12",
      "a123456789",
      "123456789a",
      "123456789",
      "foobar",
    ].forEach((ttl) => {
      test(`Throws on invalid TTL ${ttl}`, () => {
        process.env.TTL = ttl;
        expect(() => getTtlTimestamp()).toThrowErrorMatchingSnapshot();
      });
    });
  });

  describe("getDockerTag", () => {
    test("Gets a Docker tag from named env var", () => {
      process.env.APP_DOCKER_TAG = "v1";
      expect(
        getDockerTag("APP_DOCKER_TAG", TalisDeploymentEnvironment.DEVELOPMENT),
      ).toBe("v1");
    });

    test("Gets the default Docker tag if env var is not set", () => {
      expect(
        getDockerTag("APP_DOCKER_TAG", TalisDeploymentEnvironment.DEVELOPMENT),
      ).toBe("latest");
    });

    test("Gets the custom default Docker tag if env var is not set", () => {
      expect(
        getDockerTag(
          "APP_DOCKER_TAG",
          TalisDeploymentEnvironment.DEVELOPMENT,
          "release",
        ),
      ).toBe("release");
    });

    test("Throws if env var is empty", () => {
      process.env.APP_DOCKER_TAG = "";
      expect(() =>
        getDockerTag("APP_DOCKER_TAG", TalisDeploymentEnvironment.DEVELOPMENT),
      ).toThrowErrorMatchingSnapshot();
    });

    test("Throws if tag is not valid for the environment", () => {
      process.env.APP_DOCKER_TAG = "stable";
      expect(() =>
        getDockerTag("APP_DOCKER_TAG", TalisDeploymentEnvironment.PRODUCTION),
      ).toThrowErrorMatchingSnapshot();
    });
  });

  describe("getCanaryStage", () => {
    test("Gets name of the stage from CANARY_STAGE env var", () => {
      process.env.CANARY_STAGE = "canary";
      expect(getCanaryStage()).toBe("canary");
    });

    test("Gets name of the stage from a custom env var", () => {
      process.env.MY_STAGE = "base";
      expect(getCanaryStage("MY_STAGE")).toBe("base");
    });

    test("Throws if env var is not set", () => {
      expect(() => getCanaryStage()).toThrowErrorMatchingSnapshot();
    });

    test("Throws if env var is empty", () => {
      process.env.CANARY_STAGE = "";
      expect(() => getCanaryStage()).toThrowErrorMatchingSnapshot();
    });

    test("Throws if stage name is not valid", () => {
      process.env.CANARY_STAGE = "blue";
      expect(() => getCanaryStage()).toThrowErrorMatchingSnapshot();
    });

    test("Gets default stage if env var is not set", () => {
      expect(getCanaryStage("NOT_SET", "base")).toBe("base");
    });

    test("Gets default stage if env var is empty", () => {
      process.env.EMPTY = "";
      expect(getCanaryStage("EMPTY", "full")).toBe("full");
    });
  });
});
