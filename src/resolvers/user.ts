import { __prod__ } from "./../constants";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver } from "type-graphql";
import { MyContext } from "src/types";
import { User } from "../entities/User";
import argon2 from 'argon2';

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  email: string;
  @Field()
  password: string;
}

@InputType()
class UsernamePasswordLoginInput {
  @Field()
  username: string;
  @Field({ nullable: true })
  email: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 3) return {
      errors: [{
        field: "Username",
        message: "Username length must be greater than 2."
      }]
    }
    if (options.email.length <= 3) return {
      errors: [{
        field: "Email",
        message: "Email length must be greater than 2."
      }]
    }
    if (options.password.length <= 7) return {
      errors: [{
        field: "Password",
        message: "Password length must be at least 8."
      }]
    }

    const emailReg = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i
    if (!options.email.match(emailReg)) return {
      errors: [{
        field: "Email",
        message: "Email must be valid."
      }]
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      email: options.email,
      password: hashedPassword
    });
    try {
      await em.persistAndFlush(user);
    } catch (err) {
      // Duplicate error
      if (err.code === '23505' || err.detail.includes('already exists')) {
        return {
          errors: [{
            field: "Username/Email",
            message: "Username/Email already exists"
          }]
        };
      }
      console.error(`ERROR: ${err.message}\n`);
    }
    await em.persistAndFlush(user);
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordLoginInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });
    if (!user) return {
      errors: [{
        field: "username",
        message: "that username doesn't exist.",
      }]
    };

    const valid = await argon2.verify(user.password, options.password);
    if (!valid) return {
      errors: [{
        field: "Password",
        message: "Incorrect Password."
      }]
    };

    return { user };
  }
}