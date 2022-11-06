# Notification Handler

## About

Notification handler for Pi-Eye

### Built With

* NodeJS
* TypeScript
* nodemailer

## Getting Started

### Prerequisites

1. [Node](https://nodejs.org/en/) and npm

### Installation

1. Install NPM package: notification-handler
    ```sh
    npm install https://github.com/Pi-Eye/notification-handler
    ```

## Usage

### Example Notification Handler

```js
import { Notifications } from "notification-handler";

const notification_config = {
  from_email: "test@email.com";
  mail_host: "email.com";
  mail_port: 587;
  mail_user: "user";
  mail_pass: "pass";
  emails: "recipient@email.com";     // comma separated list of recipiants
}

const motion_config = {
  start_trigger: 0.5;              // percentage of frames with motion in the past {start_trigger_length} frames to trigger motion
  start_trigger_length: 10;
  stop_timeout: 100;               // frames to wait after no motion detected before emiting stop
}

notif = new Notifications("Camera Name", motion_config, notification_config);

const frame; // some jpg buffer
const timestamp = Date.now();
const motion = false;

notif.Frame(frame, timestamp, motion);
```

## License

Distributed uner the GPL-3.0 License. See `LICENSE.txt` for more information.

## Contact

Bennett Wu - bwu1324@gmail.com