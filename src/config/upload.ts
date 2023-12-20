/* eslint-disable prettier/prettier */
import * as qiniu from 'qiniu';
import { uuid } from './util.config';

// 配置您的七牛云账户信息

const accessKey = 'jNjlNeRnRU7kdae4H09fwLy9OwrjJeu3PLheJigq';
const secretKey = 'L-hkUzxqDkgkW8oGd5ZVa6eXlD1HiOHBEaKx7z6E';
const bucket = 'zysource';

// 初始化Auth对象
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

// 配置上传策略
const options = {
    scope: bucket,
};

// 创建上传Token
const putPolicy = new qiniu.rs.PutPolicy(options);
const uploadToken = putPolicy.uploadToken(mac);

// 配置上传参数
const config = new qiniu.conf.Config();
// 不再需要设置zone

// 创建上传对象
const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();

// 定义要上传的本地文件路径


// 定义上传后的文件名，如果为空字符串，则七牛云会生成一个随机的文件名
const key = `${Math.random() * Math.random()}${uuid()}.png`;

// 上传文件
// 上传文件

function file(localFile: string) {
    return new Promise((resolve, reject) => {
        formUploader.putFile(
            uploadToken,
            key,
            localFile,
            putExtra,
            function (err, respBody, respInfo) {
                if (err) {
                    reject(err);
                    return;
                }
                if (respInfo.statusCode === 200) {
                    console.log('文件上传成功!');
                    const fileUrl = `http://zy.img.qiuyue.space/${encodeURIComponent(
                        key,
                    )}`;
                    console.log('文件URL:', fileUrl);
                    resolve(fileUrl); // 返回文件URL
                } else {
                    console.log(respInfo.statusCode);
                    console.log(respBody);
                    reject(new Error('文件上传失败'));
                }
            },
        );
    });
}
export default file;
