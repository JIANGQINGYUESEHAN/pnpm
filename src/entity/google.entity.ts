import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
@Entity({ name: 'google_auth_info' })
export class GoogleAuthInfo {
  @PrimaryColumn({ length: 40 })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 40, unique: true })
  email: string;

  @Column({ name: 'email_verified', nullable: true })
  emailVerified: boolean;

  @Column({ name: 'google_user_id', length: 100, nullable: true })
  googleUserId: string;

  @Column({ length: 20, nullable: true })
  name: string;

  @Column({ name: 'give_name', length: 20, nullable: true })
  givenName: string;

  @Column({ name: 'family_name', length: 20, nullable: true })
  familyName: string;

  @Column({ length: 200, nullable: true })
  profile: string;

  @Column({ length: 200, nullable: true })
  picture: string;

  @Column({ length: 20, nullable: true })
  locale: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
