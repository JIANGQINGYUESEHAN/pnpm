/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
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

        }
        if (TimeSet.cycle === 'month') {


        }
    }
    //月定时
    MonthInterval() { }
    //周定时
    WeekInterval() { }

    //创建定时任务
    SetInterval() {
        const job = new CronJob(`${seconds} * * * * *`, () => {

        });

        this.schedulerRegistry.addCronJob(name, job);
        job.start();


    }
}