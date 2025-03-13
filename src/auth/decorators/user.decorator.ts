import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "../../user/entity/user.entity";

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as User | null;
  },
);
