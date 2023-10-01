import matplotlib.pyplot as plt
import pandas as pd
pd.options.mode.chained_assignment = None
import math

base_path = '/Users/peterschindler/Documents/smart-money/infura/data/csv/'

# name = 'NicCageWaluigiElmo42069Inu'
# name = 'Pepe'
name = 'NiHao'
# name = 'AstroPepeX'
# name = 'CUCK'

df = pd.read_csv(base_path + name +'.csv')

df['newUserCountN'] = 0
df['logNewUserCountN'] = 0
n = 5
for i in range(0, len(df)):
    df['newUserCountN'][i] = df['newUserCount'][max([0, i-n]):i].values.sum()
    df['logNewUserCountN'][i] = math.log(df['newUserCountN'][i]) if df['newUserCountN'][i] > 0 else 0


# df = df[2000:4000]
# df = df[0:400]

# print(df.head())


plt.plot( df['min'],  df['newUserCount'])
plt.xlabel('Minute')
plt.ylabel('New Users')
plt.title(name)
plt.show()

plt.plot( df['min'],  df['newUserCountN'])
plt.xlabel('Minute')
plt.ylabel('New Users N')
plt.title(name)
plt.show()

plt.plot( df['min'],  df['logNewUserCountN'])
plt.xlabel('Minute')
plt.ylabel('New Users N Log')
plt.title(name)
plt.show()
