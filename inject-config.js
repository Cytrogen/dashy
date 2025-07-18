const fs = require('fs');
const yaml = require('js-yaml');
const crypto = require("crypto");

const hashPassword = (text) =>
  crypto.createHash("sha256").update(text).digest("hex");

const config = {
  auth: {
    enableGuestAccess: true,
    users: [
      {
        name: hashPassword(process.env.ADMIN_USER),
        password: hashPassword(process.env.ADMIN_PASS),
        type: 'admin'
      }
    ]
  }
};

try {
  fs.writeFileSync('user-data/conf.yml', yaml.dump(config));
} catch (e) {
  console.error('配置文件写入失败:', e);
  process.exit(1);
}
