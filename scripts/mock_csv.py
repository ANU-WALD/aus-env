
import json
import sys
from random import random

# Usage:
# python mock_csv.py input.json namefield output.csv

INPUT=sys.argv[1]
FIELD=sys.argv[2]
#OUTPUT=sys.argv[3]

jsonData = json.load(open(INPUT))
features = jsonData['features']
names = [f['properties'][FIELD].replace(',','') for f in features]
years = range(2000,2016)

#print('\n'.join(sorted(names)))
# Check that names are unique...
#print(len(set(names)),len(names))
#assert(len(set(names))==len(names))

def randomValues():
  return [str(random()*10) for _ in years]

header = 'polygon,'+','.join([str(y) for y in years])
lines = [','.join([n]+randomValues()) for n in ['national']+list(set(names))]
print header
print '\n'.join(lines)
