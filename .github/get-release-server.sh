#!/bin/bash

set -uxe

if [ $# -ne 1 ]; then
  echo "Usage: $0 OC_VERSION"
  echo " eg: $0 r/16.x -> Returns the current correct server for r/16.x"
  exit 1
fi

git clone https://github.com/opencast/opencast.git ~/opencast
cd ~/opencast

#Get the list of *all* branches in the format remotes/origin/r/N.m
#grep for r/N.x
#then use cut to remove remotes/origin
ary=( `git branch -a | grep 'r/[0-9]*.x' | head -n 3 | cut -f 3- -d '/'` )

#Iterate through the array above.
#If the script input matches the first item, spit out develop
#If the script iput matches hte second item... etc
#If it doesn't match anything, then don't say anything
for i in "${!ary[@]}"
do
  if [[ "${ary[$i]}" = "$1" ]]; then
    if [[ $i -eq 0 ]]; then
      echo "develop.opencast.org"
    elif [[ $i -eq 1 ]]; then
      echo "stable.opencast.org"
    elif [[ $i -eq 2 ]]; then
      echo "legacy.opencast.org"
    fi
  fi
done
