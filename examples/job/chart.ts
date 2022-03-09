import { Construct } from "constructs";
import {
  createDockerHubSecretFromEnv,
  Job,
  getDockerTag,
  TalisChart,
  TalisChartProps,
} from "../../lib";
import { Quantity } from "../../imports/k8s";

export class JobChart extends TalisChart {
  constructor(scope: Construct, props: TalisChartProps) {
    super(scope, { app: "example-job-app", ...props });

    const release = getDockerTag("RELEASE", props.environment, "v1.0");
    const dockerHubSecret = createDockerHubSecretFromEnv(this);

    new Job(this, "job-example", {
      ttlSecondsAfterFinished: 100,
      image: `docker.io/organization/my-app:job-${release}`,
      imagePullSecrets: [{ name: dockerHubSecret.name }],
      release,
      workingDir: "/some/path",
      command: ["/bin/sh", "-c", "echo hello"],
      resources: {
        requests: {
          cpu: Quantity.fromString("100m"),
          memory: Quantity.fromString("100Mi"),
        },
      },
    });
  }
}
