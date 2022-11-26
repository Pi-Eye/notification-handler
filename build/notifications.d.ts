/// <reference types="node" />
import TypedEmitter from "typed-emitter";
import { MotionTrigger, NotificationConfig, NotificationEvents } from "./types";
export default class Notifications {
    private events_;
    get events(): TypedEmitter<NotificationEvents>;
    private startup_motion_;
    private cam_name_;
    private triggers_;
    private config_;
    private start_count_;
    private frames_;
    private start_thresh_;
    private motion_;
    private start_cache_;
    private stop_cache_;
    constructor(cam_name: string, triggers: MotionTrigger, config: NotificationConfig);
    Frame(frame: Buffer, timestamp: number, motion: boolean): void;
    private SendEmails;
    SendDisconnectEmail(): void;
}
