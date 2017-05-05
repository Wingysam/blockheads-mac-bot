if [ ! -z $(which git) ]
then
	git clone https://github.com/Wingysam/blockheads-mac-bot
	cd blockeheads-mac-bot
	npm install
	echo "Run cd blockheads-mac-bot"
else
	echo "You don't have git."
fi
