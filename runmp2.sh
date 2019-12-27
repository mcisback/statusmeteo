#!/bin/bash

if [ "$1" -eq "start" ]; then

    # START
    pm2 start ecosystem.config.js --env production

elif [ "$1" -eq "reload" ]; then

    # RELOAD
    pm2 reload ecosystem.config.js --env production

fi
