import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { LoginRequestBody } from '../models/LoginRequestBody';
import { validate } from 'class-validator';

@Injectable()
export class LoginValidationMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const body = req.body;

    const loginRequestBody = new LoginRequestBody();
    loginRequestBody.email = body.email;
    loginRequestBody.password = body.password;

    const validations = await validate(loginRequestBody);

    if (validations.length) {
      throw new BadRequestException(
        validations.reduce((acc, curr) => {
          return [...acc, ...Object.values(curr.constraints)];
        }, []),
      );
    }

    next();
  }
}

// import {
//   BadRequestException,
//   Injectable,
//   NestMiddleware,
//   Req,
//   Res,
// } from '@nestjs/common';
// import { FastifyReply, FastifyRequest } from 'fastify';

// import { LoginRequestBody } from '../models/LoginRequestBody';
// import { validate } from 'class-validator';

// @Injectable()
// export class LoginValidationMiddleware implements NestMiddleware {
//   async use(request: any, response: FastifyReply, next: () => void) {
//     const body = request.body;

//     // console.log('obaaaaaaaaaaaaaaaaa', body);
//     console.log('req req', request.body);

//     const loginRequestBody = new LoginRequestBody();
//     loginRequestBody.email = body.email;
//     loginRequestBody.password = body.password;

//     const validations = await validate(loginRequestBody);

//     if (validations.length) {
//       throw new BadRequestException(
//         validations.reduce((acc, curr) => {
//           return [...acc, ...Object.values(curr.constraints)];
//         }, []),
//       );
//     }

//     next();
//   }
// }
