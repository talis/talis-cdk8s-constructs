import {
  Affinity,
  HostAlias,
  LocalObjectReference,
  Volume,
} from "../../imports/k8s";

export function defaultAffinity(matchLabels: {
  [key: string]: string;
}): Affinity {
  return {
    podAntiAffinity: {
      preferredDuringSchedulingIgnoredDuringExecution: [
        {
          podAffinityTerm: {
            labelSelector: { matchLabels },
            topologyKey: "topology.kubernetes.io/zone",
          },
          weight: 100,
        },
      ],
    },
  };
}

export interface WorkloadProps {
  /**
   * Static number of replicas. Kubernetes default is 1 if not specified.
   */
  readonly replicas?: number;

  /**
   * The number of old ReplicaSets to retain to allow rollback.
   * @default 1
   */
  readonly revisionHistoryLimit?: number;

  /**
   * Pod's scheduling constraints. Defaults to a soft anti-affinity for the same service in the same AWS zone.
   * Will not include affinity if explicitly set to `undefined`.
   */
  readonly affinity?: Affinity;

  /**
   * Custom function to build Pod's scheduling constraints.
   * @param matchLabels Selector labels used in the workload.
   */
  readonly makeAffinity?: (matchLabels: {
    [key: string]: string;
  }) => Affinity | undefined;

  /**
   * Whether a service account token should be automatically mounted.
   * @default false
   */
  readonly automountServiceAccountToken?: boolean;

  /**
   * A list of references to secrets in the same namespace to use for pulling any of the images.
   */
  readonly imagePullSecrets?: LocalObjectReference[];

  /**
   * Pod's priority class.
   */
  readonly priorityClassName?: string;

  /**
   * Duration in seconds the pod needs to terminate gracefully.
   * @default 30 seconds.
   */
  readonly terminationGracePeriodSeconds?: number;

  /**
   * List of volumes that can be mounted by containers belonging to the Pod.
   */
  readonly volumes?: Volume[];

  /**
   * An optional list of hosts and IPs that will be injected into the pod's hosts file.
   */
  readonly hostAliases?: HostAlias[];
}
