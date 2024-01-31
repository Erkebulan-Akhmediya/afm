ARG NODE_VERSION

FROM --platform=linux/amd64 node:$NODE_VERSION AS base

RUN npm config set registry http://registry.npmjs.org/

## Base setup
ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8
ENV ROOT /app

WORKDIR $ROOT

ENV TZ=Asia/Almaty
RUN ln -snf "/usr/share/zoneinfo/$TZ" /etc/localtime
RUN echo "$TZ" > /etc/timezone

RUN apt-get update \
  && apt-get install -y --no-install-recommends software-properties-common \
  && apt-get install -y --no-install-recommends build-essential \
  && apt-get install -y --no-install-recommends apt-utils \
  && apt-get install -y --no-install-recommends libc-dev \
  && apt-get install -y --no-install-recommends libnss3 \
  && apt-get install -y --no-install-recommends libharfbuzz-dev \
  && apt-get install -y --no-install-recommends ca-certificates \
  && apt-get install -y --no-install-recommends gcc \
  && apt-get install -y --no-install-recommends gettext \
  && apt-get install -y --no-install-recommends curl \
  && apt-get install -y --no-install-recommends udev \
  && apt-get install -y --no-install-recommends ttf-dejavu \
  && apt-get install -y --no-install-recommends fontconfig \
  && apt-get install -y --no-install-recommends libfontconfig \
  && apt-get install -y --no-install-recommends fonts-freefont-ttf \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

ENV LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu/

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    CHROME_PATH=/usr/bin/google-chrome \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

RUN apt-get update && apt-get install curl gnupg -y \
  && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install google-chrome-stable -y --no-install-recommends \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# refresh system font cache
RUN fc-cache -f -v

RUN mkdir /tmp/phantomjs \
    && curl -L https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2 \
            | tar -xj --strip-components=1 -C /tmp/phantomjs \
    && cd /tmp/phantomjs \
    && mv bin/phantomjs /usr/local/bin

COPY package*.json *config.json *config.js $ROOT/

RUN npm install

# Add commands
COPY devops/commands $ROOT/commands
RUN chmod +x $ROOT/commands/*
ENV PATH="$ROOT/commands:$PATH"

ADD src $ROOT/src
ADD migrations $ROOT/migrations
ADD tools $ROOT/tools

RUN npm run build

HEALTHCHECK --interval=3s --timeout=15s CMD curl -f http://localhost:8000/api/1.0/feedback/contacts?value=U2FsdGVkX18WkBElZXjsbXUHhvcgzup0b058Hp2oWx8%3D || kill 1

ENTRYPOINT [ "entrypoint.sh" ]
CMD [ "start.sh" ]
