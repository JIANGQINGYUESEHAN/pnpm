/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Body, Controller, Post } from '@nestjs/common';
import { LoggedUser } from 'src/decorator/user.decorator';
import { TaskIntervalDto } from 'src/dto/common.dto';
import { TaskService } from './task.service';

@Controller('/task')
export class TaskController {
    constructor(
        protected TaskService: TaskService
    ) { }
    @Post('/time')
    GetSet(@Body() TimeSet: TaskIntervalDto, @LoggedUser() UserId: any) {



        return this.TaskService.handleInterval(UserId.id, TimeSet)
    }


}
