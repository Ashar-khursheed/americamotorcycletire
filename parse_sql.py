import re
import json
import pandas as pd

COLS = [
    'id', 'sku', 'name', 'slug', 'brand', 'vehicle_type', 'product_type', 
    'compatible_makes', 'compatible_models', 'fitment_year_range', 'item_number', 
    'short_description', 'description', 'specs_and_features', 'fitment_vehicle', 
    'fitment_disclaimer', 'meta_title', 'meta_description', 'meta_keywords', 
    'canonical_url', 'source_url', 'price', 'was_price', 'savings', 'rating', 
    'review_count', 'front_tire_fitment', 'rear_tire_fitment', 'wheel_locations', 
    'available_sizes_count', 'available_sizes', 'total_part_numbers', 'compare_at_price', 
    'cost_price', 'stock_quantity', 'category_id', 'primary_image', 'custom_attributes', 
    'gallery_images', 'is_active', 'is_featured', 'created_at', 'updated_at'
]

def split_tuples(block):
    # Splits `block` into list of raw tuple strings `(1, 2, ...)`
    tuples = []
    start = None
    in_quote = False
    quote_char = None
    escaped = False

    for i, c in enumerate(block):
        if in_quote:
            if escaped:
                escaped = False
            elif c == '\\':
                escaped = True
            elif c == quote_char:
                in_quote = False
        else:
            if c in ("'", '"'):
                in_quote = True
                quote_char = c
            elif c == '(':
                if start is None:
                    start = i
            elif c == ')':
                if start is not None:
                    tuples.append(block[start+1:i])
                    start = None
    return tuples

def parse_tuple_fields(raw_str):
    fields = []
    curr = []
    in_quote = False
    quote_char = None
    escaped = False

    for c in raw_str:
        if in_quote:
            if escaped:
                curr.append(c)
                escaped = False
            elif c == '\\':
                escaped = True
            elif c == quote_char:
                in_quote = False
            else:
                curr.append(c)
        else:
            if c in ("'", '"'):
                in_quote = True
                quote_char = c
            elif c == ',':
                val = ''.join(curr).strip()
                fields.append(None if val.upper() == 'NULL' else val)
                curr = []
            else:
                curr.append(c)

    val = ''.join(curr).strip()
    fields.append(None if val.upper() == 'NULL' else val)
    return fields

def map_vehicle_type(v_type, c_type, name, custom_attr, desc=''):
    text = f"{v_type or ''} {c_type or ''} {name or ''} {desc or ''}".lower()
    if custom_attr and isinstance(custom_attr, dict):
        text += " " + str(custom_attr.get('Type', '')).lower()
        text += " " + str(custom_attr.get('type', '')).lower()
        text += " " + str(custom_attr.get('category', '')).lower()

    if any(k in text for k in ['utv', 'atv', 'sxs', 'side by side', 'quad']):
        return 'UTV/ATV'
    if any(k in text for k in ['dirt', 'off-road', 'offroad', 'motocross', 'enduro', 'dual sport', 'adventure', 'trials', 'mx']):
        return 'Dirt Bike'
    if any(k in text for k in ['street', 'sport', 'sportbike', 'cruiser', 'v-twin', 'harley', 'touring', 'scooter', 'chopper', 'custom', 'audio', 'speaker', 'coaxial', 'amplifier']):
        return 'Street Bike'
    
    return 'Street Bike'

def main():
    with open('products.sql', 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    insert_blocks = re.findall(r'INSERT INTO `products` \([^)]+\) VALUES\s*(.*?);', content, re.DOTALL)
    print(f"Found {len(insert_blocks)} INSERT statements.")

    all_products = []
    
    for block in insert_blocks:
        tuples = split_tuples(block)
        for t in tuples:
            fields = parse_tuple_fields(t)
            if len(fields) == len(COLS):
                row = dict(zip(COLS, fields))
                all_products.append(row)
            else:
                print(f"Warning: tuple field count mismatch ({len(fields)} != {len(COLS)}). Skipping.")

    print(f"Parsed {len(all_products)} products successfully.")

    processed_rows = []
    for r in all_products:
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
        desc = r.get('description', '')
        
        # Standardize Vehicle Type
        std_v_type = map_vehicle_type(v_type, p_type, name, custom_attr, desc)
        
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

        # Determine Gallery / All Image URLs
        gallery_raw = r.get('gallery_images')
        gallery_list = []
        if gallery_raw:
            try:
                gallery_list = json.loads(gallery_raw)
            except Exception:
                pass
        
        primary_img = r.get('primary_image')
        if primary_img and primary_img not in gallery_list:
            gallery_list.insert(0, primary_img)

        all_image_urls_str = " ; ".join(gallery_list) if gallery_list else (primary_img or '')

        item_dict = {
            'id': r.get('id'),
            'sku': r.get('sku'),
            'name': name,
            'slug': r.get('slug'),
            'brand': brand,
            'vehicle_type': std_v_type,
            'product_type': p_type or 'Tires',
            'compatible_makes': makes,
            'compatible_models': models,
            'fitment_year_range': year_range,
            'item_number': r.get('item_number'),
            'short_description': r.get('short_description'),
            'description': desc,
            'specs_and_features': r.get('specs_and_features'),
            'fitment_vehicle': r.get('fitment_vehicle'),
            'fitment_disclaimer': r.get('fitment_disclaimer'),
            'meta_title': r.get('meta_title'),
            'meta_description': r.get('meta_description'),
            'meta_keywords': r.get('meta_keywords'),
            'canonical_url': r.get('canonical_url'),
            'source_url': r.get('source_url'),
            'price': r.get('price'),
            'was_price': r.get('was_price'),
            'savings': r.get('savings'),
            'rating': r.get('rating', 0.0),
            'review_count': r.get('review_count', 0),
            'front_tire_fitment': r.get('front_tire_fitment'),
            'rear_tire_fitment': r.get('rear_tire_fitment'),
            'wheel_locations': r.get('wheel_locations'),
            'available_sizes_count': r.get('available_sizes_count', 0),
            'available_sizes': r.get('available_sizes'),
            'total_part_numbers': r.get('total_part_numbers', 0),
            'compare_at_price': r.get('compare_at_price'),
            'cost_price': r.get('cost_price'),
            'stock_quantity': r.get('stock_quantity', 50),
            'category_id': r.get('category_id'),
            'primary_image': primary_img,
            'gallery_images': json.dumps(gallery_list) if gallery_list else r.get('gallery_images'),
            'all_image_urls': all_image_urls_str,
            'custom_attributes': r.get('custom_attributes'),
            'is_active': r.get('is_active', 1),
            'is_featured': r.get('is_featured', 0),
            'created_at': r.get('created_at'),
            'updated_at': r.get('updated_at'),
        }
        processed_rows.append(item_dict)

    df = pd.DataFrame(processed_rows)
    
    csv_file = 'products_sql_formatted_export.csv'
    df.to_csv(csv_file, index=False, encoding='utf-8')
    print(f"\nSuccessfully generated '{csv_file}' with {len(df)} rows!")

    print("\n--- Breakdown by Vehicle Type ---")
    print(df['vehicle_type'].value_counts())

    print("\n--- First 5 rows preview ---")
    print(df[['id', 'sku', 'name', 'brand', 'vehicle_type', 'compatible_makes', 'fitment_year_range']].head())

if __name__ == '__main__':
    main()
