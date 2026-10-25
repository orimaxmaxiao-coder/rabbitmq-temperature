// 订阅者 1：DisplayService —— 把温度打印到屏幕
const amqp = require('amqplib');

const EXCHANGE = 'notifications';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

async function main() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, 'fanout', { durable: false });

  // 创建一个临时、独占的队列（名字由 RabbitMQ 自动生成），并绑定到交换机
  const { queue } = await channel.assertQueue('', { exclusive: true });
  await channel.bindQueue(queue, EXCHANGE, '');

  console.log('[DisplayService] Waiting for temperature data... (Ctrl+C to exit) / 等待温度数据... (Ctrl+C 退出)');

  channel.consume(
    queue,
    (msg) => {
      if (!msg) return;
      const data = JSON.parse(msg.content.toString());
      console.log(
        `[DisplayService] Sensor 传感器: ${data.sensor_id} | Temperature 温度: ${data.temperature} °C | Time 时间: ${data.timestamp}`
      );
    },
    { noAck: true }
  );
}

main().catch((err) => {
  console.error('[DisplayService] Error / 错误:', err.message);
  process.exit(1);
});
