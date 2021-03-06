import { AdvancedWebServiceChart } from "./chart";
import { Testing } from "cdk8s";
import { TalisShortRegion, TalisDeploymentEnvironment } from "../../lib";

describe("Advanced WebService example", () => {
  const PROCESS_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...PROCESS_ENV };
  });

  afterEach(() => {
    process.env = PROCESS_ENV;
  });

  ["base", "canary", "post-canary", "full"].forEach((stage) => {
    test(`Snapshot ${stage} stage`, () => {
      process.env.CANARY_STAGE = stage;
      const app = Testing.app();
      const chart = new AdvancedWebServiceChart(app, {
        environment: TalisDeploymentEnvironment.DEVELOPMENT,
        region: TalisShortRegion.LOCAL,
        watermark: "test",
      });
      const results = Testing.synth(chart);
      expect(results).toMatchSnapshot();
    });
  });

  test("Change release version", () => {
    process.env.CANARY_STAGE = "canary";
    process.env.RELEASE = "v0.2.2";
    const app = Testing.app();
    const chart = new AdvancedWebServiceChart(app, {
      environment: TalisDeploymentEnvironment.DEVELOPMENT,
      region: TalisShortRegion.LOCAL,
      watermark: "test",
    });
    const results = Testing.synth(chart);
    expect(results).toMatchSnapshot();
  });
});
