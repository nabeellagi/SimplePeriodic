import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flasgger import Swagger

from routes.api.element import api_element
from routes.api.wiki import api_wiki
from routes.api.trend import api_trend
from routes.api.reaction import api_reaction
from routes.api.periodic import periodic_api

app = Flask(
    __name__,
    static_folder="dist",
    template_folder="dist"
)

DEBUG = os.getenv("FLASK_DEBUG", "True") == "True"

# CORS
if DEBUG:
    CORS(app)
else:
    CORS(app, origins=[])

# API routes
app.register_blueprint(api_element, url_prefix='/api')
app.register_blueprint(api_wiki, url_prefix='/api')
app.register_blueprint(api_trend, url_prefix='/api')
app.register_blueprint(api_reaction, url_prefix='/api')
app.register_blueprint(periodic_api, url_prefix='/api')

# Swagger (optional: disable in prod)
if DEBUG:
    Swagger(app)

# Serve SPA
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_vue(path):
    file_path = os.path.join(app.static_folder, path)

    if path != "" and os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)

    return send_from_directory(app.static_folder, "index.html")

# Serve separate HTML
@app.route("/table")
def serve_table():
    return send_from_directory(app.static_folder, "table.html")


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=DEBUG)