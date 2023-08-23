# SMART MONEY

### all txs of a user
node user.js -u=scribbs

### all txs of a user for a given token
node user.js -u=scribbs -a=pepe

### initial txs of a token
node initToken.js -a=pepe  

### Telegram cron
node index.mjs

### S3 Deploy
zip -r deployment_package.zip .

### pnl of wallets for given token
node pnlWallets/pnlWalletsPerToken.js -a=pepe

### wallets that have pnl for multiple tokens
node pnlWallets/multipleTimesPnlWallets.js

### for given daterange, find wallets that were active with a token
node earlyWallets/earlyWalletsPerToken.js -a=pepe

### find wallets that were early tp multiple tokens
node earlyWallets/multipleTimesEarlyWallets.js
