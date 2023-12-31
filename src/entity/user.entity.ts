import { DefaultAvatarImage } from 'src/config/entity.config';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { FileEntity } from './file.entity';

@Entity()
export class UserEntity extends BaseEntity {
  @Expose()
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ comment: '昵称' })
  username: string;

  @Expose()
  @Column({ default: DefaultAvatarImage })
  avatarSrc: string;

  @Exclude()
  @Column({ select: false, comment: '密码', default: '123456' })
  password: string;

  @Expose()
  @Column({ default: '这个人很懒', comment: '个性签名' })
  intro: string;

  @Expose()
  @Column({ comment: '邮箱' })
  email: string;

  @Expose()
  @Column({ comment: '手机号', default: '' })
  phone: string;
  @Column({ default: '' })
  photo: string;

  @Column({ default: false, comment: '是否为会员' })
  isVip: boolean;

  @OneToMany(() => FileEntity, (file) => file.user)
  file: string;

  @CreateDateColumn()
  createTime: string;
}
