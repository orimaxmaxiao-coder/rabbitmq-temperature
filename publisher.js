// 发布者：每 3 秒向 fanout 交换机 "notifications" 发送一条传感器消息
const amqp = require('amqplib');

const EXCHANGE = 'notifications';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

async function main() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  // 创建 fanout 类型的交换机
  await channel.assertExchange(EXCHANGE, 'fanout', { durable: false });

  console.log('[Publisher] 已连接，每 3 秒发送一次温度数据... (Ctrl+C 退出)');

  setInterval(() => {
    const message = {
      sensor_id: 's01',
      // 随机温度：20.0 ~ 40.0，保留一位小数
      temperature: Number((20 + Math.random() * 20).toFixed(1)),
      // 当前时间，ISO 格式
      timestamp: new Date().toISOString(),
    };

    // fanout 交换机忽略 routing key，所以传空字符串
    channel.publish(EXCHANGE, '', Buffer.from(JSON.stringify(message)));
    console.log('[Publisher] 已发送:', message);
  }, 3000);

  process.on('SIGINT', async () => {
    await channel.close();
    await connection.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('[Publisher] 错误:', err.message);
  process.exit(1);
});
