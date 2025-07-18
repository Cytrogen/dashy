const fs = require('fs');
const config = {
  auth: {
    enableGuestAccess: true,
    users: [
      {
        name: process.env.ADMIN_USER,
        password: process.env.ADMIN_PASS,
        type: 'admin'
      }
    ]
  }
};

fs.writeFileSync('user-data/conf.yml', yamlStringify(config)); // 使用 js-yaml 库转换为 YAML
