from flask import Blueprint, jsonify
from mendeleev import get_all_elements

periodic_api = Blueprint("periodic", __name__)

ALL_ELEMENTS = get_all_elements()

@periodic_api.route("/get-all", methods=["GET"])
def api_getAll():
    """
    Get all periodic elements
    ---
    tags:
      - Periodic Table
    summary: Returns all periodic table elements
    description: Retrieve atomic number, symbol, and full element name.
    responses:
      200:
        description: Successful response
        schema:
          type: array
          items:
            type: object
            properties:
              atomic_number:
                type: integer
                example: 1
              symbol:
                type: string
                example: H
              name:
                type: string
                example: Hydrogen
    """

    elements = [{
        "atomic_number": 0,
        "symbol": "",
        "name": ""
    }]

    for el in ALL_ELEMENTS:
        elements.append({
            "atomic_number": el.atomic_number,
            "symbol": el.symbol,
            "name": el.name
        })

    return jsonify(elements)