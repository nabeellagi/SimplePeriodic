from flask import Blueprint, jsonify, request
from mendeleev import element

api_element = Blueprint('api_element', __name__)

def clean(value):
    return value if value is not None else "-"

@api_element.route("/element")
def get_element():
    """
    Get element data from periodic table
    ---
    parameters:
      - name: symbol
        in: query
        type: string
        required: true
        description: Element symbol like Fe or O
    responses:
      200:
        description: Element information
    """
    symbol = request.args.get('symbol')
    if not symbol:
        return jsonify({"error": "Element symbol is required"}), 400
    try:
        el = element(symbol)
        
        data = {
            "name": clean(el.name),
            "symbol": clean(el.symbol),
            "atomic_number": clean(el.atomic_number),
            "atomic_weight": f"{el.atomic_weight} u" if el.atomic_weight not in [None, "-", "undefined"] else clean(el.atomic_weight),
            "group_id": clean(el.group_id),
            "period": clean(el.period),
            "block": clean(el.block),
            
            "density": f"{el.density} g/cm³" if el.density not in [None, "-", "undefined"] else clean(el.density),
            
            "melting_point": f"{el.melting_point} K" if el.melting_point not in [None, "-", "undefined"] else clean(el.melting_point),
            
            "boiling_point": f"{el.boiling_point} K" if el.boiling_point not in [None, "-", "undefined"] else clean(el.boiling_point),
            
            "heat_of_formation": f"{el.heat_of_formation} kJ/mol" if el.heat_of_formation not in [None, "-", "undefined"] else clean(el.heat_of_formation),
            
            "molar_heat_capacity": f"{el.molar_heat_capacity} J/(mol*K)" if el.molar_heat_capacity not in [None, "-", "undefined"] else clean(el.molar_heat_capacity),
                            
            "atomic_radius": f"{el.atomic_radius} pm" if el.atomic_radius not in [None, "-", "undefined"] else clean(el.atomic_radius),
            "atomic_volume": f"{el.atomic_volume} cm³/mol" if el.atomic_volume not in [None, "-", "undefined"] else clean(el.atomic_volume),
            "atomic_weight_uncertainty": f"{el.atomic_weight_uncertainty} u" if el.atomic_weight_uncertainty not in [None, "-", "undefined"] else clean(el.atomic_weight_uncertainty),
            
            "electron_affinity": f"{el.electron_affinity} eV" if el.electron_affinity not in [None, "-", "undefined"] else clean(el.electron_affinity),
            "electrons": clean(el.electrons),
            "protons": clean(el.protons),
            "neutrons": clean(el.neutrons),
            "econf": clean(el.econf),
            
            "discoverers": clean(el.discoverers),
            "discovery_year": clean(el.discovery_year),
            "discovery_location": clean(el.discovery_location),
            
            "geochemical_classification": clean(el.geochemical_class),
            
            "abundance_crust": f"{el.abundance_crust} mg/kg" if el.abundance_crust not in [None, "-", "undefined"] else clean(el.abundance_crust),
            "abundance_sea": f"{el.abundance_sea} mg/l" if el.abundance_sea not in [None, "-", "undefined"] else clean(el.abundance_sea),
        }
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500