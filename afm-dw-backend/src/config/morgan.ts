
import morgan, { StreamOptions } from "morgan";

import log from "./logger";

const stream: StreamOptions = {
  write: (message) => log.http(message),
};

const skip = () => {
  return process.env.MIDDLEWARE_MORGAN_SKIP === "1";
};

const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip }
);

export default morganMiddleware;
