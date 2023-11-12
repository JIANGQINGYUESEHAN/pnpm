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
  @Column({ select: true, comment: '密码' })
  password: string;

  @Expose()
  @Column({ default: '这个人很懒', comment: '个性签名' })
  intro: string;

  @Expose()
  @Column({ default: '' })
  email: string;

  @Expose()
  @Column({ comment: '手机号' })
  phone: string;
  @Column({ default: false })
  photo: string;

  @Column({ default: false, comment: '是否为会员' })
  IsVip: boolean;

  @OneToMany(() => FileEntity, (file) => file.user)
  file: string;

  @CreateDateColumn()
  createTime: string;
}
