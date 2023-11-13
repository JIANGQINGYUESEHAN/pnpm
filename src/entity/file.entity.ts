/* eslint-disable prettier/prettier */
import { Expose } from 'class-transformer';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { TimeFormat } from 'src/config/util.config';

@Entity()
export class FileEntity {
    @Expose()
    @PrimaryGeneratedColumn()
    id: string;
    @Expose()
    @Column({ comment: '该文件的标题' })
    title: string
    @Expose()
    @Column({ comment: '链接地址' })
    url: string
    @Expose()
    @Column({ comment: '要传送的文件地址' })
    email: string
    @Expose()
    @Column({ comment: '文件存放地址' })
    fileUrl: string
    @ManyToOne(() => UserEntity, user => user.file)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @Column({ comment: '是否是被定时的条列', default: false })
    IsSelect: boolean

    @Column({ comment: '定时模式(周定时,月定时)', default: null })
    TimeInterval: TimeFormat
    @Column({ comment: '被定时名字', default: null })
    TimeSchedulerName: string
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
