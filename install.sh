#!/bin/bash


CMD="node"
EXISTS=$(command -v $CMD)

if [ -z $EXISTS ]; then
    echo "Installing $CMD"
    brew install $CMD
fi
