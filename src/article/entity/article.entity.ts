import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column('text', { default: '' })
  content!: string;

  @Column('simple-array', { default: [] })
  tags!: string[];

  @Column({ default: false })
  isPublic!: boolean;

  @CreateDateColumn({ type: 'timestamptz', update: false })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @ManyToOne(() => User, (user) => user.articles)
  @JoinColumn({ name: 'authorId' })
  author?: User;

  @Column({ nullable: false })
  authorId!: number;
}
