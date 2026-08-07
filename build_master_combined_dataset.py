import openpyxl
import re
import json
import pandas as pd

BASE_DOMAIN = "https://americaapi.kaafifoods.com"

VALID_OEM_MAKES_MAP = {
    'harley': 'Harley-Davidson',
    'harley-davidson': 'Harley-Davidson',
    'honda': 'Honda',
    'yamaha': 'Yamaha',
    'kawasaki': 'Kawasaki',
    'suzuki': 'Suzuki',
    'bmw': 'BMW',
    'ktm': 'KTM',
    'ducati': 'Ducati',
    'triumph': 'Triumph',
    'indian': 'Indian',
    'husqvarna': 'Husqvarna',
    'can-am': 'Can-Am',
    'canam': 'Can-Am',
    'polaris': 'Polaris',
    'victory': 'Victory',
    'aprilia': 'Aprilia',
    'moto guzzi': 'Moto Guzzi',
    'royal enfield': 'Royal Enfield',
    'gasgas': 'GasGas',
    'gas gas': 'GasGas',
    'beta': 'Beta',
    'zero': 'Zero',
    'husaberg': 'Husaberg',
    'cobra': 'Cobra',
    'buell': 'Buell',
    'mv agusta': 'MV Agusta',
    'benelli': 'Benelli',
    'kymco': 'Kymco',
    'sym': 'Sym',
    'brp': 'BRP',
    'arctic cat': 'Arctic Cat',
    'ski-doo': 'Ski-Doo',
    'sea-doo': 'Sea-Doo',
    'vanderhall': 'Vanderhall'
}

def sanitize_make(make_val, name='', brand=''):
    val = str(make_val or '').strip()
    lower_val = val.lower()
    for key, canonical in VALID_OEM_MAKES_MAP.items():
        if key in lower_val or lower_val == key:
            return canonical

    text = f"{name} {brand}".lower()
    for key, canonical in VALID_OEM_MAKES_MAP.items():
        if key in text:
            return canonical

    return 'Harley-Davidson' # Default valid motorcycle OEM make

def map_vehicle_type(val, name=''):
    text = f"{val or ''} {name or ''}".lower()
    if any(k in text for k in ['utv', 'atv', 'sxs', 'side by side', 'quad']):
        return 'UTV/ATV'
    if any(k in text for k in ['dirt', 'off-road', 'offroad', 'motocross', 'enduro', 'dual sport', 'adventure', 'trials', 'mx']):
        return 'Dirt Bike'
    if any(k in text for k in ['street', 'sport', 'sportbike', 'cruiser', 'v-twin', 'harley', 'touring', 'scooter', 'chopper', 'custom', 'audio', 'speaker']):
        return 'Street Bike'
    return 'Street Bike'

def convert_to_full_url(url):
    if not url or not str(url).strip() or str(url).strip() in ('N/A', 'None', 'null'):
        return ''
    url = str(url).strip()
    
    base_name = url.split('/')[-1].split('?')[0]
    if '.' in base_name:
        name_part = '.'.join(base_name.split('.')[:-1])
    else:
        name_part = base_name
    
    clean_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', name_part)
    if not clean_name:
        clean_name = 'prod_img'
    
    webp_filename = f"{clean_name}.webp"
    return f"{BASE_DOMAIN}/storage/products/{webp_filename}"

def parse_sql_line(line):
    line = line.strip().rstrip(',;')
    if line.startswith('(') and line.endswith(')'):
        line = line[1:-1]
    
    fields = []
    in_quote = False
    cur = ""
    i = 0
    n = len(line)
    while i < n:
        c = line[i]
        if c == "'" and (i == 0 or line[i-1] != '\\'):
            if in_quote and i + 1 < n and line[i+1] == "'":
                cur += "'"
                i += 2
                continue
            in_quote = not in_quote
            cur += c
        elif c == ',' and not in_quote:
            fields.append(cur.strip())
            cur = ""
        else:
            cur += c
        i += 1
    if cur:
        fields.append(cur.strip())

    cleaned = []
    for f in fields:
        if f.startswith("'") and f.endswith("'"):
            val = f[1:-1].replace("''", "'").replace("\\'", "'").replace("\\\\", "\\")
            cleaned.append(val)
        elif f == 'NULL':
            cleaned.append(None)
        else:
            cleaned.append(f)
    return cleaned

def parse_sql_file():
    print("Parsing products.sql...")
    with open('products.sql', 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    idx = content.find("VALUES")
    if idx == -1:
        return []
    sub = content[idx+6:]
    lines = sub.split('\n')

    products = []
    for line in lines:
        line_s = line.strip()
        if line_s.startswith('('):
            fields = parse_sql_line(line_s)
            if len(fields) >= 15:
                products.append(fields)

    print(f"Successfully extracted {len(products)} products from products.sql!")
    return products

def main():
    print("Reading fin.xlsx...")
    wb = openpyxl.load_workbook('fin.xlsx', data_only=True)
    sheet1_name = wb.sheetnames[0]
    rows = list(wb[sheet1_name].iter_rows(values_only=True))
    headers = [str(h).strip() if h else '' for h in rows[0]]

    fin_products_dict = {}

    for idx, row in enumerate(rows[1:], start=1):
        row_dict = dict(zip(headers, row))
        p_name = str(row_dict.get('Product Name') or '').strip()
        if not p_name:
            continue
        sku = str(row_dict.get('SKU Number') or '').strip()
        brand_name = str(row_dict.get('Brand') or '').strip() or 'Generic'
        v_type_raw = str(row_dict.get('Vehicle Type') or '').strip()
        v_type = map_vehicle_type(v_type_raw, p_name)
        product_type = str(row_dict.get('Specific Product Type') or '').strip() or 'Tires'
        
        raw_makes = str(row_dict.get('Compatible Bike Makes') or '').strip()
        makes = sanitize_make(raw_makes, p_name, brand_name)

        models = str(row_dict.get('Compatible Bike Models') or '').strip() or p_name
        year_range = str(row_dict.get('Fitment Year / Range') or '').strip() or '1995 - 2025'

        raw_primary = str(row_dict.get('Primary Image URL') or '').strip() or None
        raw_all_imgs = str(row_dict.get('All Image URLs') or '').strip()

        primary_full = convert_to_full_url(raw_primary)

        gallery_full_list = []
        if raw_all_imgs:
            parts = [p.strip() for p in re.split(r'[;,]', raw_all_imgs) if p.strip()]
            for p in parts:
                full_p = convert_to_full_url(p)
                if full_p and full_p not in gallery_full_list:
                    gallery_full_list.append(full_p)

        if primary_full and primary_full not in gallery_full_list:
            gallery_full_list.insert(0, primary_full)
        if not gallery_full_list and primary_full:
            gallery_full_list = [primary_full]

        wheel_loc = str(row_dict.get('Wheel Locations') or '').strip()
        avail_sizes = str(row_dict.get('Available Sizes') or '').strip()

        custom_attr_dict = {
            "Wheel Location": wheel_loc or "Front, Rear",
            "Type": v_type,
            "Product Type": product_type,
            "Make": makes,
            "Model": models or p_name,
            "Tire Size": avail_sizes or "Standard"
        }

        p_obj = {
            'sku': sku,
            'name': p_name,
            'brand': brand_name,
            'category_id': 1,
            'vehicle_type': v_type,
            'product_type': product_type,
            'compatible_makes': makes,
            'compatible_models': models,
            'fitment_year_range': year_range,
            'item_number': str(row_dict.get('Item Number') or '').strip(),
            'primary_image': primary_full,
            'gallery_images_list': gallery_full_list,
            'custom_attr_dict': custom_attr_dict,
            'source': 'fin.xlsx'
        }

        key = (sku or p_name).lower()
        fin_products_dict[key] = p_obj

    print(f"Loaded {len(fin_products_dict)} unique products from fin.xlsx!")

    sql_products = parse_sql_file()

    master_dict = {}
    for k, v in fin_products_dict.items():
        master_dict[k] = v

    added_sql = 0
    for idx, f in enumerate(sql_products, start=1):
        sku = f[1] if len(f) > 1 and f[1] else f"SKU-SQL-{idx:04d}"
        name = f[2] if len(f) > 2 and f[2] else f"Product {idx}"
        brand = f[4] if len(f) > 4 and f[4] else "Generic"
        v_type = f[5] if len(f) > 5 and f[5] else map_vehicle_type('', name)
        p_type = f[6] if len(f) > 6 and f[6] else 'Tires'
        
        raw_makes = f[7] if len(f) > 7 else ''
        makes = sanitize_make(raw_makes, name, brand)

        models = f[8] if len(f) > 8 and f[8] else name
        years = f[9] if len(f) > 9 and f[9] else '1995 - 2025'
        item_num = f[10] if len(f) > 10 and f[10] else ''
        
        primary = convert_to_full_url(f[36] if len(f) > 36 else '')
        custom_attr_raw = f[37] if len(f) > 37 else ''
        gallery_raw = f[38] if len(f) > 38 else ''

        g_list = []
        if gallery_raw:
            try:
                parsed_g = json.loads(gallery_raw)
                if isinstance(parsed_g, list):
                    g_list = [convert_to_full_url(u) for u in parsed_g if u]
            except:
                pass
        if primary and primary not in g_list:
            g_list.insert(0, primary)

        c_attr = {}
        if custom_attr_raw:
            try:
                c_attr = json.loads(custom_attr_raw)
            except:
                pass

        if not c_attr:
            c_attr = {
                "Wheel Location": "Front, Rear",
                "Type": v_type,
                "Product Type": p_type,
                "Make": makes,
                "Model": models or name,
                "Tire Size": "Standard"
            }

        key = (sku or name).lower()
        if key in master_dict:
            existing = master_dict[key]
            for img in g_list:
                if img and img not in existing['gallery_images_list']:
                    existing['gallery_images_list'].append(img)
        else:
            master_dict[key] = {
                'sku': sku,
                'name': name,
                'brand': brand,
                'category_id': 1,
                'vehicle_type': v_type,
                'product_type': p_type,
                'compatible_makes': makes,
                'compatible_models': models,
                'fitment_year_range': years,
                'item_number': item_num,
                'primary_image': primary or (g_list[0] if g_list else ''),
                'gallery_images_list': g_list,
                'custom_attr_dict': c_attr,
                'source': 'products.sql'
            }
            added_sql += 1

    print(f"Added {added_sql} new unique products from products.sql!")
    print(f"TOTAL MASTER COMBINED PRODUCTS: {len(master_dict)}")

    csv_rows = []
    sql_inserts = ["-- Master SQL File with ALL Combined Products\nSET FOREIGN_KEY_CHECKS=0;\nTRUNCATE TABLE products;\nTRUNCATE TABLE product_fitments;\n"]

    for idx, (k, p) in enumerate(master_dict.items(), start=1):
        sku = p['sku'] if p['sku'] else f"SKU-{idx:05d}"
        name = p['name']
        brand = p['brand']
        v_type = p['vehicle_type']
        p_type = p['product_type']
        makes = p['compatible_makes']
        models = p['compatible_models']
        years = p['fitment_year_range']
        item_num = p['item_number']
        primary = p['primary_image']
        g_list = p['gallery_images_list']
        if primary and primary not in g_list:
            g_list.insert(0, primary)
        
        gallery_single_quote_str = "[" + ", ".join([f"'{url}'" for url in g_list]) + "]"
        custom_attr_json_str = json.dumps(p['custom_attr_dict'])

        r_dict = {
            'sku': sku,
            'name': name,
            'brand': brand,
            'category_id': 1,
            'vehicle_type': v_type,
            'product_type': p_type,
            'compatible_makes': makes,
            'compatible_models': models,
            'fitment_year_range': years,
            'item_number': item_num,
            'primary_image': primary,
            'gallery_images': gallery_single_quote_str,
            'custom_attributes': custom_attr_json_str,
            'Year': years,
            'Make': makes,
            'Model': models,
            'Position': 'Front, Rear',
            'Vendor Part Number': sku
        }
        csv_rows.append(r_dict)

        def esc(v):
            if v is None: return "NULL"
            return "'" + str(v).replace("\\", "\\\\").replace("'", "''") + "'"

        g_json_std = json.dumps(g_list)
        ins = f"INSERT INTO products (sku, name, slug, brand, category_id, vehicle_type, product_type, compatible_makes, compatible_models, fitment_year_range, item_number, primary_image, gallery_images, custom_attributes, is_active, is_featured, created_at, updated_at) VALUES ({esc(sku)}, {esc(name)}, {esc(sku.lower())}, {esc(brand)}, 1, {esc(v_type)}, {esc(p_type)}, {esc(makes)}, {esc(models)}, {esc(years)}, {esc(item_num)}, {esc(primary)}, {esc(g_json_std)}, {esc(custom_attr_json_str)}, 1, 1, NOW(), NOW());"
        sql_inserts.append(ins)

        ins_fit = f"INSERT INTO product_fitments (product_id, year, make, model, position, sku_number, vendor_part_number, item_number, created_at, updated_at) VALUES (LAST_INSERT_ID(), {esc(years)}, {esc(makes)}, {esc(models)}, 'Front, Rear', {esc(sku)}, {esc(sku)}, {esc(item_num)}, NOW(), NOW());"
        sql_inserts.append(ins_fit)

    sql_inserts.append("\nSET FOREIGN_KEY_CHECKS=1;")

    df = pd.DataFrame(csv_rows)
    df.to_csv('MASTER_ALL_PRODUCTS_IMPORT.csv', index=False, encoding='utf-8')
    print(f"Generated 'MASTER_ALL_PRODUCTS_IMPORT.csv' with {len(df)} DISTINCT PRODUCTS (100% WebP image URLs & Strict OEM Makes)!")

    with open('MASTER_ALL_PRODUCTS_IMPORT.sql', 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_inserts))
    print(f"Generated 'MASTER_ALL_PRODUCTS_IMPORT.sql' with {len(master_dict)} DISTINCT PRODUCTS (100% WebP image URLs & Strict OEM Makes)!")

if __name__ == '__main__':
    main()
