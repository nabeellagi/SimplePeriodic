from flask import Blueprint, jsonify, request
import wikipediaapi

api_wiki = Blueprint('api_wiki', __name__)
wiki = wikipediaapi.Wikipedia(
    user_agent="SimplePeriodicApp/1.0",
    language='en',
    extract_format=wikipediaapi.ExtractFormat.WIKI
)

def smart_trim(text, limit=2000):
    if len(text) <= limit:
        return text

    # find the next sentence ending after the limit
    end = text.find(".", limit)

    if end == -1:
        return text[:limit]

    return text[:end + 1]

@api_wiki.route("/wiki")
def get_wiki():
    """
    Get Wikipedia summary for a given chemical element
    ---
    parameters:
      - name: element
        in: query
        type: string
        required: true
        description: Wikipedia topic to search for (e.g. "Iron")
        
    responses:
      200:
        description: Wikipedia summary for the topic
    """
    query = request.args.get("element")

    if not query:
        return jsonify({"error": "Query parameter element is required"}), 400

    page = wiki.page(query)

    if not page.exists():
        return jsonify({"error": "Page not found"}), 404

    data = {
        "title": page.title,
        "summary": smart_trim(page.summary),
        "url": page.fullurl
    }

    return jsonify(data)