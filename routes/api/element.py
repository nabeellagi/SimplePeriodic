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
            "atomic_weight": clean(el.atomic_weight),
            "group_id": clean(el.group_id),
            "period": clean(el.period),
            "block": clean(el.block),
            
            "density": clean(el.density), # Density at 295K in g/cm3
            
            "melting_point": clean(el.melting_point), # Melting point at 101.325 kPa pressure in K
            
            "boiling_point": clean(el.boiling_point), # in K
            
            "heat_of_formation": clean(el.heat_of_formation), # in kJ/mol
            
            "molar_heat_capacity": clean(el.molar_heat_capacity), # in J/(mol*K)
                        
            "atomic_radius": clean(el.atomic_radius), # in pm (picometers)
            "atomic_volume": clean(el.atomic_volume), # in cm3/mol
            "atomic_weight": clean(el.atomic_weight), # in u (atomic mass units) or Dalton
            "atomic_weight_uncertainty": clean(el.atomic_weight_uncertainty), # in u (atomic mass units) or Dalton
            
            "electron_affinity": clean(el.electron_affinity), # in eV
            "electrons" : clean(el.electrons),
            "protons": clean(el.protons),
            "neutrons": clean(el.neutrons),
            "econf" : clean(el.econf), # Electron configuration
            
            "discoverers": clean(el.discoverers),
            "discovery_year": clean(el.discovery_year),
            "discovery_location": clean(el.discovery_location),
            
            "geochemical_classification": clean(el.geochemical_class),
            
            "abundance_crust": clean(el.abundance_crust), #mg/kg
            "abundance_sea": clean(el.abundance_sea), #mg/l
            "atomic_weight_uncertainty": clean(el.atomic_weight_uncertainty),
        }
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500