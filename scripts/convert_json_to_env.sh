#!/bin/bash

json_file="env.json"

env_file=".env"
> "$env_file"

while IFS="=" read -r key value; do
  printf '%s=%s\n' "$key" "$value" >> "$env_file"
done < <(jq -r "to_entries|map(\"\(.key)=\(.value|tostring)\")|.[]" "$json_file")
rm env.json