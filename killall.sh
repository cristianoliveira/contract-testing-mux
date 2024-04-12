#!/bin/bash

ps aux | grep prism | awk '{ print $2 }' | xargs kill
