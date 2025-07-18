const fs     = require('fs');
const yaml   = require('js-yaml');
const crypto = require('crypto');

const hash = (text) =>
  crypto.createHash('sha256').update(text).digest('hex');

if (!process.env.ADMIN_USER || !process.env.ADMIN_PASS) {
  console.error('请设置 ADMIN_USER 和 ADMIN_PASS 环境变量');
  process.exit(1);
}

const filePath = 'user-data/conf.yml';
// 1. 读取已有配置
let doc;
try {
  doc = yaml.load(fs.readFileSync(filePath, 'utf8'));
} catch (e) {
  console.error('读取 conf.yml 失败：', e);
  process.exit(1);
}

// 2. 确保 appConfig 存在
doc.appConfig = doc.appConfig || {};

// 3. 注入 auth
doc.appConfig.auth = {
  enableGuestAccess: true,
  defaultAuthLevel: 'guest',
  users: [
    {
      user: process.env.ADMIN_USER,
      hash: hash(process.env.ADMIN_PASS),
      type: 'admin'
    }
  ]
};

// 4. 写回文件
try {
  fs.writeFileSync(filePath, yaml.dump(doc), 'utf8');
  console.log('✅ conf.yml 已成功注入 auth');
} catch (e) {
  console.error('写入 conf.yml 失败：', e);
  process.exit(1);
}
