#!/bin/bash
echo "Validating service..."
curl -f http://localhost:3000 || exit 1 
