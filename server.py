from flask import Flask
from flask import render_template
from flask import send_from_directory
import jinja2
app = Flask(__name__) 

@app.route("/")
def index():
    return render_template('./index.html', test=123)

@app.route("/lib/<lib>/<file>")
def library(lib, file):
    return  send_from_directory('lib', '{0}/{1}'.format(lib, file))

if __name__ == "__main__":
    app.run(debug=True)