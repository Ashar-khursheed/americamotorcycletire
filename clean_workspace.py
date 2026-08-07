import os

files_to_remove = [
    'export_exact_mysql_csv.py', 'export_fin_all_images.py', 'export_sql_with_all_images.py',
    'convert_images_to_storage.py', 'export_csv_storage_images.py', 'generate_perfect_import_csv.py',
    'generate_full_url_files.py', 'generate_single_quote_csv.py', 'generate_sql_dumps.py',
    'import_fin_data.py', 'import_live.py', 'parse_and_export_products_sql.py',
    'parse_sql.py', 'inspect_datasets.py', 'test_sql_parse.py', 'build_master_combined_dataset.py',
    'emergency_fix_null_images.sql', 'import_all_gallery_images.sql', 'update_all_gallery_images.sql',
    'update_gallery_images.sql', 'update_storage_images.sql', 'UPDATE_LIVE_FULL_URLS.sql',
    'import_for_phpmyadmin_products.csv', 'fin_formatted_storage_images.csv',
    'products_full_url_import.csv', 'products_perfect_import.csv', 'products_single_quotes_import.csv',
    'products_sql_formatted_export.csv', 'all_products_live_export.csv'
]

removed_count = 0
for f in files_to_remove:
    if os.path.exists(f):
        try:
            os.remove(f)
            removed_count += 1
        except Exception as e:
            print(f"Skipped {f}: {e}")

print(f"Cleaned up {removed_count} temporary files!")
