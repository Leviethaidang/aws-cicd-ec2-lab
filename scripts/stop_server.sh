#!/bin/bash
if command -v pm2 &> /dev/null; then pm2 delete all || true; fi