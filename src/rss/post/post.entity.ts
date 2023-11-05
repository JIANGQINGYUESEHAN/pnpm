import { IsDate, IsString } from 'class-validator';

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { subscribed } from '../subscribed/subscribed.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  title: string;

  @Column({ nullable: true })
  @IsString()
  thumbnail: string | null;

  @Column()
  @IsString()
  description: string;

  @ManyToOne((type) => subscribed, (subscribed) => subscribed.posts, {
    eager: true,
  })
  subscribed: subscribed;

  @Column()
  @IsDate()
  writtenDate: Date;

  @Column({ unique: true })
  @IsString()
  postUrl: string;

  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;
}
