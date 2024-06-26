import { Chart, Testing } from "cdk8s";
import { Quantity } from "../../imports/k8s";
import {
  BackgroundWorker,
  BackgroundWorkerProps,
  ContainerImagePullPolicy,
  DNSPolicy,
  PreemptionPolicy,
} from "../../lib";

const requiredProps = {
  image: "talis/app:worker-v1",
  release: "v1",
  resources: {
    requests: {
      cpu: Quantity.fromString("100m"),
      memory: Quantity.fromString("100Mi"),
    },
  },
};

function synthBackgroundWorker(props: BackgroundWorkerProps = requiredProps) {
  const chart = Testing.chart();
  new BackgroundWorker(chart, "worker-test", props);
  const results = Testing.synth(chart);
  return results;
}

describe("BackgroundWorker", () => {
  describe("Props", () => {
    test("Minimal required props", () => {
      const chart = Testing.chart();
      new BackgroundWorker(chart, "worker-test", requiredProps);
      const results = Testing.synth(chart);
      expect(results).toMatchSnapshot();
    });

    test("All the props", () => {
      const app = Testing.app();
      const chart = new Chart(app, "test", {
        namespace: "test",
        labels: {
          app: "my-app",
          environment: "test",
          region: "local",
        },
      });
      const selectorLabels = {
        app: "my-app",
        instance: "test",
      };
      const allProps: Required<
        Omit<
          BackgroundWorkerProps,
          "stopSignal" | "makeAffinity" | "autoscaling"
        >
      > = {
        ...requiredProps,
        selectorLabels,
        containerName: "worker",
        workingDir: "/some/path",
        command: ["/bin/sh", "-c", "echo hello"],
        args: ["--foo", "bar"],
        env: [{ name: "FOO", value: "bar" }],
        envFrom: [{ configMapRef: { name: "foo-config" } }],
        automountServiceAccountToken: true,
        dnsConfig: {
          options: [
            {
              name: "ndots",
              value: "2",
            },
          ],
        },
        dnsPolicy: DNSPolicy.CLUSTER_FIRST,
        enableServiceLinks: false,
        preemptionPolicy: PreemptionPolicy.PREEMPT_LOWER_PRIORITY,
        serviceAccountName: "service-account",
        setHostnameAsFqdn: false,
        shareProcessNamespace: false,
        subdomain: "sub",
        tolerations: [
          {
            effect: "NoSchedule",
            operator: "Exists",
          },
        ],
        imagePullPolicy: ContainerImagePullPolicy.ALWAYS,
        imagePullSecrets: [{ name: "foo-secret" }],
        priorityClassName: "high-priority",
        revisionHistoryLimit: 5,
        containers: [{ name: "secondary", image: "second-image" }],
        affinity: {
          podAntiAffinity: {
            preferredDuringSchedulingIgnoredDuringExecution: [
              {
                podAffinityTerm: {
                  labelSelector: {
                    matchLabels: selectorLabels,
                  },
                  topologyKey: "topology.kubernetes.io/zone",
                },
                weight: 100,
              },
            ],
          },
        },
        resources: {
          requests: {
            cpu: Quantity.fromNumber(0.1),
            memory: Quantity.fromString("100Mi"),
          },
          limits: {
            cpu: Quantity.fromNumber(1),
            memory: Quantity.fromString("1Gi"),
          },
        },
        podSecurityContext: {
          fsGroup: 1000,
        },
        securityContext: {
          runAsUser: 1000,
          runAsGroup: 1000,
          runAsNonRoot: true,
        },
        replicas: 4,
        terminationGracePeriodSeconds: 300,
        lifecycle: {
          postStart: {
            exec: {
              command: ["/bin/sh", "-c", "echo hello"],
            },
          },
          preStop: {
            exec: {
              command: ["/bin/sh", "-c", "echo goodbye"],
            },
          },
        },
        startupProbe: {
          exec: {
            command: [
              "/bin/sh",
              "-c",
              "test $(stat -c %Y /tmp/live) -gt $(($(date +%s) - 60))",
            ],
          },
          initialDelaySeconds: 30,
          periodSeconds: 10,
          failureThreshold: 30,
          successThreshold: 1,
          timeoutSeconds: 2,
        },
        livenessProbe: {
          exec: {
            command: [
              "/bin/sh",
              "-c",
              "test $(stat -c %Y /tmp/live) -gt $(($(date +%s) - 60))",
            ],
          },
          initialDelaySeconds: 30,
          periodSeconds: 10,
          failureThreshold: 3,
          successThreshold: 1,
          timeoutSeconds: 2,
        },
        hostAliases: [
          {
            ip: "127.0.0.1",
            hostnames: ["foo.example.com", "bar.example.com"],
          },
        ],
        volumes: [
          {
            name: "tmp-dir",
            emptyDir: {},
          },
        ],
        volumeMounts: [
          {
            name: "tmp-dir",
            mountPath: "/tmp",
          },
        ],
        initContainers: [
          {
            name: "init-container",
            image: "busybox:1.35.0",
            command: ["/bin/sh", "-c", "echo hello"],
          },
        ],
      };
      new BackgroundWorker(chart, "worker-test", allProps);
      const results = Testing.synth(chart);
      expect(results).toMatchSnapshot();

      const deployment = results.find((obj) => obj.kind === "Deployment");
      expect(deployment).toHaveAllProperties(allProps, [
        "containerName",
        "podSecurityContext",
        "release",
        "selectorLabels",
        "setHostnameAsFqdn",
      ]);
      expect(deployment).toHaveProperty("spec.template.spec.setHostnameAsFQDN");
    });

    test("Allows specifying no affinity", () => {
      const results = synthBackgroundWorker({
        ...requiredProps,
        affinity: undefined,
      });
      const deployment = results.find((obj) => obj.kind === "Deployment");
      expect(deployment).not.toHaveProperty("spec.template.spec.affinity");
    });

    test("Allows specifying custom logic to make affinity", () => {
      const results = synthBackgroundWorker({
        ...requiredProps,
        makeAffinity(matchLabels) {
          return {
            podAffinity: {
              requiredDuringSchedulingIgnoredDuringExecution: [
                {
                  labelSelector: {
                    matchExpressions: [
                      {
                        key: "role",
                        operator: "In",
                        values: [matchLabels.role],
                      },
                    ],
                  },
                  topologyKey: "kubernetes.io/hostname",
                },
              ],
            },
          };
        },
      });
      const deployment = results.find((obj) => obj.kind === "Deployment");
      expect(deployment).toHaveProperty("spec.template.spec.affinity");
      expect(deployment.spec.template.spec.affinity).toMatchSnapshot();
    });

    test("Allows returning no affinity", () => {
      const results = synthBackgroundWorker({
        ...requiredProps,
        makeAffinity() {
          return undefined;
        },
      });
      const deployment = results.find((obj) => obj.kind === "Deployment");
      expect(deployment).not.toHaveProperty("spec.template.spec.affinity");
    });

    test("selectorLabels can override app", () => {
      const results = synthBackgroundWorker({
        ...requiredProps,
        selectorLabels: { app: "foobar" },
      });
      const deployment = results.find((obj) => obj.kind === "Deployment");
      expect(deployment).toHaveProperty("metadata.labels.app", "foobar");
      expect(deployment).toHaveProperty(
        "spec.selector.matchLabels.app",
        "foobar",
      );
      expect(deployment).toHaveProperty(
        "spec.template.metadata.labels.app",
        "foobar",
      );
    });
  });

  describe("Containers", () => {
    test("Default container name", () => {
      const results = synthBackgroundWorker();
      const deployment = results.find((obj) => obj.kind === "Deployment");
      expect(deployment).toHaveProperty(
        "spec.template.spec.containers[0].name",
        "app",
      );
    });

    test("Container name from chart's app label", () => {
      const app = Testing.app();
      const chart = new Chart(app, "test", {
        labels: {
          app: "from-chart",
        },
      });
      new BackgroundWorker(chart, "worker-test", requiredProps);
      const results = Testing.synth(chart);
      const deployment = results.find((obj) => obj.kind === "Deployment");
      expect(deployment).toHaveProperty(
        "spec.template.spec.containers[0].name",
        "from-chart",
      );
    });

    test("Container name from selector label", () => {
      const results = synthBackgroundWorker({
        ...requiredProps,
        selectorLabels: { app: "from-selector" },
      });
      const deployment = results.find((obj) => obj.kind === "Deployment");
      expect(deployment).toHaveProperty(
        "spec.template.spec.containers[0].name",
        "from-selector",
      );
    });

    test("Container name set explicitly", () => {
      const results = synthBackgroundWorker({
        ...requiredProps,
        containerName: "explicit-name",
      });
      const deployment = results.find((obj) => obj.kind === "Deployment");
      expect(deployment).toHaveProperty(
        "spec.template.spec.containers[0].name",
        "explicit-name",
      );
    });

    test("Allows setting multiple containers", () => {
      const results = synthBackgroundWorker({
        ...requiredProps,
        containers: [
          {
            name: "sideapp",
            image: "side-image",
          },
        ],
      });
      const deployment = results.find((obj) => obj.kind === "Deployment");
      expect(deployment).toHaveProperty("spec.template.spec.containers");
      expect(deployment.spec.template.spec.containers).toHaveLength(2);
      expect(deployment).toHaveProperty(
        "spec.template.spec.containers[0].name",
        "app",
      );
      expect(deployment).toHaveProperty(
        "spec.template.spec.containers[1].name",
        "sideapp",
      );
    });
  });

  describe("Custom stop signal", () => {
    test("Either stopSignal or lifecycle.preStop can be specified", () => {
      expect(() => {
        new BackgroundWorker(Testing.chart(), "worker-test", {
          ...requiredProps,
          stopSignal: "KILL",
          lifecycle: {
            preStop: {
              exec: {
                command: ["kill", "-9", "1"],
              },
            },
          },
        });
      }).toThrowErrorMatchingSnapshot();
    });

    test("Setting stopSignal creates a preStop hook", () => {
      const results = synthBackgroundWorker({
        ...requiredProps,
        stopSignal: "QUIT",
      });
      const container = results[0].spec.template.spec.containers[0];
      expect(container.lifecycle).toMatchSnapshot();
    });

    test("Merge stopSignal and postStart hook", () => {
      const results = synthBackgroundWorker({
        ...requiredProps,
        stopSignal: "QUIT",
        lifecycle: {
          postStart: {
            exec: {
              command: ["/bin/sh", "-c", "echo hello"],
            },
          },
        },
      });
      const container = results[0].spec.template.spec.containers[0];
      expect(container.lifecycle).toMatchSnapshot();
    });
  });

  describe("Autoscaling", () => {
    test("Either replicas or autoscaling can be specified", () => {
      expect(() => {
        new BackgroundWorker(Testing.chart(), "worker-test", {
          ...requiredProps,
          replicas: 5,
          autoscaling: {
            minReplicas: 1,
            maxReplicas: 10,
          },
        });
      }).toThrowErrorMatchingSnapshot();
    });

    test("It can autoscale based on Redis List length", () => {
      const results = synthBackgroundWorker({
        ...requiredProps,
        autoscaling: {
          minReplicas: 0,
          maxReplicas: 10,
          redisListScalers: [
            {
              listName: "my-redis-queue",
              listLength: 5,
              redisConnectionDetails: {
                host: "redis.example.com",
                port: "6379",
                database: "0",
              },
            },
          ],
        },
      });
      expect(results).toMatchSnapshot();
    });

    test("Autoscaling can be paused", () => {
      const results = synthBackgroundWorker({
        ...requiredProps,
        autoscaling: {
          paused: true,
          minReplicas: 0,
          maxReplicas: 10,
        },
      });
      expect(results).toMatchSnapshot();
    });
  });
});
