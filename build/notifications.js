"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const events_1 = __importDefault(require("events"));
class Notifications {
    get events() { return this.events_; }
    constructor(cam_name, triggers, config) {
        this.events_ = new events_1.default;
        this.start_count_ = 0;
        this.frames_ = 0;
        this.motion_ = false;
        this.start_cache_ = [];
        this.stop_cache_ = [];
        this.cam_name_ = cam_name;
        this.config_ = config;
        this.triggers_ = triggers;
        this.start_thresh_ = Math.round(this.triggers_.start_trigger_length * this.triggers_.start_trigger);
        for (let i = 0; i < this.triggers_.start_trigger_length; i++) {
            this.start_cache_.push(false);
        }
        this.events_.on("start", (frame, timestamp) => {
            this.SendEmails(frame, timestamp);
        });
    }
    Frame(frame, timestamp, motion) {
        if (motion) {
            this.start_count_++;
        }
        this.start_cache_.push(motion);
        this.stop_cache_.push(motion);
        if (this.start_cache_.shift())
            this.start_count_--;
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
            if (this.motion_) {
                this.events_.emit("stop");
            }
            this.motion_ = false;
        }
    }
    SendEmails(frame, timestamp) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.config_.emails.length === 0)
                return;
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
                const transporter = nodemailer_1.default.createTransport({
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
                    if (error)
                        console.warn(error);
                });
            }
            catch (error) {
                console.warn(error);
            }
        });
    }
}
exports.default = Notifications;
//# sourceMappingURL=notifications.js.map