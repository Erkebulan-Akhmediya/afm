import nconf from "nconf";
import log from "./logger";

const config: string = process.env.CONFIG_FILE as string

log.info(`Config: ${config}`);
nconf
  .argv()
  .file({
    file: process.cwd() + config,
  })
  .env();

export { default } from "nconf";
