htmlStrings = []
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

        htmlStr = """
<div class="state-flex-item">
<input type="checkbox" class="state" id="{0}" name="{0}" value="{2}">
<label for="{0}">{1}</label>
</div>
""".format(stateNameLower, stateName, stateAbrev )

        htmlStrings.append(htmlStr)

fin.close()
htmlStringsCombined = ''
for state in htmlStrings:
    #print(state)
    htmlStringsCombined = htmlStringsCombined + state 

print(htmlStringsCombined)

fout = open('stateCheckBoxes.txt', 'wt')
fout.write(htmlStringsCombined)
fout.close()



