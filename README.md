# Temperature Sensor Notification (RabbitMQ)
# 温度传感器通知（RabbitMQ）

A temperature sensor notification system built with a RabbitMQ **fanout exchange**.
使用 RabbitMQ 的 **fanout 交换机** 实现的温度传感器通知系统。

```
Publisher ──► [notifications (fanout)] ──┬──► Queue A ──► DisplayService (print to screen / 打印到屏幕)
                                         └──► Queue B ──► LogService (save to temperature_log.txt / 写入文件)
```

A fanout exchange broadcasts every message to all bound queues, so both subscribers receive every message.
fanout 交换机会把每条消息广播给所有绑定的队列，所以两个订阅者都能收到每一条消息。

## Files / 文件说明

| File / 文件 | Description | 说明 |
|---|---|---|
| `publisher.js` | Sends `{ sensor_id, temperature, timestamp }` every 3 seconds | 每 3 秒发送一条传感器消息 |
| `display_service.js` | Subscriber 1: prints the temperature to the screen | 订阅者 1：把温度打印到屏幕 |
| `log_service.js` | Subscriber 2: appends the temperature to `temperature_log.txt` | 订阅者 2：把温度追加写入 `temperature_log.txt` |
| `docker-compose.yml` | Starts RabbitMQ (with management UI) | 启动 RabbitMQ（含管理界面） |
| `run.bat` | Windows: opens all 3 services in separate windows | Windows：一键打开 3 个服务窗口 |

## Message Format / 消息格式

```json
{ "sensor_id": "s01", "temperature": 37.5, "timestamp": "2025-11-11T02:59:00.000Z" }
```

- `temperature`: random number (20.0 – 40.0) / 随机数（20.0 – 40.0）
- `timestamp`: current time via `new Date().toISOString()` / 当前时间，使用 `toISOString()`
- Sent periodically with `setInterval`, 1 message per 3 seconds / 使用 `setInterval` 每 3 秒发送一条

## How to Run / 运行步骤

1. Start RabbitMQ / 启动 RabbitMQ：
   ```bash
   docker compose up -d
   ```
2. Install dependencies / 安装依赖：
   ```bash
   npm install
   ```
3. Open 3 terminals and run (start the subscribers first) / 打开 3 个终端分别运行（先启动订阅者）：
   ```bash
   npm run display
   npm run log
   npm run publisher
   ```
   On Windows you can simply double-click `run.bat`.
   Windows 上也可以直接双击 `run.bat`。

Management UI / 管理界面：http://localhost:15672 （username / password 账号 / 密码：guest / guest）
