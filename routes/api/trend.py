from flask import Blueprint, jsonify, request
from mendeleev import element

api_trend = Blueprint("api_trend", __name__)

ALLOWED_PROPERTIES = {
    "atomic_radius": "atomic_radius",
    "electronegativity": "en_pauling",
    "density": "density",
    "ionization_energy": "ionenergies",
    "boiling_point": "boiling_point",
}

# Loop through only needed elements
PERIODS = {
    1: (1, 2),
    2: (3, 10),
    3: (11, 18),
    4: (19, 36),
    5: (37, 54),
    6: (55, 86),
    7: (87, 118)
}
GROUPS = {
    1: (1, 3, 11, 19, 37, 55, 87),
    2: (4, 12, 20, 38, 56, 88),
    3: (5, 13, 21, 39, 57, 89),
    4: (6, 14, 22, 40, 58,  90),
    5: (7, 15, 23, 41, 59, 91),
    6: (8, 16, 24, 42, 60, 92),
    7: (9, 17, 25, 43, 61, 93),
    8: (10, 18, 26, 44, 62, 94),
    9: (27, 45, 63, 95),    
    10: (28, 46, 64, 96),
    11: (29, 47, 65, 97),
    12: (30, 48, 66, 98),
    13: (31, 49, 67, 99),
    14: (32, 50, 68, 100),
    15: (33, 51, 69, 101),
    16: (34, 52, 70, 102),
    17: (35, 53, 71, 103),
    18: (36, 54, 86, 118)
}

@api_trend.route("/trend")
def get_trend():
    """
    Get periodic trend data for visualization

    This endpoint returns periodic table property trends
    across a specific period or down a specific group.

    ---
    tags:
      - Periodic Trends

    parameters:
      - name: property
        in: query
        type: string
        required: true
        enum:
          - atomic_radius
          - electronegativity
          - ionization_energy
          - density
          - boiling_point
        description: Property of the element to visualize

      - name: type
        in: query
        type: string
        required: true
        enum:
          - period
          - group
        description: Whether the trend is across a period or down a group

      - name: value
        in: query
        type: integer
        required: true
        description: |
          Period number (1-7) or group number (1-18)
          depending on the chosen trend type.

    responses:
      200:
        description: Trend data retrieved successfully
        schema:
          type: object
          properties:
            property:
              type: string
              example: atomic_radius
            type:
              type: string
              example: period
            value:
              type: integer
              example: 3
            data:
              type: array
              items:
                type: object
                properties:
                  symbol:
                    type: string
                    example: Na
                  atomic_number:
                    type: integer
                    example: 11
                  value:
                    type: number
                    example: 190

      400:
        description: Invalid property or parameters

    """
    property_name = request.args.get("property")
    trend_type = request.args.get("type")
    value = request.args.get("value", type=int)

    if property_name not in ALLOWED_PROPERTIES:
        return jsonify({"error": "Invalid property"}), 400

    data = []

    # Optimize by only looping through relevant elements based on trend type
    if trend_type == "period":
        element_range = PERIODS.get(value)
    elif trend_type == "group":
        element_range = GROUPS.get(value)
    else:
        return jsonify({"error": "Invalid trend type"}), 400
    if not element_range:
        return jsonify({"error": "Invalid value for the chosen trend type"}), 400
    
    prop = ALLOWED_PROPERTIES[property_name]

    # Handle period
    if trend_type == "period":
        start, end = element_range

        for i in range(start, end + 1):
            el = element(i)

            val = getattr(el, prop)

            if property_name == "ionization_energy":
                val = el.ionenergies.get(1) if el.ionenergies else None

            data.append({
                "symbol": el.symbol,
                "atomic_number": el.atomic_number,
                "value": val
            })

    # Handle group
    elif trend_type == "group":

        for atomic_num in element_range:
            el = element(atomic_num)

            val = getattr(el, prop)

            if property_name == "ionization_energy":
                val = el.ionenergies.get(1) if el.ionenergies else None

            data.append({
                "symbol": el.symbol,
                "atomic_number": el.atomic_number,
                "value": val
            })

    return jsonify({
        "property": property_name,
        "type": trend_type,
        "value": value,
        "data": data
    })