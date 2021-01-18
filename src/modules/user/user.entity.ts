import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  BeforeUpdate,
} from 'typeorm';
import { IsEmail, Min } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { Address } from '../address/address.entity';
import { Post } from '@modules/post/post.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  @Column({ nullable: true })
  @Expose()
  public name: string;

  @Column({ unique: true })
  @IsEmail()
  @Expose()
  public email: string;

  @Column()
  @Min(0)
  @Exclude()
  public password: string;

  @Column({ nullable: true })
  public phone?: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  @Expose()
  public createdAt?: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  public updatedAt?: Date;

  /* Relationship */
  @OneToOne(() => Address, (address: Address) => address.user, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  public address?: Address;

  @OneToMany(() => Post, (post: Post) => post.author)
  public posts?: Post[];

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }
}
