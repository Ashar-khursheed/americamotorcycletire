import re
import json
import pandas as pd
import ast

def map_vehicle_type(v_type, c_type, name, custom_attr):
    text = f"{v_type or ''} {c_type or ''} {name or ''}".lower()
    if custom_attr and isinstance(custom_attr, dict):
        text += " " + str(custom_attr.get('Type', '')).lower()
        text += " " + str(custom_attr.get('category', '')).lower()

    if any(k in text for k in ['utv', 'atv', 'sxs', 'side by side', 'quad']):
        return 'UTV/ATV'
    if any(k in text for k in ['dirt', 'off-road', 'offroad', 'motocross', 'enduro', 'dual sport', 'adventure', 'trials', 'mx']):
        return 'Dirt Bike'
    if any(k in text for k in ['street', 'sport', 'sportbike', 'cruiser', 'v-twin', 'harley', 'touring', 'scooter', 'chopper', 'custom', 'audio', 'speaker']):
        return 'Street Bike'
    
    return 'Street Bike'

def clean_sql_value(val):
    val = val.strip()
    if val.upper() == 'NULL':
        return None
    if val.startswith("'") and val.endswith("'"):
        val = val[1:-1]
        val = val.replace("\\'", "'").replace('\\"', '"').replace('\\\\', '\\').replace('\\n', '\n').replace('\\r', '\r')
    return val

def parse_sql_file():
    with open('products.sql', 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Find columns
    create_match = re.search(r'CREATE TABLE `products` \((.*?)\) ENGINE', content, re.DOTALL)
    cols = re.findall(r'`(\w+)`', create_match.group(1))
    print(f"Parsed {len(cols)} columns from schema.")

    rows_data = []
    
    # Extract tuples inside INSERT INTO `products` VALUES (...)
    insert_blocks = re.findall(r'INSERT INTO `products` \([^)]+\) VALUES\s*(.*?);', content, re.DOTALL)
    print(f"Found {len(insert_blocks)} INSERT statements.")

    for block in insert_blocks:
        # Match individual row tuples: (val1, val2, ...)
        # Simple regex split by tuple boundaries: "),(" or start "(" to end ")"
        # Using a scanner for balanced parentheses
        pos = 0
        n = len(block)
        while pos < n:
            while pos < n and block[pos] != '(':
                pos += 1
            if pos >= n:
                break
            
            start_pos = pos + 1
            pos = start_pos
            in_string = False
            escape = False
            quote_char = None
            
            while pos < n:
                c = block[pos]
                if in_string:
                    if escape:
                        escape = False
                    elif c == '\\':
                        escape = True
                    elif c == quote_char:
                        in_string = False
                else:
                    if c in ("'", '"'):
                        in_string = True
                        quote_char = c
                    elif c == ')':
                        break
                pos += 1
            
            row_str = block[start_pos:pos]
            pos += 1 # skip closing paren

            # Parse comma-separated fields in row_str
            fields = []
            f_start = 0
            f_in_str = False
            f_escape = False
            f_quote = None
            
            for i, c in enumerate(row_str):
                if f_in_str:
                    if f_escape:
                        f_escape = False
                    elif c == '\\':
                        f_escape = True
                    elif c == f_quote:
                        f_in_str = False
                else:
                    if c in ("'", '"'):
                        f_in_str = True
                        f_quote = c
                    elif c == ',':
                        fields.append(clean_sql_value(row_str[f_start:i]))
                        f_start = i + 1
            fields.append(clean_sql_value(row_str[f_start:]))

            if len(fields) == len(cols):
                row_dict = dict(zip(cols, fields))
                rows_data.append(row_dict)

    print(f"Successfully extracted {len(rows_data)} products from products.sql.")
    return rows_data

def process_and_export():
    rows = parse_sql_file()
    
    formatted_list = []
    
    for r in rows:
        custom_attr = None
        if r.get('custom_attributes'):
            try:
                custom_attr = json.loads(r['custom_attributes'])
            except Exception:
                pass

        v_type = r.get('vehicle_type')
        p_type = r.get('product_type')
        name = r.get('name', '')
        brand = r.get('brand', '')
        
        # Standardize Vehicle Type
        std_v_type = map_vehicle_type(v_type, p_type, name, custom_attr)
        
        # Determine Makes
        makes = r.get('compatible_makes')
        if not makes and custom_attr and custom_attr.get('Make'):
            makes = custom_attr.get('Make')
        if not makes and brand:
            makes = brand
        if not makes:
            makes = 'Universal'

        # Determine Models
        models = r.get('compatible_models')
        if not models and custom_attr and custom_attr.get('Model'):
            models = custom_attr.get('Model')
        if not models and name:
            models = name
            
        # Determine Year Range
        year_range = r.get('fitment_year_range')
        if not year_range:
            year_range = '1995 - 2025'

        item_dict = {
            'ID': r.get('id'),
            'SKU': r.get('sku'),
            'Product Name': name,
            'Brand': brand,
            'Vehicle Type': std_v_type,
            'Product Type': p_type or 'Tires',
            'Compatible Bike Makes': makes,
            'Compatible Bike Models': models,
            'Fitment Year / Range': year_range,
            'Retail Price': r.get('price'),
            'Was Price': r.get('was_price'),
            'Rating': r.get('rating'),
            'Review Count': r.get('review_count'),
            'Short Description': r.get('short_description'),
            'Description': r.get('description'),
            'Primary Image URL': r.get('primary_image'),
            'Gallery Images': r.get('gallery_images'),
            'Custom Attributes': r.get('custom_attributes'),
            'Category ID': r.get('category_id'),
            'Is Active': r.get('is_active', 1),
            'Is Featured': r.get('is_featured', 0),
        }
        formatted_list.append(item_dict)

    df = pd.DataFrame(formatted_list)
    output_csv = 'products_sql_formatted_export.csv'
    df.to_csv(output_csv, index=False, encoding='utf-8')
    print(f"Exported {len(df)} rows to '{output_csv}'.")

    print("\nVehicle Type distribution:")
    print(df['Vehicle Type'].value_counts())

if __name__ == '__main__':
    process_and_export()
