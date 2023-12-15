#! /bin/bash
git stash
git pull
npm install
npm audit fix
npm run node-build
pm2 restart frontend