# smart-money

## USERS

### all txs of a user
node user.js -u=scribbs
node user.js -u=gr0wcrypt0
node user.js -u=artchick
node user.js -u=pepe

### all txs of a user for a given token
node user.js -u=scribbs -a=pepe
node user.js -u=xman -a=x
node user.js -u=ex -a=pepe
node user.js -u=ex -a=turbo


## TOKENS
node token.js -a=pepe  
node token.js -a=turbo  
node token.js -a=bitcoin  


## TG
node index.mjs


## S3 Deploy
zip -r deployment_package.zip .
