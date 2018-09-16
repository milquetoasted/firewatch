
# attempting to train a neural net on kik's training data and then classify the challenge data

from sklearn.neural_network import MLPClassifier

print('Reading data...')

training_input = open('training_file.csv', 'r').read().split('\n')

training_set = []
training_output = []

challenge_input = open('challenge.csv', 'r').read().split('\n')

challenge_set = []
challenge_output = []

samples = len(training_input) - 1
features = len(training_input[1].split(',')) - 2

challenge_tests = len(challenge_input) - 1

for i in range(1, samples + 1):
  new_row = training_input[i].split(',')
  new_data = []

  for j in range(1, features + 1):
    new_data.append(int(new_row[j]))

  training_set.append(new_data)

  if new_row[features + 1] == 'True':
    training_output.append(1)
  else:
    training_output.append(0)

for i in range(1, challenge_tests + 1):
  new_row = challenge_input[i].split(',')
  new_data = []

  for j in range(1, features + 1):
    new_data.append(int(new_row[j]))

  challenge_set.append(new_data)


print('done.\nTraining...')

clf = MLPClassifier(solver='lbfgs', alpha=1e-5, hidden_layer_sizes=(5, 2), random_state=1)

clf.fit(training_set, training_output)

print('done.\nClassifying...')

challenge_result = clf.predict(challenge_set)

challenge_output = challenge_result.tolist()

challenge_output.append(1) # add this bc there was an extra row

print('done.\nWriting output...')

output = open('output.csv', 'w')

for result in challenge_output:
  output.write(str(result))
  output.write('\n')

print('done.')
