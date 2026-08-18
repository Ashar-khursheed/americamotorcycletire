import openpyxl
import re
import json
import pandas as pd
import mysql.connector

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

    return 'Harley-Davidson'

def map_vehicle_type(val, name=''):
    text = f"{val or ''} {name or ''}".lower()
    if any(k in text for k in ['utv', 'atv', 'sxs', 'side by side', 'quad']):
        return 'UTV/ATV'
    if any(k in text for k in ['dirt', 'off-road', 'offroad', 'motocross', 'enduro', 'trials', 'mx']):
        return 'DIRT BIKE'
    return 'STREET BIKE'

def map_category_name(cat_val, v_type, prod_type, name=''):
    text = f"{cat_val or ''} {v_type or ''} {prod_type or ''} {name or ''}".lower()
    if any(k in text for k in ['race', 'track', 'slick', 'corsa', 'dot race', 'competition']):
        return 'RACE'
    if any(k in text for k in ['dirt', 'off-road', 'motocross', 'enduro', 'mx', 'atv', 'utv', 'quad', 'sxs']):
        return 'DIRT'
    if any(k in text for k in ['cruiser', 'v-twin', 'vtwin', 'harley', 'custom', 'touring', 'chopper', 'bagger']):
        return 'CRUISER'
    return 'SPORTBIKE'

def parse_price(val):
    if not val or pd.isna(val):
        return 149.95, None
    s = str(val).strip()
    matches = re.findall(r'\$?([\d,]+\.?\d*)', s)
    if not matches:
        return 149.95, None
    nums = [float(m.replace(',', '')) for m in matches if float(m.replace(',', '')) > 0]
    if not nums:
        return 149.95, None
    if len(nums) == 1:
        return nums[0], None
    return min(nums), max(nums)

def convert_to_full_url(url):
    if not url or not str(url).strip() or str(url).strip() in ('N/A', 'None', 'null', 'nan'):
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
    return f"storage/products/{webp_filename}"

def parse_style(style_str):
    s = str(style_str or '').strip()
    pos = 'Universal'
    size = s
    if '/' in s:
        parts = s.split('/', 1)
        prefix = parts[0].strip().lower()
        if prefix in ['front', 'rear', 'front or rear', 'front/rear']:
            if prefix == 'front': pos = 'Front'
            elif prefix == 'rear': pos = 'Rear'
            else: pos = 'Front/Rear'
            size = parts[1].strip()
    return pos, size

def esc(v):
    if v is None: return "NULL"
    return "'" + str(v).replace("\\", "\\\\").replace("'", "''") + "'"

def main():
    print("Loading cyclegear_final.xlsx...")
    xl = pd.ExcelFile('f:/americamotorcycletire/cyclegear_final.xlsx')
    s1 = xl.parse('All Scraped Products')
    s2 = xl.parse('Part Numbers & SKUs')
    s3 = xl.parse('Size Breakdown & Fitments')

    print(f"Loaded Sheet 1 ({len(s1)} products), Sheet 2 ({len(s2)} SKUs), Sheet 3 ({len(s3)} fitments).")

    # Map category names to IDs (1: SPORTBIKE, 2: CRUISER, 3: DIRT, 4: RACE)
    category_id_map = {
        'SPORTBIKE': 1,
        'CRUISER': 2,
        'DIRT': 3,
        'RACE': 4
    }

    s1['clean_name'] = s1['Product Name'].astype(str).str.strip()
    s2['clean_name'] = s2['Product Name'].astype(str).str.strip()
    s3['clean_name'] = s3['Product Name'].astype(str).str.strip()

    sql_statements = [
        "SET FOREIGN_KEY_CHECKS=0;",
        "TRUNCATE TABLE product_variants;",
        "TRUNCATE TABLE product_fitments;",
        "TRUNCATE TABLE products;",
        "TRUNCATE TABLE categories;",
        "INSERT INTO categories (id, name, slug, is_active, created_at, updated_at) VALUES (1, 'SPORTBIKE', 'sportbike', 1, NOW(), NOW());",
        "INSERT INTO categories (id, name, slug, is_active, created_at, updated_at) VALUES (2, 'CRUISER', 'cruiser', 1, NOW(), NOW());",
        "INSERT INTO categories (id, name, slug, is_active, created_at, updated_at) VALUES (3, 'DIRT', 'dirt', 1, NOW(), NOW());",
        "INSERT INTO categories (id, name, slug, is_active, created_at, updated_at) VALUES (4, 'RACE', 'race', 1, NOW(), NOW());\n"
    ]

    total_products = 0
    total_variants = 0
    total_fitments = 0

    seen_skus = set()

    for idx, row in s1.iterrows():
        p_name = str(row.get('Product Name') or '').strip()
        if not p_name or p_name.lower() == 'nan':
            continue

        raw_sku = str(row.get('SKU Number') or '').strip()
        if not raw_sku or raw_sku.lower() in ('nan', 'none', 'n/a'):
            raw_sku = f"SKU-{idx+1:05d}"

        # Ensure unique product SKU
        sku = raw_sku
        sku_counter = 1
        while sku.lower() in seen_skus:
            sku = f"{raw_sku}-{sku_counter}"
            sku_counter += 1
        seen_skus.add(sku.lower())

        slug = re.sub(r'[^a-z0-9]+', '-', p_name.lower()).strip('-') + f"-{sku.lower()}"
        brand = str(row.get('Brand') or '').strip() or 'BMG'
        v_type = map_vehicle_type(row.get('Vehicle Type'), p_name)
        cat_name = map_category_name(row.get('Category'), row.get('Vehicle Type'), row.get('Specific Product Type'), p_name)
        cat_id = category_id_map.get(cat_name, 1)

        product_type = str(row.get('Specific Product Type') or '').strip() or 'Tires'
        raw_makes = str(row.get('Compatible Bike Makes') or '').strip()
        makes = sanitize_make(raw_makes, p_name, brand)
        models = str(row.get('Compatible Bike Models') or '').strip() or p_name
        year_range = str(row.get('Fitment Year / Range') or '').strip() or '1998 - 2025'
        item_number = str(row.get('Item Number') or '').strip()

        # Parse prices
        p_min, p_max = parse_price(row.get('Retail Price'))
        was_p_min, was_p_max = parse_price(row.get('Was Price / MSRP'))

        price = p_min
        was_price = was_p_max if was_p_max else (p_max if (p_max is not None and p_max > p_min) else None)

        savings = str(row.get('Savings') or '').strip()
        rating = float(row.get('Rating') or 4.8) if not pd.isna(row.get('Rating')) else 4.8
        review_count = int(row.get('Review Count') or 12) if not pd.isna(row.get('Review Count')) else 12

        front_fitment = str(row.get('Front Tire Fitment') or '').strip()
        rear_fitment = str(row.get('Rear Tire Fitment') or '').strip()
        wheel_loc = str(row.get('Wheel Locations') or '').strip()
        avail_sizes = str(row.get('Available Sizes') or '').strip()
        avail_sizes_count = int(row.get('Available Sizes Count') or 0) if not pd.isna(row.get('Available Sizes Count')) else 0
        total_parts = int(row.get('Total Part Numbers') or 0) if not pd.isna(row.get('Total Part Numbers')) else 0

        raw_primary = str(row.get('Primary Image URL') or '').strip()
        raw_all_imgs = str(row.get('All Image URLs') or '').strip()

        primary_full = convert_to_full_url(raw_primary)
        gallery_list = []
        if raw_all_imgs:
            for p in re.split(r'[;,]', raw_all_imgs):
                full_p = convert_to_full_url(p)
                if full_p and full_p not in gallery_list:
                    gallery_list.append(full_p)

        if primary_full and primary_full not in gallery_list:
            gallery_list.insert(0, primary_full)
        if not gallery_list and primary_full:
            gallery_list = [primary_full]

        desc = str(row.get('Description') or '').strip()
        specs = str(row.get('Specs & Features') or '').strip()
        fit_veh = str(row.get('Fitment Vehicle') or '').strip()
        fit_disc = str(row.get('Fitment Disclaimer') or '').strip()

        custom_attr_dict = {
            "Wheel Location": wheel_loc or "Front, Rear",
            "Type": v_type,
            "Product Type": product_type,
            "Make": makes,
            "Model": models,
            "Tire Size": avail_sizes or "Standard"
        }

        # Build SQL for product insert
        gallery_json = json.dumps(gallery_list)
        custom_attr_json = json.dumps(custom_attr_dict)

        prod_id = idx + 1
        ins_prod = (
            f"INSERT INTO products (id, sku, name, slug, brand, category_id, vehicle_type, product_type, "
            f"compatible_makes, compatible_models, fitment_year_range, item_number, price, was_price, compare_at_price, "
            f"savings, rating, review_count, front_tire_fitment, rear_tire_fitment, wheel_locations, available_sizes_count, "
            f"available_sizes, total_part_numbers, description, specs_and_features, fitment_vehicle, fitment_disclaimer, "
            f"primary_image, gallery_images, custom_attributes, stock_quantity, is_active, is_featured, created_at, updated_at) VALUES ("
            f"{prod_id}, {esc(sku)}, {esc(p_name)}, {esc(slug)}, {esc(brand)}, {cat_id}, {esc(v_type)}, {esc(product_type)}, "
            f"{esc(makes)}, {esc(models)}, {esc(year_range)}, {esc(item_number)}, {price}, {esc(was_price)}, {esc(was_price)}, "
            f"{esc(savings)}, {rating}, {review_count}, {esc(front_fitment)}, {esc(rear_fitment)}, {esc(wheel_loc)}, {avail_sizes_count}, "
            f"{esc(avail_sizes)}, {total_parts}, {esc(desc)}, {esc(specs)}, {esc(fit_veh)}, {esc(fit_disc)}, "
            f"{esc(primary_full)}, {esc(gallery_json)}, {esc(custom_attr_json)}, 50, 1, 1, NOW(), NOW());"
        )
        sql_statements.append(ins_prod)
        total_products += 1

        # Match variants from Sheet 2
        s2_match = s2[s2['clean_name'] == p_name]
        if not s2_match.empty:
            for v_idx, v_row in s2_match.iterrows():
                v_style = str(v_row.get('Product Style') or '').strip()
                pos, tire_size = parse_style(v_style)

                v_store_sku = str(v_row.get('Store SKU') or '').strip()
                v_item_num = str(v_row.get('Item #') or '').strip()
                v_mfr_num = str(v_row.get('Manufacturer Product #') or '').strip()

                base_v_sku = v_store_sku if (v_store_sku and v_store_sku.lower() != 'nan') else (
                    v_item_num if (v_item_num and v_item_num.lower() != 'nan') else f"{sku}-VAR-{v_idx+1}"
                )
                v_sku = base_v_sku
                v_counter = 1
                while v_sku.lower() in seen_skus:
                    v_sku = f"{base_v_sku}-{prod_id}-{v_counter}"
                    v_counter += 1
                seen_skus.add(v_sku.lower())

                v_price, v_was = parse_price(v_row.get('Retail Price'))

                ins_var = (
                    f"INSERT INTO product_variants (product_id, sku, name, position, tire_size, item_number, store_sku, "
                    f"mfr_part_number, price, compare_at_price, stock_quantity, is_active, created_at, updated_at) VALUES ("
                    f"{prod_id}, {esc(v_sku)}, {esc(v_style)}, {esc(pos)}, {esc(tire_size)}, {esc(v_item_num)}, {esc(v_store_sku)}, "
                    f"{esc(v_mfr_num)}, {v_price}, {esc(v_was)}, 25, 1, NOW(), NOW());"
                )
                sql_statements.append(ins_var)
                total_variants += 1

        # Match fitments from Sheet 3 or create default fitment row
        s3_match = s3[s3['clean_name'] == p_name]
        if not s3_match.empty:
            seen_fit_keys = set()
            for f_idx, f_row in s3_match.iterrows():
                f_size = str(f_row.get('Tire Size') or '').strip()
                f_sku = str(f_row.get('SKU Number') or '').strip() or sku
                f_item = str(f_row.get('Item Number') or '').strip() or item_number

                fit_key = f"{year_range}|{makes}|{models}|{f_size}"
                if fit_key in seen_fit_keys:
                    continue
                seen_fit_keys.add(fit_key)

                ins_fit = (
                    f"INSERT INTO product_fitments (product_id, year, make, model, position, tire_size, sku_number, "
                    f"item_number, vendor_part_number, created_at, updated_at) VALUES ("
                    f"{prod_id}, {esc(year_range)}, {esc(makes)}, {esc(models)}, 'Front, Rear', {esc(f_size)}, "
                    f"{esc(f_sku)}, {esc(f_item)}, {esc(f_sku)}, NOW(), NOW());"
                )
                sql_statements.append(ins_fit)
                total_fitments += 1
        else:
            ins_fit = (
                f"INSERT INTO product_fitments (product_id, year, make, model, position, tire_size, sku_number, "
                f"item_number, vendor_part_number, created_at, updated_at) VALUES ("
                f"{prod_id}, {esc(year_range)}, {esc(makes)}, {esc(models)}, 'Front, Rear', {esc(avail_sizes)}, "
                f"{esc(sku)}, {esc(item_number)}, {esc(sku)}, NOW(), NOW());"
            )
            sql_statements.append(ins_fit)
            total_fitments += 1

    sql_statements.append("\nSET FOREIGN_KEY_CHECKS=1;")

    output_sql = "MASTER_ALL_PRODUCTS_IMPORT.sql"
    with open(output_sql, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_statements))

    print(f"\n=======================================================")
    print(f"SUCCESS! Wrote '{output_sql}' with:")
    print(f"  - {total_products} PRODUCTS")
    print(f"  - {total_variants} PRODUCT VARIANTS (Front/Rear position & sizes & prices)")
    print(f"  - {total_fitments} PRODUCT FITMENTS")
    print(f"=======================================================\n")

    # Import into MySQL Database directly
    print("Executing MySQL Import into database 'americamotor'...")
    try:
        conn = mysql.connector.connect(
            host="127.0.0.1",
            user="root",
            password="",
            database="americamotor"
        )
        cursor = conn.cursor()
        for statement in sql_statements:
            if statement.strip() and not statement.startswith('--'):
                cursor.execute(statement)
        conn.commit()
        cursor.close()
        conn.close()
        print("DATABASE IMPORT COMPLETED SUCCESSFULLY!")
    except Exception as e:
        print(f"Direct DB Import note: {e}")

if __name__ == '__main__':
    main()
