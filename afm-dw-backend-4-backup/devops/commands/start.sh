#!/bin/bash

case "$ENV" in
"DEV")
    npm run start:nodemon
    ;;
"PROD")
    npm run start
    ;;
*)
    echo "NO ENV SPECIFIED!"
    exit 1
    ;;
esac
