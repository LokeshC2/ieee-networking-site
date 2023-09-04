#!/usr/bin/env bash
HOME=$(pwd)
if [ ! -d "$HOME/logs" ]; then
  mkdir $HOME/logs
fi
cd $HOME/Server
cat /dev/null > $HOME/logs/server.log
cat /dev/null > $HOME/logs/ui.log
npm start > $HOME/logs/server.log 2>&1 &
cd $HOME/UI
npm run dev > $HOME/logs/ui.log 2>&1 &
echo "Server started."
# stop both server and ui when press enter
echo "Press enter to stop."
read
killall node
echo "Server stopped."