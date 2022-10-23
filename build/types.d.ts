/// <reference types="node" />
export type NotificationConfig = {
    from_email: string;
    mail_host: string;
    mail_port: number;
    mail_user: string;
    mail_pass: string;
    emails: string;
};
export type MotionTrigger = {
    start_trigger: number;
    start_trigger_length: number;
    stop_timeout: number;
};
export type NotificationEvents = {
    start: (frame: Buffer, timestamp: number) => void;
    stop: () => void;
};
