import pandas as pd
import json
import re

def map_vehicle_type(val, name=''):
    text = f"{val or ''} {name or ''}".lower()
    if any(k in text for k in ['utv', 'atv', 'sxs', 'side by side', 'quad']):
        return 'UTV/ATV'
    if any(k in text for k in ['dirt', 'off-road', 'offroad', 'motocross', 'enduro', 'dual sport', 'adventure', 'trials', 'mx']):
        return 'Dirt Bike'
    if any(k in text for k in ['street', 'sport', 'sportbike', 'cruiser', 'v-twin', 'harley', 'touring', 'scooter', 'chopper', 'custom', 'audio', 'speaker']):
        return 'Street Bike'
    return 'Street Bike'

def process_fin_excel():
    print("Reading fin.xlsx...")
    df = pd.read_excel('fin.xlsx')
    
    formatted_rows = []
    
    for idx, row in df.iterrows():
        name = str(row.get('Product Name', '')).strip()
        v_type_raw = str(row.get('Vehicle Type', '')).strip()
        v_type = map_vehicle_type(v_type_raw, name)
        
        makes = str(row.get('Compatible Bike Makes', '')).strip()
        if not makes or makes.lower() in ('nan', 'none', ''):
            makes = str(row.get('Brand', '')).strip() or 'Universal'
            
        models = str(row.get('Compatible Bike Models', '')).strip()
        if not models or models.lower() in ('nan', 'none', ''):
            models = name

        year_range = str(row.get('Fitment Year / Range', '')).strip()
        if not year_range or year_range.lower() in ('nan', 'none', ''):
            year_range = '1995 - 2025'

        primary_img = str(row.get('Primary Image URL', '')).strip()
        if primary_img.lower() in ('nan', 'none'): primary_img = ''

        all_imgs_raw = str(row.get('All Image URLs', '')).strip()
        if all_imgs_raw.lower() in ('nan', 'none'): all_imgs_raw = ''

        # Split all image URLs by semicolon or comma
        urls_list = []
        if all_imgs_raw:
            parts = [p.strip() for p in re.split(r'[;,]', all_imgs_raw) if p.strip()]
            for p in parts:
                if p not in urls_list:
                    urls_list.append(p)
        
        if primary_img and primary_img not in urls_list:
            urls_list.insert(0, primary_img)

        # Create gallery images JSON and semicolon delimited string
        gallery_images_json = json.dumps(urls_list)
        all_image_urls_str = " ; ".join(urls_list)

        r_dict = {
            'SKU': str(row.get('SKU Number', '')).strip(),
            'Product Name': name,
            'Brand': str(row.get('Brand', '')).strip(),
            'Category': str(row.get('Category', '')).strip(),
            'Vehicle Type': v_type,
            'Specific Product Type': str(row.get('Specific Product Type', '')).strip() or 'Tires',
            'Compatible Bike Makes': makes,
            'Compatible Bike Models': models,
            'Fitment Year / Range': year_range,
            'Item Number': str(row.get('Item Number', '')).strip(),
            'Retail Price': row.get('Retail Price'),
            'Was Price / MSRP': row.get('Was Price / MSRP'),
            'Savings': row.get('Savings'),
            'Rating': row.get('Rating', 0),
            'Review Count': row.get('Review Count', 0),
            'Fitment Vehicle': row.get('Fitment Vehicle'),
            'Fitment Disclaimer': row.get('Fitment Disclaimer'),
            'Front Tire Fitment': row.get('Front Tire Fitment'),
            'Rear Tire Fitment': row.get('Rear Tire Fitment'),
            'Wheel Locations': row.get('Wheel Locations'),
            'Available Sizes Count': row.get('Available Sizes Count'),
            'Available Sizes': row.get('Available Sizes'),
            'Total Part Numbers': row.get('Total Part Numbers'),
            'Image Name': row.get('Image Name'),
            'Primary Image URL': primary_img,
            'All Image URLs': all_image_urls_str,
            'Gallery Images (JSON)': gallery_images_json,
            'Description': row.get('Description'),
            'Specs & Features': row.get('Specs & Features'),
            'URL': row.get('URL'),
            'Status': row.get('Status')
        }
        formatted_rows.append(r_dict)

    res_df = pd.DataFrame(formatted_rows)
    out_file = 'fin_formatted_with_all_images.csv'
    res_df.to_csv(out_file, index=False, encoding='utf-8')
    print(f"Exported {len(res_df)} rows to '{out_file}'.")
    
    # Print sample row image fields
    print("\nSample image output for row 0:")
    print("Primary Image URL:", res_df.iloc[0]['Primary Image URL'])
    print("All Image URLs:", res_df.iloc[0]['All Image URLs'])
    print("Gallery Images (JSON):", res_df.iloc[0]['Gallery Images (JSON)'])

if __name__ == '__main__':
    process_fin_excel()
