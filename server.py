from flask import Flask
from flask import render_template
from flask import send_from_directory
import jinja2
import json
from os import listdir
from os.path import isfile, join

app = Flask(__name__) 

LIB_DIRECTORY = './lib/'

@app.route('/')
def index():
    libraries =  [ dir for dir in listdir(LIB_DIRECTORY) if not isfile(join(LIB_DIRECTORY, dir))]
    libraries = map(getName, libraries)	
    return render_template('./index.html', libraries=libraries)

@app.route('/lib/<lib>/<file>')
def library(lib, file):
    return  send_from_directory('lib', '{0}/{1}'.format(lib, file))

@app.route('/cheatsheet')
def cheatsheet():
    return  send_from_directory('documents', 'LogicFactoryCheatSheet.pdf')

def getName(file):
    path = '{0}{1}/{1}_lib.json'.format(LIB_DIRECTORY, file)
    print path
    with open(path) as data_file:
        data = json.load(data_file)
    return file, data['library_name']

if __name__ == "__main__":
    app.run(debug=True)
