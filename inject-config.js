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

// 4. 注入天气 Widget
const WEATHER_SECTION = '仪表盘小部件';
const weatherWidget = {
  type: 'weather',
  options: {
    provider: 'accuweather',
    apiKey: '$ACCUWEATHER_API_KEY',
    locationKey: '2171812',
    units: 'metric',
  },
};

// 确保 sections 数组存在
doc.sections = Array.isArray(doc.sections) ? doc.sections : [];

// 查找是否已存在 “仪表盘小部件” 节
const idx = doc.sections.findIndex(s => s.name === WEATHER_SECTION);
if (idx > -1) {
  doc.sections[idx].widgets = doc.sections[idx].widgets || [];
  doc.sections[idx].widgets.push(weatherWidget);
} else {
  doc.sections.push({
    name: WEATHER_SECTION,
    widgets: [weatherWidget],
  });
}

// 5. 写回文件
try {
  fs.writeFileSync(filePath, yaml.dump(doc), 'utf8');
  console.log('✅ conf.yml 已成功注入 auth');
} catch (e) {
  console.error('写入 conf.yml 失败：', e);
  process.exit(1);
}
