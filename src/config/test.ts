/* eslint-disable prettier/prettier */
import fs from 'fs';
import puppeteer from 'puppeteer';
import path from 'path';
import file from './upload';

async function createPhoto(url: string, width: number = 720, height: number = 720) {
    const saveDir = path.join(process.cwd(), 'save');
    if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir);
    }

    const filename = `${Math.random()}.png`;
    const filepath = path.join(saveDir, filename);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: filepath });
    await browser.close();

    // 调用 file 函数上传文件，并等待结果
    try {
        const uploadedUrl = await file(filepath);
        console.log('Uploaded file URL:', uploadedUrl);
        return uploadedUrl; // 返回线上地址
    } catch (error) {
        console.error('上传失败:', error);
    }
}

export default createPhoto

