/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { LoggedUser } from 'src/decorator/user.decorator';
import { FileIdDto, IdDto, TaskIntervalDto } from 'src/dto/common.dto';
import { TaskService } from './task.service';
import { JwtGuard } from 'src/guard/App.guard';

@Controller('/task')
export class TaskController {
    constructor(
        protected TaskService: TaskService
    ) { }
    @Post('/time')
    GetSet(@Body() TimeSet: TaskIntervalDto, @LoggedUser() UserId: any) {



        return this.TaskService.handleInterval(UserId.id, TimeSet)
    }
    //查看当前用户的所有的定时任务
    //判断当前用户是否登录的守卫
    @UseGuards(JwtGuard)
    @Get('/interval')
    FindUserInterval(@LoggedUser() UserId: any) {

        return this.TaskService.FindUserInterval(UserId.id)

    }
    @UseGuards(JwtGuard)
    @Get('/delete/:id')
    UserIntervalDelete(@Param() id: IdDto) {
        console.log(id);


        // return this.TaskService.FindUserInterval(UserId.id)

    }


}
