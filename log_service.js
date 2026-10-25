// 订阅者 2：LogService —— 把温度保存到文本文件
const amqp = require('amqplib');
const fs = require('fs');
const path = require('path');

const EXCHANGE = 'notifications';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const LOG_FILE = path.join(__dirname, 'temperature_log.txt');

async function main() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, 'fanout', { durable: false });

  // 每个订阅者有自己的队列，所以两个服务都能收到同一条消息
  const { queue } = await channel.assertQueue('', { exclusive: true });
  await channel.bindQueue(queue, EXCHANGE, '');

  console.log(`[LogService] Waiting for temperature data, writing to ${LOG_FILE} ... (Ctrl+C to exit) / 等待温度数据，写入 ${LOG_FILE} ... (Ctrl+C 退出)`);

  channel.consume(
    queue,
    (msg) => {
      if (!msg) return;
      const data = JSON.parse(msg.content.toString());
      const line = `${data.timestamp},${data.sensor_id},${data.temperature}\n`;
      fs.appendFileSync(LOG_FILE, line);
      console.log('[LogService] Saved / 已保存:', line.trim());
    },
    { noAck: true }
  );
}

main().catch((err) => {
  console.error('[LogService] Error / 错误:', err.message);
  process.exit(1);
});
