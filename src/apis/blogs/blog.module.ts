import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogService } from './blog.service';
import { GoogleDriveUploader } from 'src/providers/storage/drive/drive.upload';
import { BlogController } from './blog.controller';
import { UserSchema } from '../auth/UserSchema/user.schema';
import { BlogSchema, ChildTopicSchema, TopicSchema } from './BlogSchema/blog.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'Blog', schema: BlogSchema },
    { name: 'Topic', schema: TopicSchema },
    { name: 'ChildTopic', schema: ChildTopicSchema },
    {name : 'User', schema: UserSchema}

  ])],
  controllers: [BlogController],
  providers: [BlogService , GoogleDriveUploader],
})
export class BlogModule {}
