#!/bin/sh
truffle compile
truffle migrate
cp build/contracts/* frontend/src/build/contracts/