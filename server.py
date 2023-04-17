from flask import Flask, request
import re

app = Flask(__name__)

@app.route('/upload', methods=["POST"])
def upload():
    new_file = request.files['file']
    observed_counts= {'1':0, '2':0, '3':0, '4':0, '5':0, '6':0, '7':0, '8':0, '9':0 }
    total_count = 0

    #initialize line variable
    line = new_file.readline()
    if not line: 
        return {'message': 'file must not be empty','status': 422 } 
    if not '7_2009' in line: 
        return {'message': 'file needs to include 7_2009 column','status': 422 } 
    header_position = re.split(r'(?:[\s]{2,}|\t)', line).index('7_2009')

    while True:
        # get the next line
        line = new_file.readline()
        # line == empty, break out of while loop
        if not line:
            break
       
        # get leading digit
        lineArray = re.split(r'(?:[\s]{2,}|\t)', line)
        leading_digit = lineArray[header_position][0]

        #check if digit
        if (leading_digit.isdigit()):
            observed_counts[leading_digit] += 1
            total_count += 1
    
    expected_counts = {
        '1':.301*total_count,
        '2':.176*total_count,
        '3':.125*total_count,
        '4':.097*total_count,
        '5':.079*total_count,
        '6':.067*total_count,
        '7':.058*total_count,
        '8':.051*total_count, 
        '9':.046*total_count
    }
    chi_sqrd = 0
    for i in range(1,9):
        chi_sqrd += (pow((observed_counts[str(i)] - expected_counts[str(i)]), 2 ) / expected_counts[str(i)])

    degree_freedom = 8
    #critical value for 8 df and .05 significane level
    critical_value = 15.51
    passes_benford = chi_sqrd < critical_value
    # return object holding observed_counts and passesBenford
    return { 'observedCounts': observed_counts, 'expectedCounts': expected_counts, 'passesBenford': passes_benford }

if __name__ == '__main__':
    app.run(host="localhost", port=5000, debug=True)