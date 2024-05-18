# Double Word Generator (with voting)

My "Double Word Generator" has existed in some form since 2014 (first as a
Windows Forms application, while learning how to make them in high school!), and
I've recently decided to add a global voting mechanism.

This version of DWG uses your Discord account to login. Once you've logged in
you can vote "Good" or "Bad" for each combo of words that pops up.

Eventually, I'll produce some stats for combos voted on, in its infancy it'll
just collect votes.

**You can try it here: <https://wordgen.tombo.sh/>**

The original version is here: <https://www.tombo.sh/releases/wordgen/>

## Installation

If you really want to set this up for yourself:

1. Clone the repo
2. Run `npm install`
3. Copy `.env.template` to `.env` and change any relevant values
4. Start the application, using `npm start`/`npm run start:production`  
   (or another NodeJS management suite of your choice, such as `forever` or
   `nodemon`)
