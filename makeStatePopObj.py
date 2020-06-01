htmlStrings = []
states = {}
fin = (open('stateList.txt', 'rt'))
for line in fin:
        #print(line)
        words= line.split()
        if len(words) == 3:
            stateName = words[0] 
            stateNameLower = stateName.lower()
            stateAbrev = words[2]
        else:
            stateName = words[0] + ' ' + words[1] 
            stateAbrev = words[3]
            stateNameLower = stateName.lower()
        states[stateName] = stateAbrev
fin.close()

stateObj = ''
stateObj = '{\n'

fin = (open('statePopulation.txt', 'rt'))
for line in fin:
        #print(line)
        words= line.split()

        if len(words) == 7:
            stateName = words[0] 
            statePop = words.pop()
        else:
            stateName = words[0] + ' ' + words[1] 
            statePop = words.pop()
        statePopList = statePop.split(',')
        statePop = ''.join(statePopList)
        stateObj = stateObj + states[stateName] + ':' + statePop + ',' + '\n'
fin.close()

stateObj = stateObj[:-2:]

stateObj = stateObj + '\n'
stateObj = stateObj + '}'
        
fout = open('statePopObj.txt', 'wt')
fout.write(stateObj)
fout.close()