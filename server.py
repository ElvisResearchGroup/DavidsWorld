from flask import Flask
from flask import render_template
from flask import send_from_directory
import jinja2
from os import listdir
from os.path import isfile, join

app = Flask(__name__) 

LIB_DIRECTORY = './lib/'

@app.route('/')
def index():
    libraries =  [ dir for dir in listdir(LIB_DIRECTORY) if not isfile(join(LIB_DIRECTORY, dir))]
    return render_template('./index.html', libraries=libraries)

@app.route('/lib/<lib>/<file>')
def library(lib, file):
    return  send_from_directory('lib', '{0}/{1}'.format(lib, file))

if __name__ == "__main__":
    app.run(debug=True)