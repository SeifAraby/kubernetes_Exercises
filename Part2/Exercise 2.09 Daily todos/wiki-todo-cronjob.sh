#!/bin/bash

URL=$(wget --server-response --max-redirect=0 https://en.wikipedia.org/wiki/Special:Random 2>&1 | grep '^Location:' | awk '{print $2}')

if [ -z "$URL" ]; then
  echo "Failed to fetch the redirected URL"
  exit 1
fi

echo "${URL}"
TODO_TEXT="Read ${URL}"

PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "INSERT INTO todos (text) VALUES ('${TODO_TEXT}');"
