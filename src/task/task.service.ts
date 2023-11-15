/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { HttpException, Injectable } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import * as  dayjs from "dayjs";
import { TaskIntervalDto } from "src/dto/common.dto";
import { EmailService, WebService } from "src/service";
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import { uuid } from "src/config/util.config";
import { FileRepository } from "src/repository/user.repository";
import { FileEntity } from "src/entity/file.entity";
import { email } from '../config/util.config';

@Injectable()
export class TaskService {
    protected title: string;
    constructor(
        private schedulerRegistry: SchedulerRegistry,
        protected webService: WebService,
        protected emailService: EmailService,
        protected fileRepository: FileRepository,
    ) { }


    async handleInterval(userId, TimeSet: TaskIntervalDto) {
        //获取用户信息
        const user = await this.webService.findUser(userId)
        //先判断当前任务是否存在

        //判断该用户的选择的定时任务的方式
        if (TimeSet.cycle === 'week') {
            const name = uuid()
            this.WeekInterval(user, TimeSet, name)
        }
        if (TimeSet.cycle === 'month') {
            const name = uuid()
            this.MonthInterval(user, TimeSet, name)

        }
    }

    //周定时
    WeekInterval(user, TimeSet, name) {
        //获取当前周几
        const now = dayjs().day() + 1;


        //先判断当前用户的当前网址的定时任务是否存在


        this.SetInterval(name, async (user, TimeSet) => {
            try {

                await this.SpecificProcess(user, name, TimeSet)


            } catch (error) {
                throw new HttpException("定时任务设置失败，请重试", 301)
            }



        }, [user, TimeSet, path], '*', '*', TimeSet.Date, '*', '*', now);
    }
    //月定时
    MonthInterval(user, TimeSet: TaskIntervalDto, name) {
        //获取当前是一个月的几号
        const now = dayjs().date();
        this.SetInterval(name, async (user, TimeSet) => {
            try {
                await this.SpecificProcess(user, name, TimeSet)


            } catch (error) {
                throw new HttpException("定时任务设置失败，请重试", 301)
            }



        }, [user, TimeSet, path], '*', '*', TimeSet.Date, now, '*', '*');
    }
    //定时任务具体流程
    async SpecificProcess(user, name, TimeSet) {




        //根据当前网址的任务是否存在如果是就直接发送不要直接保存不走流程了
        if (!await this.IntervalExist(TimeSet.url, TimeSet.cycle, user)) {
            const result = await this.InterValDetail(TimeSet.url, TimeSet.cycle, user)

            this.emailService.example((result as any).email, (result as any).fileUrl, `定时任务${(result as any).title}.html`)
            return;
        } else {
            //发送网址
            const data = await this.webService.WebRequest(TimeSet.url);
            const { fullPath } = await this.WebAnalysis(data)

            //存储数据
            const result = this.fileRepository.createQueryBuilder()
                .insert()
                .into(FileEntity)
                .values({
                    user,
                    fileUrl: fullPath,
                    email: TimeSet.email,
                    title: this.title,
                    TimeSchedulerName: name,
                    TimeInterval: TimeSet.cycle,
                    url: TimeSet.url

                })
                .execute();

            //邮件发送请求
            await this.emailService.example(TimeSet.email, fullPath, `定时任务${this.title}.html`)
        }
    }
    /**
     * 
     * @param name 定时任务的名字
     * @param seconds 确定的秒数
     * @param minute 确定的分钟
     * @param hour 确实的小时
     * @param dayOfMonth 确定的某月的某一天
     * @param month 确定的某月的某一月
     * @param dayOfWeek 确定的某周的某一天
     */
    //创建定时任务
    SetInterval(name, Task, args = [], seconds: any = '*', minute: any = '*', hour: any = '*', dayOfMonth: any = '*', month: any = '*', dayOfWeek: any = '*') {
        try {
            const job = new CronJob(`${seconds} ${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`, () => {
                Task(...args);
            });
            this.schedulerRegistry.addCronJob(name, job);
            job.start();
        } catch (error) {
            console.error(error);
        }
    }
    async WebAnalysis(data) {

        try {
            const $ = cheerio.load(data);
            // 移除 'img' 从要抽取的标签列表
            const tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'ol', 'ul'];
            const tagsWithContentAndAttributes = [];
            this.title = $('head title').text();
            function cleanText(text) {
                // 去除多余的空格和换行符
                return text.replace(/\s+/g, ' ').trim();
            }

            function getText(node) {
                if (node.type === 'text') return cleanText(node.data);
                if (node.children) return node.children.map(getText).join(' ');
                return '';
            }

            function getAttributes(node, attributes) {
                const attrs = {};
                attributes.forEach((attr) => {
                    if (node.attribs && node.attribs[attr]) {
                        attrs[attr] = node.attribs[attr];
                    }
                });
                return attrs;
            }

            $('body')
                .find(tags.join(','))
                .each(function () {
                    const element = $(this);
                    const tagDetails = {
                        tag: element.prop('tagName').toLowerCase(),
                        content: getText(this),
                        attributes: getAttributes(this, ['href', 'title']), // 移除 'src' 和 'alt' 属性
                    };
                    tagsWithContentAndAttributes.push(tagDetails);
                });

            return await this.formatElementsForHtml(tagsWithContentAndAttributes);


        } catch (error) {
            console.error('Error processing HTML:', error);
        }
    }
    formatElementsForHtml(elements) {
        try {
            let htmlString =
                '<!DOCTYPE html>\n<html>\n<head>\n<title>Document</title>\n</head>\n<body>\n';

            elements.forEach((tag) => {
                // 打开标签
                htmlString += `<${tag.tag}`;

                // 添加属性
                for (const [key, value] of Object.entries(tag.attributes || {})) {
                    htmlString += ` ${key}="${value}"`;
                }

                // 关闭开标签
                htmlString += '>';

                // 添加内容
                if (tag.content) {
                    htmlString += tag.content;
                }

                // 闭合标签
                if (!tag.selfClosing) {
                    htmlString += `</${tag.tag}>`;
                }
            });

            htmlString += '\n</body>\n</html>'; // 结束 HTML 文档

            return this.CreateFile(htmlString);

        } catch (error) {
            throw new HttpException('文本传输错误', 301);
        }

    }
    createFullPath(suffix: string = '.html') {
        // 创建文件存储的目录
        const fileDirectory = path.join(process.cwd(), 'src', 'file');
        if (!fs.existsSync(fileDirectory)) {
            fs.mkdirSync(fileDirectory, { recursive: true });
        }

        // 生成基于时间戳的文件名
        const timestampFilename = `${new Date().getTime()}${suffix}`;
        const fullPath = path.join(fileDirectory, timestampFilename);
        return fullPath;
    }
    async CreateFile(Text) {
        const fullPath = await this.createFullPath();
        // 写入文件
        fs.writeFileSync(fullPath, Text);
        if (!this.title) {
            this.title = new Date().getTime().toString();
        }
        return {
            fullPath,
        };
    }

    //查看当前用户的定时任务的路径是否与之相同
    async UserInterval(url, cycle, user) {
        const result = await this.fileRepository
            .createQueryBuilder()
            .where({ url: url })
            .andWhere({ TimeInterval: cycle })
            .andWhere({ user })
            .getOne()

        if (result) {
            return false
        } else {
            return true
        }
    }

    //查看定时任务是否存在
    async IntervalExist(url, cycle, user) {
        const result = await this.fileRepository
            .createQueryBuilder()
            .where({ url: url })
            .andWhere({ TimeInterval: cycle })
            .andWhere({ user })
            .getOne()

        if (result) {
            return false
        } else {
            return true
        }
    }
    //根据网址查询网址的具体信息
    async InterValDetail(url, cycle, user) {
        try {
            const result = await this.fileRepository
                .createQueryBuilder()
                .where({ url: url })
                .andWhere({ TimeInterval: cycle })
                .andWhere({ user })
                .getOne()
            if (result) {
                return result
            }
        } catch (error) {
            throw new HttpException("查询错误请重试", 301)
        }
    }
    //删除当前当前定时任务
    async UserIntervalDelete(id) {
        if (!id) {
            // Handle the case where id is null, undefined, or invalid
            throw new HttpException("Invalid ID provided", 301);
        }

        try {
            const result = await this.fileRepository
                .createQueryBuilder("task")
                .delete()
                .where({ id: id })
                .execute();

            // Optionally, return some information about the operation
            return result;
        } catch (error) {
            // Handle or log the error
            throw new Error("Error occurred during deletion");
        }
    }

    //查看当前用户的所有定时任务
    async FindUserInterval(userId) {
        const user = await this.webService.findUser(userId)
        const result = await this.fileRepository
            .createQueryBuilder("task")
            .where({ user: user })
            .andWhere("task.TimeInterval IS NOT NULL")
            .getMany();

        return result;
    }

}