import { ContainerProps } from "../common";
import { LocalObjectReference, Volume } from "../../imports/k8s";
import { PodProps } from "../common/pod-props";

export interface CronJobProps
  extends Omit<
      ContainerProps,
      "startupProbe" | "readinessProbe" | "livenessProbe"
    >,
    PodProps {
  /** The schedule in Cron format, see https://en.wikipedia.org/wiki/Cron */
  readonly schedule: string;

  /**
   * This flag tells the controller to suspend subsequent executions.
   * @default false
   */
  readonly suspend?: boolean;

  /**
   * Custom selector labels, they will be merged with the default app, role, and instance.
   * They will be applied to the workload, the pod and the service.
   * @default { app: "<app label from chart>", role: "cronjob", instance: "<construct id>" }
   */
  readonly selectorLabels?: { [key: string]: string };

  /**
   * A list of references to secrets in the same namespace to use for pulling any of the images.
   */
  readonly imagePullSecrets?: LocalObjectReference[];

  /**
   * Pod's priority class.
   * @default "job"
   */
  readonly priorityClassName?: string;

  /**
   * list of volumes that can be mounted by containers belonging to the pod.
   */
  readonly volumes?: Volume[];

  /**
   * Restart policy for all containers within the pod.
   */
  readonly restartPolicy: string;

  /**
   * Specifies the number of retries before marking this job failed.
   * @default 6
   */
  readonly backoffLimit?: number;

  /**
   * Specifies the deadline in seconds for starting the job if it misses its scheduled time.
   */
  readonly startingDeadlineSeconds?: number;

  /**
   * Specifies the number of successful finished jobs to retain.
   * @default 3
   */
  readonly successfulJobsHistoryLimit?: number;

  /**
   * Specifies the number of failed finished jobs to retain.
   * @default 1
   */
  readonly failedJobsHistoryLimit?: number;
}
