import { Chart } from "cdk8s";
import { Construct } from "constructs";
import { KubeDeployment, Lifecycle } from "../../imports/k8s";
import { ScaledObject } from "../../imports/keda.sh";
import { defaultAffinity } from "../common";
import { BackgroundWorkerProps } from "./background-worker-props";
import { ContainerImagePullPolicy } from "../k8s";

export class BackgroundWorker extends Construct {
  constructor(scope: Construct, id: string, props: BackgroundWorkerProps) {
    super(scope, id);
    this.validateProps(props);

    const hasProp = (key: string) =>
      Object.prototype.hasOwnProperty.call(props, key);
    const chart = Chart.of(this);
    const app = props.selectorLabels?.app ?? chart.labels.app;
    const labels = {
      ...chart.labels,
      release: props.release,
    };
    const affinityFunc = props.makeAffinity ?? defaultAffinity;

    const selectorLabels: { [key: string]: string } = {
      app: app,
      role: "worker",
      instance: id,
      ...props.selectorLabels,
    };

    const containerName = props.containerName ?? app ?? "app";
    const deployment = new KubeDeployment(this, id, {
      metadata: {
        labels: { ...labels, ...selectorLabels },
      },
      spec: {
        replicas: props.replicas,
        revisionHistoryLimit: props.revisionHistoryLimit ?? 1,
        selector: {
          matchLabels: selectorLabels,
        },
        template: {
          metadata: {
            labels: {
              ...labels, // chart labels are not applied to the Pod so we need to add them here
              ...selectorLabels,
            },
          },
          spec: {
            affinity: hasProp("affinity")
              ? props.affinity
              : affinityFunc(selectorLabels),
            automountServiceAccountToken:
              props.automountServiceAccountToken ?? false,
            dnsConfig: props.dnsConfig,
            dnsPolicy: props.dnsPolicy,
            enableServiceLinks: props.enableServiceLinks,
            hostAliases: props.hostAliases,
            imagePullSecrets: props.imagePullSecrets,
            preemptionPolicy: props.preemptionPolicy,
            priorityClassName: props.priorityClassName,
            serviceAccountName: props.serviceAccountName,
            setHostnameAsFqdn: props.setHostnameAsFqdn,
            shareProcessNamespace: props.shareProcessNamespace,
            subdomain: props.subdomain,
            terminationGracePeriodSeconds: props.terminationGracePeriodSeconds,
            tolerations: props.tolerations,
            volumes: props.volumes,
            securityContext: props.podSecurityContext,
            initContainers: props.initContainers,
            containers: [
              {
                name: containerName,
                image: props.image,
                imagePullPolicy:
                  props.imagePullPolicy ??
                  ContainerImagePullPolicy.IF_NOT_PRESENT,
                workingDir: props.workingDir,
                command: props.command,
                args: props.args,
                resources: props.resources,
                securityContext: props.securityContext,
                env: props.env,
                envFrom: props.envFrom,
                lifecycle: this.createLifecycle(props),
                startupProbe: props.startupProbe,
                livenessProbe: props.livenessProbe,
                volumeMounts: props.volumeMounts,
              },
              ...(props.containers ?? []),
            ],
          },
        },
      },
    });

    if (props.autoscaling) {
      const { redisListScalers = [] } = props.autoscaling;
      const scaledObjectAnnotations: Record<string, string> = {};
      if (props.autoscaling.paused) {
        scaledObjectAnnotations["autoscaling.keda.sh/paused-replicas"] = String(
          props.autoscaling.minReplicas,
        );
      }

      new ScaledObject(this, `${id}-scaledobject`, {
        metadata: {
          annotations: { ...scaledObjectAnnotations },
          labels: { ...labels, ...selectorLabels },
        },
        spec: {
          minReplicaCount: props.autoscaling.minReplicas,
          maxReplicaCount: props.autoscaling.maxReplicas,
          pollingInterval: props.autoscaling.pollingInterval,
          cooldownPeriod: props.autoscaling.cooldownPeriod,
          scaleTargetRef: {
            apiVersion: deployment.apiVersion,
            kind: deployment.kind,
            name: deployment.name,
            envSourceContainerName: containerName,
          },
          triggers: [
            ...redisListScalers.map((scaler) => ({
              type: "redis",
              name: `${id}-redis-${scaler.listName}`,
              metadata: {
                host: scaler.redisConnectionDetails.host,
                port: scaler.redisConnectionDetails.port,
                databaseIndex: scaler.redisConnectionDetails.database,
                listName: scaler.listName,
                listLength: String(scaler.listLength),
              },
            })),
          ],
        },
      });
    }
  }

  validateProps(props: BackgroundWorkerProps): void {
    if (props.stopSignal && props.lifecycle?.preStop) {
      throw new Error(
        "stopSignal and lifecycle.preStop are mutually exclusive",
      );
    }

    if (props.replicas && props.autoscaling) {
      throw new Error("replicas and autoscaling are mutually exclusive");
    }
  }

  createLifecycle({
    stopSignal,
    lifecycle,
  }: BackgroundWorkerProps): Lifecycle | undefined {
    if (stopSignal) {
      return {
        ...lifecycle,
        preStop: {
          exec: {
            command: [
              "/bin/sh",
              "-c",
              `kill -${stopSignal} 1 && while kill -0 1; do sleep 1; done`,
            ],
          },
        },
      };
    }

    return lifecycle;
  }
}
