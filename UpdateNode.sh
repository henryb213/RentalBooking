#!/bin/bash

# Fetch latest LTS Node.js version from Node.js index
version=$(curl -s https://nodejs.org/dist/index.json | jq -r '[.[] | select(.lts != false)] | first | .version')

echo "Latest Node.js LTS version: $version"

# Check if node is already installed and its path is set
if command -v node >/dev/null 2>&1; then
	current_version=$(node -v | grep -oP 'v\K.*')
	echo "Current Node.js version: v$current_version"
fi

# Determine the target directory name
target_dir="node-$version-linux-x64"
target_path="$HOME/Documents/$target_dir"

if [ ! -d "$target_path" ]; then
	# Download and extract Node.js
	cd $HOME/Documents || exit
	echo "Downloading Node.js $version..."
	wget https://nodejs.org/dist/$version/$target_dir.tar.xz
	if [ $? -ne 0 ]; then
		echo "Download failed. Please check your internet connection."
		exit 1
	fi

	# Extract the tarball
	echo "Extracting Node.js..."
	tar xJf $target_dir.tar.xz

	# Clean up the tarball
	rm $target_dir.tar.xz
else
	echo "Node.js version $version is already downloaded."
fi

# Check if the path is already in .bash_profile
if grep -q "$target_path/bin" ~/.bash_profile; then
	echo "Path to Node.js is already set."
else
	# Remove any existing Node.js path entries in .bash_profile
	sed -i '/export PATH=.*node-v[0-9]\+\.[0-9]\+\.[0-9]\+-linux-x64\/bin:\$PATH/d' ~/.bash_profile
	# Add the path to PATH variable in .bash_profile
	echo "export PATH=$target_path/bin:\$PATH" >>~/.bash_profile
fi

# Source the profile to apply changes
source ~/.bash_profile

# Update npm to latest version
npm install -g npm

echo ""
echo "Node.js $version (LTS) has been installed and added to your PATH."
echo "You may need to restart your terminal or run 'source ~/.bash_profile' for the changes to take effect."
