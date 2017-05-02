#!/bin/bash

if [[ ! -d docs ]]; then
    echo "missing docs folder"
    exit 1
fi

mv docs html
cd html; make html
cd ..
mv html docs
git add .
git commit
git push
