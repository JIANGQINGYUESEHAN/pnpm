import { IsDate, IsNumber, IsString } from 'class-validator';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';

import { UserEntity } from 'src/entity/user.entity';
import { Post } from '../post/post.entity';

@Entity()
export class subscribed {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  title: string;

  @Column()
  siteUrl: string;

  @Column()
  @IsString()
  feedUrl: string;

  @Column({ nullable: true })
  profileImageUrl: string | null;

  @Column({ nullable: true })
  serviceOn: string | null;

  @OneToMany((type) => Post, (post) => post.subscribed)
  posts: Post[];

  @ManyToMany((type) => UserEntity, { eager: true })
  @JoinTable()
  followers: UserEntity[];

  @Column({ default: 0 })
  @IsNumber()
  renewalTime: number;

  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;
}
