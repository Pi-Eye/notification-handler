export type NotificationConfig = {
  from_email: string;
  mail_host: string;
  mail_port: number;
  mail_user: string;
  mail_pass: string;
  emails: string;     // comma separated list of recipiants
}

export type MotionTrigger = {
  start_trigger: number;              // percentage of frames with motion in the past {start_trigger_length} frames to trigger motion
  start_trigger_length: number;
  stop_timeout: number;               // frames to wait after no motion detected before emiting stop
}

export type NotificationEvents = {
  start: (frame: Buffer, timestamp: number) => void;
  stop: () => void;
}