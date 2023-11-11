/* eslint-disable prettier/prettier */
import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

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
}
