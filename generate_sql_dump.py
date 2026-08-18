import mysql.connector
import os

def export_sql():
    conn = mysql.connector.connect(
        host='127.0.0.1',
        user='root',
        password='',
        database='americamotor'
    )
    cursor = conn.cursor(dictionary=True)
    
    tables = ['categories', 'products', 'product_variants', 'product_fitments']
    out_path = os.path.join(os.path.dirname(__file__), 'americamotor_master_dump.sql')
    
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write("-- America Motor Cycle Tire - Master Database Dump\n")
        f.write("SET FOREIGN_KEY_CHECKS=0;\n\n")
        
        for table in tables:
            cursor.execute(f"SELECT * FROM `{table}`")
            rows = cursor.fetchall()
            print(f"Table `{table}`: {len(rows)} rows")
            
            if not rows:
                continue
                
            cols = list(rows[0].keys())
            cols_str = "`, `".join(cols)
            
            f.write(f"-- Dumping data for table `{table}`\n")
            f.write(f"TRUNCATE TABLE `{table}`;\n")
            f.write(f"LOCK TABLES `{table}` WRITE;\n")
            
            # Write in chunks of 50
            for i in range(0, len(rows), 50):
                chunk = rows[i:i+50]
                values_list = []
                for row in chunk:
                    row_vals = []
                    for col in cols:
                        val = row[col]
                        if val is None:
                            row_vals.append("NULL")
                        elif isinstance(val, (int, float)):
                            row_vals.append(str(val))
                        elif isinstance(val, bool):
                            row_vals.append("1" if val else "0")
                        else:
                            val_str = str(val).replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n").replace("\r", "\\r")
                            row_vals.append(f"'{val_str}'")
                    values_list.append("(" + ", ".join(row_vals) + ")")
                
                f.write(f"INSERT INTO `{table}` (`{cols_str}`) VALUES\n" + ",\n".join(values_list) + ";\n")
            
            f.write("UNLOCK TABLES;\n\n")
            
        f.write("SET FOREIGN_KEY_CHECKS=1;\n")
        
    print(f"SUCCESS! Master SQL File created at: {out_path}")
    print(f"File size: {os.path.getsize(out_path) / (1024*1024):.2f} MB")

if __name__ == '__main__':
    export_sql()
