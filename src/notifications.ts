import nodemailer from "nodemailer";
import EventEmitter from "events";
import TypedEmitter from "typed-emitter";

import { MotionTrigger, NotificationConfig, NotificationEvents } from "./types";

export default class Notifications {
  private events_ = new EventEmitter as TypedEmitter<NotificationEvents>;
  get events() { return this.events_; }

  private cam_name_: string;
  private triggers_: MotionTrigger;
  private config_: NotificationConfig;

  private start_count_ = 0;
  private frames_ = 0;

  private start_thresh_: number;

  private motion_ = false;

  private start_cache_: Array<boolean> = [];
  private stop_cache_: Array<boolean> = [];

  constructor(cam_name: string, triggers: MotionTrigger, config: NotificationConfig) {
    this.cam_name_ = cam_name;
    this.config_ = config;
    this.triggers_ = triggers;

    this.start_thresh_ = Math.round(this.triggers_.start_trigger_length * this.triggers_.start_trigger);

    for (let i = 0; i < this.triggers_.start_trigger_length; i++) { this.start_cache_.push(false); }

    this.events_.on("start", (frame, timestamp) => {
      this.SendEmails(frame, timestamp);
    });
  }

  Frame(frame: Buffer, timestamp: number, motion: boolean) {
    if (motion) { this.start_count_++; }
    this.start_cache_.push(motion);
    this.stop_cache_.push(motion);

    if (this.start_cache_.shift()) this.start_count_--;

    this.frames_++;
    if (this.start_count_ >= this.start_thresh_) {
      if (!this.motion_) {

        this.events_.emit("start", frame, timestamp);
      }
      this.motion_ = true;
      this.frames_ = 0;
    }

    if (this.frames_ >= this.triggers_.stop_timeout) {
      this.frames_ = 0;
      if (this.motion_) { this.events_.emit("stop"); }
      this.motion_ = false;
    }

  }


  private async SendEmails(frame: Buffer, timestamp: number) {
    if (this.config_.emails.length === 0) return;
    try {
      const d = new Date(timestamp);
      const year = d.getFullYear();
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = months[d.getMonth()];
      const day = d.getDate();
      const hour = d.getHours();
      const min = d.getMinutes();
      const sec = d.getSeconds();

      const date = `${month} ${day}, ${year}`;
      const time = `${hour}:${min}:${sec}`;

      const img = `data:image/jpeg;base64, ${frame.toString("base64")}`;

      const transporter = nodemailer.createTransport({
        host: this.config_.mail_host,
        port: this.config_.mail_port,
        auth: {
          user: this.config_.mail_user,
          pass: this.config_.mail_pass
        }
      });

      transporter.sendMail({
        from: this.config_.from_email,
        to: this.config_.emails,
        subject: `${this.cam_name_}: Motion Was Detected At ${time} On ${date}`,
        text: "Attached is the frame motion was detected on",
        attachments: [{
          filename: "frame.jpg",
          path: img,
          cid: "motion_img"
        }]
      }, (error) => {
        if (error) console.warn(error);
      });
    } catch (error) {
      console.warn(error);
    }
  }

  SendDisconnectEmail() {
    try {
      const transporter = nodemailer.createTransport({
        host: this.config_.mail_host,
        port: this.config_.mail_port,
        auth: {
          user: this.config_.mail_user,
          pass: this.config_.mail_pass
        }
      });

      transporter.sendMail({
        from: this.config_.from_email,
        to: this.config_.emails,
        subject: `${this.cam_name_} disconnected and did not reconnected after 30 seconds`,
      }, (error) => {
        if (error) console.warn(error);
      });
    } catch (error) {
      console.warn(error);
    }
  }
}