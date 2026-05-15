import json
import os
import sys

def harden_schema(path):
    if not os.path.exists(path):
        print(f"Spec not found at {path}")
        sys.exit(1)
        
    with open(path, "r") as f:
        spec = json.load(f)
        
    schemas = spec.get("components", {}).get("schemas", {})
    
    # 1. PrescriptionResponseDto: Add expiryDate
    if "PrescriptionResponseDto" in schemas:
        props = schemas["PrescriptionResponseDto"].get("properties", {})
        if "expiryDate" not in props:
            props["expiryDate"] = {
                "type": "string",
                "format": "date",
                "nullable": True,
                "description": "Optional date past which the prescription is considered invalid."
            }
            
    # 2. PrescriptionItemResponseDto: Add unit (required)
    if "PrescriptionItemResponseDto" in schemas:
        props = schemas["PrescriptionItemResponseDto"].get("properties", {})
        if "unit" not in props:
            props["unit"] = {
                "type": "string",
                "maxLength": 32,
                "description": "Unit of measure."
            }
        req = schemas["PrescriptionItemResponseDto"].get("required", [])
        if "unit" not in req:
            req.append("unit")
            schemas["PrescriptionItemResponseDto"]["required"] = req
            
    # 3. PrescriptionUserSummaryDto: Add name (required) and phone
    if "PrescriptionUserSummaryDto" in schemas:
        props = schemas["PrescriptionUserSummaryDto"].get("properties", {})
        if "name" not in props:
            props["name"] = {
                "type": "string",
                "description": "Full display name."
            }
        if "phone" not in props:
            props["phone"] = {
                "type": "string",
                "nullable": True,
                "description": "Optional contact phone."
            }
        req = schemas["PrescriptionUserSummaryDto"].get("required", [])
        if "name" not in req:
            req.append("name")
            schemas["PrescriptionUserSummaryDto"]["required"] = req
            
    with open(path, "w") as f:
        json.dump(spec, f, indent=2)
    print(f"Successfully hardened schema at {path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 harden-schema.py <path-to-openapi.json>")
        sys.exit(1)
    harden_schema(sys.argv[1])
