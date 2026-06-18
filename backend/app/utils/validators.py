def validate_input(data,required_fields):
    
    if not data:
        return f"Request body is required "
    
    missing = [field for field in required_fields if not data.get(field)]
    
    if missing:
        return f"Missing field(s):  {",".join(missing) }"
    
    return None


def validate_enum_input(data,field_name, valid_input):
    
    value = data.get(field_name)
                     
    if not value or value not in valid_input:
        return f"{field_name} should only be in one of the fields: {valid_input}"
    
    return None