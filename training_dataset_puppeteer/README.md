# Training dataset

## High level description

> This portion of the app is responsible for partialy aquiring the data needed to create the training dataset. Because a hybrid data collection aproach has been used in this research it is necessary to aquire some data directly from Facebook and some other data via scraping using the [Puppeteer](https://pptr.dev/) library. The code in this folder is **directly** related with the scraping portion of this data collection process. The only script that is used to combine data from the two sources is `tie.js`, which creates a concatenated `json` file with all the required information.

## Requirements

- You will need to download & install [NodeJS and npm](https://nodejs.org/en/download/) (Node package manager)

- Then inside this directory run the following command to install all dependencies:

```bash
npm install
```

- For security reasons a `.env` file has been used to store the Facebook credentials for this profile. Run the following:

```bash
cp .env.example ./.env
```

- Fill in the required fields:

```bash
USERNAME= #YOUR_FACEBOOK_EMAIL
PASSWORD= #YOUR_FACEBOOK_PASSWORD
EGO= #YOUR_FACEBOOK_NAME
```

> ⚠️ **WARNING:** If your Facebook name includes whitespace wrap it in quotes (e.g "My Name")

## Usage

To use the various scripts found in this folder simply run:

```bash
node <script_name>.js #e.g node index.js
```

The **relevant** scripts are (You should run these in this order):

- `index.js` Gets all Facebook friends and common friends from profile
- `wall.js` Scrapes the entirety of your Facebook wall to get interactions with various friends.

The **irrelevant** scripts are (⚠️You shouldn't run these):

- `messages.js` Deprecated because of the amount of time it takes and unreliability of retrieving older messages.
- `test.js` For debugging purposes.

When `{index,wall}.js` have finished you should proceed to obtain data from your Facebook page as found on this [README](../scripts/README.md) file.

Finaly, when you have completed the steps in [README](../scripts/README.md) you should move `messages.json` and `friend_dates.json` in the current directory and run:

```bash
node tie.js
```

to create the final dataset (`tie_data.json`) in `JSON` format.
