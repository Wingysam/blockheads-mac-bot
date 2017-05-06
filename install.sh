if [ ! -z $(which git) ]
then
	git clone https://github.com/Wingysam/blockheads-mac-bot
	cd blockeheads-mac-bot
	if [ ! -z $(which npm) ]
	then
		npm install
	else
		echo "You don't have NPM. Install Node.JS (nodejs.org)"
	fi
	echo "Run cd blockheads-mac-bot"
else
	echo "You don't have git. I'll use curl, and unzip."
	if [ ! -z $(which curl) ]
	then
		if [ ! -z $(which unzip) ]
		then
			curl 'https://github.com/Wingysam/blockheads-mac-bot.git' > blockheads-mac-bot.zip
		else
			echo "You don't have unzip."
		fi
	else
		echo "You don't have curl. That's odd, for a Mac..."
	fi
fi
