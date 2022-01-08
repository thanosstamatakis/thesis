# Acquiring Facebook user data

## Download data

To acquire Facebook user data one must do the following:

> - **Go to** Settings & privacy > Settings > Your Facebook information > Download your information
> - Select **_Messages_** and **_Friends and followers_**
> - Select format: `JSON` and low media quality for faster results
> - Download the files

You should end up with various folders and files. The relevant ones are:

```bash
messages/*
friends.json
```

## Installation

To install the dependencies needed run:

```bash
npm i #Installs project dependencies
cp .env.example ./.env #Creates a local .env file
nano .env
```

and insert your users Facebook name in the `.env` file.

## Execution

Copy the files mentioned above inside this directory and run:

```bash
node fb_friends.json
node fb_messages.json
```

This will produce a `messages.json` and `friend_dates.json` that you should copy in your training or testing directory respectively (depending on which profile you acquired data from). Then you should run the script to create your final `tie_data.json` dataset in there.
