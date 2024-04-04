#!/bin/bash

declare -A country_language_map
declare -a order

# Loop through each file in the directory
for file in *.json; do
    if [ -f "$file" ]; then
        # Extract country name and language code from the filename
        country=$(basename "$file" .json | cut -d '-' -f 1)
        language_code=$(basename "$file" .json)
        
        if [ ! "${country_language_map[$country]}" ]; then
            order+=("$country")
        fi

        # Check if the country already exists in the map
        if [ -n "${country_language_map[$country]}" ]; then
            country_language_map["$country"]+=" $language_code"
        else
            country_language_map["$country"]="$language_code"
        fi
    fi
done

echo "export const languages = new Map<string, string>(["
# Print the country-language mappings
for i in "${!order[@]}"; do
    country=${order[$i]}
    languages=()
    for language in ${country_language_map[$country]}; do
        languages+=("$language")
    done
    if [ ${#languages[@]} -eq 1 ]; then
        echo "  [\"$country\", \"${languages[0]}\"],"
    else
        for language in "${languages[@]}"; do
            echo "  [\"$language\", \"$language\"],"
        done
    fi
done
echo "]);"
