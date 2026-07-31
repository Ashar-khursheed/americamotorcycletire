<?php

namespace Database\Seeders;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductAttributeValue;
use App\Models\ProductFitment;
use App\Models\SiteSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Site Settings
        $settings = [
            'site_name' => 'BMG CYCLES',
            'site_tagline' => 'REPAIR & SERVICE SPECIALISTS',
            'contact_phone' => '408-591-8484',
            'contact_email' => 'tennis2016@yahoo.com',
            'contact_address' => '3541 YALE WAY FREMONT, CA 94538',
            'announcement_bar' => 'FREE SHIPPING ON ORDERS OVER $99 | REPAIR & SERVICE SPECIALISTS',
            'hero_title' => 'MOTORCYCLE TIRES',
            'hero_subtitle' => 'REPAIR & SERVICE SPECIALISTS',
            'hero_description' => 'Professional motorcycle repair, maintenance, and tire service. Quality work for all makes & models.',
        ];

        foreach ($settings as $key => $val) {
            SiteSetting::updateOrCreate(['key' => $key], ['value' => $val]);
        }

        // 2. Brands
        $brandNames = ['Dunlop', 'Michelin', 'Pirelli', 'Bridgestone', 'Metzeler', 'Shoei', 'PERFORMANCE MACHINE'];
        foreach ($brandNames as $bName) {
            Brand::updateOrCreate(
                ['slug' => Str::slug($bName)],
                ['name' => $bName, 'is_active' => true]
            );
        }

        // 3. Pages
        Page::updateOrCreate(
            ['slug' => 'about-us'],
            [
                'title' => 'About BMG CYCLES',
                'content' => 'At BMG CYCLES, we are passionate about two wheels. With over 15+ years of industry experience and more than 50,000+ tires installed, our master technicians deliver precision wheel balancing, custom suspension tuning, and high-performance tire fitments.',
                'is_active' => true
            ]
        );

        Page::updateOrCreate(
            ['slug' => 'services'],
            [
                'title' => 'Repair & Service Protocol',
                'content' => 'Comprehensive service protocols including Tire Fit & Balance, Brakes & Suspension, Chain & Sprockets, Wheel Alignment, and Full Engine Diagnostics.',
                'is_active' => true
            ]
        );

        Page::updateOrCreate(
            ['slug' => 'contact-us'],
            [
                'title' => 'Location & Contact',
                'content' => 'Visit our shop at 3541 YALE WAY FREMONT, FREMONT, CA 94538 or call us at 408-591-8484.',
                'is_active' => true
            ]
        );

        // 4. Categories
        $catTires = Category::updateOrCreate(
            ['slug' => 'motorcycle-tires'],
            [
                'name' => 'Motorcycle Tires',
                'description' => 'High performance street, touring, cruiser, and racing motorcycle tires.',
                'image_url' => 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop',
                'is_active' => true,
            ]
        );

        $catHelmets = Category::updateOrCreate(
            ['slug' => 'helmets-and-gear'],
            [
                'name' => 'Helmets & Gear',
                'description' => 'DOT & ECE certified full-face, modular, and open-face helmets.',
                'image_url' => 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=800&auto=format&fit=crop',
                'is_active' => true,
            ]
        );

        $catAccessories = Category::updateOrCreate(
            ['slug' => 'parts-and-accessories'],
            [
                'name' => 'Parts & Accessories',
                'description' => 'Performance exhausts, brake pads, filters, and synthetic oil.',
                'image_url' => 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop',
                'is_active' => true,
            ]
        );

        // 5. Attributes
        $attrSize = Attribute::firstOrCreate(['slug' => 'tyre_size'], ['name' => 'Tyre Size', 'type' => 'select', 'is_filterable' => true]);
        $valSize1 = AttributeValue::firstOrCreate(['attribute_id' => $attrSize->id, 'value' => '180/55ZR17'], ['label' => '180/55ZR17 Rear']);
        $valSize2 = AttributeValue::firstOrCreate(['attribute_id' => $attrSize->id, 'value' => '120/70ZR17'], ['label' => '120/70ZR17 Front']);
        $valSize3 = AttributeValue::firstOrCreate(['attribute_id' => $attrSize->id, 'value' => '190/55ZR17'], ['label' => '190/55ZR17 Rear']);
        $valSize4 = AttributeValue::firstOrCreate(['attribute_id' => $attrSize->id, 'value' => '160/60ZR17'], ['label' => '160/60ZR17 Rear']);

        $attrSpeed = Attribute::firstOrCreate(['slug' => 'speed_rating'], ['name' => 'Speed Rating', 'type' => 'select', 'is_filterable' => true]);
        $valSpeedW = AttributeValue::firstOrCreate(['attribute_id' => $attrSpeed->id, 'value' => '(W) 168+ mph'], ['label' => '(W) 168+ mph']);
        $valSpeedV = AttributeValue::firstOrCreate(['attribute_id' => $attrSpeed->id, 'value' => 'V 149 mph'], ['label' => 'V 149 mph']);
        $valSpeedH = AttributeValue::firstOrCreate(['attribute_id' => $attrSpeed->id, 'value' => 'H 130 mph'], ['label' => 'H 130 mph']);

        $attrRim = Attribute::firstOrCreate(['slug' => 'rim_size'], ['name' => 'Rim Size', 'type' => 'select', 'is_filterable' => true]);
        $valRim17 = AttributeValue::firstOrCreate(['attribute_id' => $attrRim->id, 'value' => '17 Inch'], ['label' => '17 Inch']);
        $valRim19 = AttributeValue::firstOrCreate(['attribute_id' => $attrRim->id, 'value' => '19 Inch'], ['label' => '19 Inch']);

        $attrPosition = Attribute::firstOrCreate(['slug' => 'position'], ['name' => 'Position', 'type' => 'select', 'is_filterable' => true]);
        $valFront = AttributeValue::firstOrCreate(['attribute_id' => $attrPosition->id, 'value' => 'Front'], ['label' => 'Front Tire']);
        $valRear = AttributeValue::firstOrCreate(['attribute_id' => $attrPosition->id, 'value' => 'Rear'], ['label' => 'Rear Tire']);

        // 6. Sample Products
        $productsData = [
            [
                'sku' => '0201-2382',
                'name' => 'PM One-Piece Aluminum Sierra Wheel',
                'brand' => 'PERFORMANCE MACHINE',
                'price' => 1999.95,
                'compare_at_price' => 2199.95,
                'category_id' => $catAccessories->id,
                'primary_image' => 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop',
                'attributes' => [$valRim19, $valFront],
                'description' => 'PM Wheel - Sierra - Front - Dual Disc w/o ABS - Black. Premium forged 1-piece aluminum construction.',
                'fitments' => [
                    ['year' => '2023', 'make' => 'Harley-Davidson', 'model' => 'FLHT Road Glide', 'position' => 'Front', 'vendor_part_number' => '1260-7806R-XRA-SMB'],
                    ['year' => '2023', 'make' => 'Harley-Davidson', 'model' => 'FLHX Road King Special', 'position' => 'Front', 'vendor_part_number' => '1260-7806R-XRA-SMB'],
                    ['year' => '2022', 'make' => 'Harley-Davidson', 'model' => 'FLRT Freewheeler', 'position' => 'Front', 'vendor_part_number' => '1260-7806R-XRA-SMB'],
                    ['year' => '2022', 'make' => 'Harley-Davidson', 'model' => 'FLTRX Road Glide Standard', 'position' => 'Front', 'vendor_part_number' => '1260-7806R-XRA-SMB'],
                ]
            ],
            [
                'sku' => 'MOT-1001',
                'name' => 'Dunlop Sportmax Roadsmart IV Tire',
                'brand' => 'Dunlop',
                'price' => 219.95,
                'compare_at_price' => 259.95,
                'category_id' => $catTires->id,
                'primary_image' => 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop',
                'attributes' => [$valSize1, $valSpeedW, $valRim17, $valRear],
                'description' => 'The Dunlop Sportmax Roadsmart IV raises the bar in sport-touring performance with enhanced wet grip and extended mileage.',
                'fitments' => [
                    ['year' => '2023', 'make' => 'Honda', 'model' => 'CBR1000RR', 'position' => 'Rear', 'vendor_part_number' => 'DUN-4501'],
                    ['year' => '2022', 'make' => 'Yamaha', 'model' => 'YZF-R1', 'position' => 'Rear', 'vendor_part_number' => 'DUN-4501'],
                ]
            ],
            [
                'sku' => 'MOT-1002',
                'name' => 'Michelin Commander III Cruiser Tire',
                'brand' => 'Michelin',
                'price' => 244.99,
                'compare_at_price' => 289.00,
                'category_id' => $catTires->id,
                'primary_image' => 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop',
                'attributes' => [$valSize2, $valSpeedV, $valRim17, $valFront],
                'description' => 'Unrivaled tread life and wet weather stability engineered specifically for V-Twin cruisers and touring motorcycles.',
                'fitments' => [
                    ['year' => '2023', 'make' => 'Harley-Davidson', 'model' => 'FLHT Road Glide', 'position' => 'Front', 'vendor_part_number' => 'MCH-3302'],
                    ['year' => '2021', 'make' => 'Harley-Davidson', 'model' => 'FLHX Road King Special', 'position' => 'Front', 'vendor_part_number' => 'MCH-3302'],
                ]
            ],
            [
                'sku' => 'MOT-1003',
                'name' => 'Pirelli Diablo Rosso IV SuperSport Tire',
                'brand' => 'Pirelli',
                'price' => 289.95,
                'compare_at_price' => 325.00,
                'category_id' => $catTires->id,
                'primary_image' => 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=800&auto=format&fit=crop',
                'attributes' => [$valSize3, $valSpeedW, $valRim17, $valRear],
                'description' => 'The flagship hyper-sport tire delivering uncompromising cornering grip and track-level feedback on the street.',
                'fitments' => [
                    ['year' => '2023', 'make' => 'Yamaha', 'model' => 'YZF-R1', 'position' => 'Rear', 'vendor_part_number' => 'PIR-9901'],
                    ['year' => '2022', 'make' => 'BMW', 'model' => 'S1000RR', 'position' => 'Rear', 'vendor_part_number' => 'PIR-9901'],
                ]
            ],
            [
                'sku' => 'MOT-1004',
                'name' => 'Bridgestone Battlax Hypersport S22',
                'brand' => 'Bridgestone',
                'price' => 198.50,
                'compare_at_price' => 235.00,
                'category_id' => $catTires->id,
                'primary_image' => 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop',
                'attributes' => [$valSize4, $valSpeedH, $valRim17, $valRear],
                'description' => 'Multi-compound technology designed to maximize road contact and confidence in both wet and dry riding conditions.',
                'fitments' => [
                    ['year' => '2021', 'make' => 'Kawasaki', 'model' => 'Ninja ZX-6R', 'position' => 'Rear', 'vendor_part_number' => 'BGS-2201'],
                ]
            ],
        ];

        foreach ($productsData as $pData) {
            $product = Product::updateOrCreate(
                ['slug' => Str::slug($pData['name'])],
                [
                    'sku' => $pData['sku'],
                    'name' => $pData['name'],
                    'brand' => $pData['brand'],
                    'price' => $pData['price'],
                    'compare_at_price' => $pData['compare_at_price'],
                    'category_id' => $pData['category_id'],
                    'stock_quantity' => rand(15, 50),
                    'short_description' => $pData['description'],
                    'description' => $pData['description'] . ' Built with ultra-durable compounds and optimized groove placement.',
                    'primary_image' => $pData['primary_image'],
                    'is_active' => true,
                    'is_featured' => true,
                ]
            );

            foreach ($pData['attributes'] as $valObj) {
                ProductAttributeValue::firstOrCreate([
                    'product_id' => $product->id,
                    'attribute_id' => $valObj->attribute_id,
                    'attribute_value_id' => $valObj->id,
                ]);
            }

            if (isset($pData['fitments'])) {
                foreach ($pData['fitments'] as $fit) {
                    ProductFitment::firstOrCreate([
                        'product_id' => $product->id,
                        'year' => $fit['year'],
                        'make' => $fit['make'],
                        'model' => $fit['model'],
                        'position' => $fit['position'],
                    ], [
                        'vendor_part_number' => $fit['vendor_part_number'] ?? null,
                    ]);
                }
            }
        }
    }
}
