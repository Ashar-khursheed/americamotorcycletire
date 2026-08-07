import urllib.request

url = "https://www.cyclegear.com/_a/product_images/2092/9766/pirelli_diablo_supercorsa_spv4_tires.jpg"
req = urllib.request.Request(
    url, 
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
)

try:
    with urllib.request.urlopen(req) as response:
        data = response.read()
        print(f"Successfully downloaded image! Size: {len(data)} bytes")
except Exception as e:
    print(f"Download failed: {e}")
