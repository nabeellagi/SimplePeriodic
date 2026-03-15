from flask import Blueprint, request, jsonify
from chemlib import Reaction, Compound

api_reaction = Blueprint('api_reaction', __name__)

@api_reaction.route("/reaction")
def analyze_reaction():
    """
    Analyze and balance a chemical reaction

    This endpoint parses a chemical equation, balances the reaction,
    and returns detailed chemical information for each reactant and product.

    The analysis includes:
    - Balanced chemical equation
    - Molar mass of each compound
    - Element occurrences in each compound
    - Percentage composition by mass of each element

    Example equations:
    - Na + H2O -> NaOH + H2
    - H2 + O2 -> H2O

    The API automatically normalizes "=" into "->".

    ---
    tags:
      - Chemical Reactions

    parameters:
      - name: eq
        in: query
        type: string
        required: true
        description: |
          Chemical equation to analyze.

          Format examples:
          - Na + H2O -> NaOH + H2
          - H2 + O2 -> H2O
          - H2+O2=H2O (auto normalized)

        example: Na + H2O -> NaOH + H2

    responses:
      200:
        description: Reaction analyzed successfully
        schema:
          type: object
          properties:
            balanced_equation:
              type: string
              example: 2Na + 2H2O -> 2NaOH + H2

            reactants:
              type: array
              items:
                type: object
                properties:
                  formula:
                    type: string
                    example: H2O
                  molar_mass:
                    type: number
                    example: 18.015
                  element_occurrences:
                    type: object
                    additionalProperties:
                      type: integer
                    example:
                      H: 2
                      O: 1
                  percent_composition:
                    type: object
                    additionalProperties:
                      type: number
                    example:
                      H: 11.19
                      O: 88.81

            products:
              type: array
              items:
                type: object
                properties:
                  formula:
                    type: string
                    example: NaOH
                  molar_mass:
                    type: number
                    example: 39.997
                  element_occurrences:
                    type: object
                    additionalProperties:
                      type: integer
                    example:
                      Na: 1
                      O: 1
                      H: 1
                  percent_composition:
                    type: object
                    additionalProperties:
                      type: number
                    example:
                      Na: 57.5
                      O: 40.0
                      H: 2.5

      400:
        description: Invalid equation or missing parameter
        schema:
          type: object
          properties:
            error:
              type: string
              example: Invalid chemical equation
            details:
              type: string
              example: Unable to parse equation
    """
    equation = request.args.get('eq')

    if not equation:
        return jsonify({"error": "Equation required"}), 400

    try:
        # Normalize equation format
        equation = equation.replace("=", "->")

        # Parse reaction
        r = Reaction.by_formula(equation)

        # Balance reaction
        r.balance()
        balanced = str(r)

        def analyze_compound(item):
            if isinstance(item, Compound):
                c = item
                formula = c.formula
            else:
                c = Compound(item)
                formula = item

            occurrences = c.occurences

            percent_comp = {
                element: c.percentage_by_mass(element)
                for element in occurrences
            }

            return {
                "formula": formula,
                "molar_mass": c.molar_mass(),
                "element_occurrences": occurrences,
                "percent_composition": percent_comp
            }
        def unique_compounds(items):
            seen = set()
            result = []

            for item in items:
                analyzed = analyze_compound(item)
                formula = analyzed["formula"]

                if formula not in seen:
                    seen.add(formula)
                    result.append(analyzed)

            return result

        # reactants = [analyze_compound(x) for x in r.reactants]
        # products = [analyze_compound(x) for x in r.products]
        
        reactants = unique_compounds(r.reactants)
        products = unique_compounds(r.products)

        return jsonify({
            "balanced_equation": balanced,
            "reactants": reactants,
            "products": products
        })

    except Exception as e:
        return jsonify({
            "error": "Invalid chemical equation",
            "details": str(e)
        }), 400