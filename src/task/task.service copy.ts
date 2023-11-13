/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import * as  dayjs from "dayjs";
import { TaskIntervalDto } from "src/dto/common.dto";
import { WebService } from "src/service";


@Injectable()
export class TaskService {

    constructor(
        private schedulerRegistry: SchedulerRegistry,
        protected webService: WebService
    ) { }


    async handleInterval(userId, TimeSet: TaskIntervalDto) {
        //获取用户信息
        const user = await this.webService.findUser(userId)


        //判断该用户的选择的定时任务的方式
        if (TimeSet.cycle === 'week') {
            this.WeekInterval(userId, TimeSet)
        }
        if (TimeSet.cycle === 'month') {
            this.MonthInterval(userId, TimeSet)

        }
    }

    //周定时
    WeekInterval(user, TimeSet) {
        //获取当前周几
        const now = dayjs().day() + 1;
        console.log(now);

        this.SetInterval('aaa', async (user, TimeSet) => {
            //发送网址
            const data = await this.webService.WebRequest(TimeSet.url);
            //
            this.webService.WebAnalysis(data);

            //存储数据

            //那边我还的瞅一下，相同网址且相同地址的不进行增加


        }, [user, TimeSet], 2);
    }
    //月定时
    MonthInterval(user, TimeSet: TaskIntervalDto) {
        //获取当前是一个月的几号
        const now = dayjs().date();
        console.log(now);
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

}