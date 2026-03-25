#!/bin/sh
cd "$(dirname "$0")"
git add -f services/react-web-app/build/
git add services/react-web-app/serve.js
git status
git commit -m "Add SPA static build output"
git push origin main
