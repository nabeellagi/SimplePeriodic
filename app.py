from flask import Flask, render_template, request
from routes.api.element import api_element
from routes.api.wiki import api_wiki
from routes.api.trend import api_trend
from routes.api.reaction import api_reaction
from routes.api.periodic import periodic_api
from flasgger import Swagger
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

app.register_blueprint(api_element, url_prefix='/api')
app.register_blueprint(api_wiki, url_prefix='/api')
app.register_blueprint(api_trend, url_prefix='/api')
app.register_blueprint(api_reaction, url_prefix='/api')
app.register_blueprint(periodic_api, url_prefix='/api')

swagger = Swagger(app)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)