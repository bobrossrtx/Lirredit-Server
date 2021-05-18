// import { Config } from "./config";
import { Post } from './entities/Post';
import { User } from './entities/User';
import { __prod__ } from './constants';
import { MikroORM } from '@mikro-orm/core';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export default {
    migrations: {
        path: path.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
    entities: [Post, User],
    dbName: process.env.USER,
    type: 'postgresql',
    debug: !__prod__,
    password: process.env.PASSWORD
} as Parameters<typeof MikroORM.init>[0];