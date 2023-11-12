/* eslint-disable prettier/prettier */
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TaskEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    email: string;

    @Column({ comment: '网站地址' })
    url: string

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

}
