/** IMPORTS **/

import 'reflect-metadata';

// Postgres
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql'
import microConfig from './mikro-orm.config';

// Config
import { Config } from './config';

// Express
import express from 'express';

// Resolvers
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';

// Redis
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    session({
      name: 'qid',
      store: new RedisStore({
        client: redisClient,
        
      }),
      secret: 'ajklsdrf9JLKSDJF9sdkfjaosdkajf90SOLDIFKj',
      resave: false,
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),
    context: () => ({ em: orm.em })
  });

  apolloServer.applyMiddleware({ app });

  app.set('port', Config.port[2])
  app.listen(app.get('port'), () => {
    console.log(`Server stated on localhost:${Config.port[2]}`);
    console.log(`http://${Config.host}:${Config.port[2]}`);
  })
}

main().catch(err => console.error(err));
