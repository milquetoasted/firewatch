import json

data = open('evacuationCenters', 'r').read().split('\n')

counter = 0

elements = []

new_element = {}

for line in data:
  temp_data = line.split(':')
  if temp_data[0] == 'SHELTER_NAME':
    new_element['SHELTER_NAME'] = temp_data[1].strip(' ')
  elif temp_data[0] == 'X':
    new_element['LONGITUDE'] = float(temp_data[1].strip(' '))
  elif temp_data[0] == 'Y':
    new_element['LATITUDE'] = float(temp_data[1].strip(' '))
    elements.append(new_element)
    new_element = {}
  elif temp_data[0] == 'ADDRESS_1':
    new_element['ADDRESS'] = temp_data[1].strip(' ')
  elif temp_data[0] == 'CITY':
    new_element['CITY'] = temp_data[1].strip(' ')
  elif temp_data[0] == 'STATE':
    new_element['STATE'] = temp_data[1].strip(' ')

output = open('evacuationCenters.json', 'w')

json.dump(elements, output)
