const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const pluginName = 'ExtractAuthPlugin';


class ExtractAuthPlugin {
  constructor({ route, authContent, appKey }) {
    this.route = route; // 配置了权限的路由  例子为本项目tempalte目录下routeExample.js
    this.authContent = authContent; // 菜单目录
    this.appKey = appKey; // 哪个系统的权限
  }

  TransFormRouteToAuth(arr) {
    arr.forEach(item => {
      if (!item.component) {
        item.type = 'route';
      }
      item.name = item.cName;
      item.key = item.path;
      if (item.path.startsWith('/')) {
        item.key = item.path.substring(1);
      }
      item.key = item.key.replace('-', '_');
      item.key = item.key.replace('/', ':');
      item.key = item.key.toUpperCase();
      if (item.routes && item.routes.length > 0) {
        item.children = item.routes;
        this.TransFormRouteToAuth(item.children);
        delete item.routes;
      }
      if (!item.routes && item.component) {
        // 此处的auth/index.json 的例子为本项目template目录下authExample.json
        // 此处拼接出来的路径例子为 你的项目/src/Op/auth/index.json
        const authJson = require(path.resolve(process.cwd(), this.authContent, item.component, 'auth/index.json'));
        item.children = authJson;
      }
    })
  }

  upload(filePath, onSuccess, onErr) {
    const formData = new FormData();
    const authFilePath = path.resolve(process.cwd(), filePath);
    const file = fs.createReadStream(authFilePath);
    formData.append('file', file);
    axios({
      url: 'http://127.0.0.1:9900/api/uploadfile',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data', // 必须要设置
      }
    }).then(() => {
      onSuccess();
    }).catch(err => {
      onErr(err);
    })
  }

  apply(compiler) {
    compiler.hooks.emit.tapPromise(pluginName, (compilation) => {
      return new Promise((resolve, reject) => {
        const routes = require(path.resolve(process.cwd(), this.route));
        const json = JSON.parse(JSON.stringify(routes));
        this.TransFormRouteToAuth(json);
        try {
          fs.writeFileSync('./authorization.js', `export const APP_KEY = "${this.appKey}";\nexport default ${JSON.stringify(json, null, 2)}`, 'utf-8')
        } catch (error) {
          console.error('write file failed');
          reject();
        }
        this.upload('./authorization.js', (info) => {
          resolve(info);
        }, (error) => {
          reject(error);
        });
      })
    })
  }
}

module.exports = ExtractAuthPlugin;