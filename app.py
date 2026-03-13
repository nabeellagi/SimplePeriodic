from flask import Flask, render_template, request
from routes.api.element import api_element
from routes.api.wiki import api_wiki
from flasgger import Swagger

app = Flask(__name__)

app.register_blueprint(api_element, url_prefix='/api')
app.register_blueprint(api_wiki, url_prefix='/api')

swagger = Swagger(app)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)