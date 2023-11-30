import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // Log of queries in database
  constructor() {
    super({
      log: ["query"],
    });
  }
  async onModuleInit() {
    await this.$connect();
  }
}